// 生成 API 路由
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { buildSystemPrompt, buildUserPrompt } from '@/src/services/promptEngine.js';
import { generateVisualization } from '@/src/services/minimax.js';
import { extractContent, extractAestheticJSON, extractInteractionList } from '@/src/utils/codeExtractor.js';
import { validateGeneratedCode, autoFixCode } from '@/src/utils/validator.js';
import { saveHtmlOutput } from '@/src/services/outputsStore.js';
import type { UserProfile } from '@/src/types.js';

const router: ReturnType<typeof express.Router> = express.Router();

interface GenerateRequest {
  concept: string;
  userProfile?: UserProfile;
}

/**
 * POST /api/generate
 * 生成 3D 可视化（SSE 流式响应）
 */
router.post('/generate', async (req: Request, res: Response) => {
  const { concept, userProfile } = req.body as GenerateRequest;

  // 若前端未传入 userProfile，则使用空对象作为默认值，避免下游函数收到 undefined
  const resolvedProfile: Partial<UserProfile> = userProfile ?? {};

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (type: string, data: any) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  // 心跳机制：每 15 秒发送一次 SSE 注释，防止连接被中间代理/网关判定为空闲而重置
  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat\n\n`);
    } catch {
      // 连接已关闭，清除心跳
      clearInterval(heartbeat);
    }
  }, 15000);

  // 监听客户端断开，及时清除心跳
  req.on('close', () => {
    clearInterval(heartbeat);
  });

  try {
    sendEvent('progress', { message: '正在构建提示词...' });

    // 将用户画像注入 prompt 构建函数
    const systemPrompt = buildSystemPrompt(resolvedProfile);
    const userPrompt = buildUserPrompt(concept, resolvedProfile);

    sendEvent('progress', { message: '正在调用 AI 生成器...' });

    let accumulatedContent = '';

    await generateVisualization(systemPrompt, userPrompt, {
      onProgress: (chunk: string) => {
        accumulatedContent += chunk;
        // 每收到 100 个字符发送一次进度更新
        if (accumulatedContent.length % 100 < chunk.length) {
          sendEvent('progress', { message: `生成中... (${accumulatedContent.length} 字符)` });
        }
      },

      onComplete: async (fullContent: string) => {
        clearInterval(heartbeat);
        // 【黑匣子】将 AI 原始响应全量落盘，用于调试和问题追溯
        try {
          const rawOutputPath = path.join(process.cwd(), 'outputs', 'raw_ai_response.txt');
          fs.writeFileSync(rawOutputPath, fullContent, 'utf8');
          console.log(`[黑匣子] AI 原始响应已备份至: ${rawOutputPath}`);
        } catch (writeError) {
          // 落盘失败不应阻断主流程，仅记录警告
          console.warn('[黑匣子] 原始响应备份失败:', writeError);
        }

        sendEvent('progress', { message: '正在提取和验证代码...' });

        // 提取内容
        const extracted = extractContent(fullContent);

        if (!extracted.htmlCode) {
          sendEvent('error', { message: '无法从 AI 响应中提取 HTML 代码' });
          res.end();
          return;
        }

        // 验证代码
        const validation = validateGeneratedCode(extracted.htmlCode);

        if (!validation.isValid) {
          sendEvent('progress', { message: '尝试自动修复安全问题...' });
          extracted.htmlCode = autoFixCode(extracted.htmlCode);

          // 重新验证
          const revalidation = validateGeneratedCode(extracted.htmlCode);
          if (!revalidation.isValid) {
            sendEvent('error', {
              message: '生成的代码存在安全问题',
              errors: revalidation.errors
            });
            res.end();
            return;
          }
        }

        // 发送警告（如果有）
        if (validation.warnings.length > 0) {
          sendEvent('progress', {
            message: '代码验证通过（有警告）',
            warnings: validation.warnings
          });
        }

        // 解析美学分析
        const aestheticAnalysis = extracted.aestheticAnalysis
          ? extractAestheticJSON(extracted.aestheticAnalysis)
          : null;

        // 解析交互指南
        const interactionGuide = extracted.interactionGuide
          ? extractInteractionList(extracted.interactionGuide)
          : [];

        sendEvent('progress', { message: '正在保存生成结果...' });

        let htmlSha256: string;

        try {
          htmlSha256 = await saveHtmlOutput(extracted.htmlCode);
        } catch (error) {
          console.error('保存生成内容失败:', error);
          sendEvent('error', { message: '保存生成内容失败' });
          res.end();
          return;
        }

        // 发送完成事件
        sendEvent('complete', {
          htmlSha256,
          aestheticAnalysis,
          educationalRationale: extracted.educationalRationale,
          interactionGuide,
        });

        res.end();
      },

      onError: (error: Error) => {
        clearInterval(heartbeat);
        sendEvent('error', { message: error.message });
        res.end();
      }
    });

  } catch (error) {
    clearInterval(heartbeat);
    console.error('Generation error:', error);
    sendEvent('error', {
      message: error instanceof Error ? error.message : '生成过程发生错误'
    });
    res.end();
  }
});

export default router;
