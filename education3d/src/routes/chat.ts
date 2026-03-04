// 聊天 API 路由
import { Router, Request, Response } from 'express';
import { chatWithGemini, buildSystemPrompt, ChatMessage, SceneMeta } from '@/src/services/gemini.js';

const router: ReturnType<typeof Router> = Router();

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  sceneMeta?: SceneMeta;  // 当前场景的元数据
}

/**
 * POST /api/chat
 * 与 Gemini 进行对话（流式响应）
 */
router.post('/chat', async (req: Request, res: Response) => {
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  try {
    const { message, history = [], sceneMeta }: ChatRequest = req.body;

    console.log('[Chat API] 收到请求:', { message, hasSceneMeta: !!sceneMeta });

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 心跳机制：每 15 秒发送一次 SSE 注释，防止连接被中间代理/网关判定为空闲而重置
    heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat\n\n`);
      } catch {
        if (heartbeat) clearInterval(heartbeat);
      }
    }, 15000);

    // 监听客户端断开，及时清除心跳
    req.on('close', () => {
      if (heartbeat) clearInterval(heartbeat);
    });

    // 构建消息列表，将场景元数据传递给系统提示词
    const messages: ChatMessage[] = [
      { role: 'system', content: buildSystemPrompt(sceneMeta) },
      ...history,
      { role: 'user', content: message }
    ];

    // 调用 Gemini API
    await chatWithGemini(messages, {
      onProgress: (chunk: string) => {
        res.write(`data: ${JSON.stringify({ type: 'progress', content: chunk })}\n\n`);
      },
      onComplete: (fullContent: string) => {
        if (heartbeat) clearInterval(heartbeat);
        res.write(`data: ${JSON.stringify({ type: 'complete', content: fullContent })}\n\n`);
        res.end();
      },
      onError: (error: Error) => {
        if (heartbeat) clearInterval(heartbeat);
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
        res.end();
      }
    });

  } catch (error) {
    if (heartbeat) clearInterval(heartbeat);
    console.error('Chat API Error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : '未知错误' 
      });
    }
  }
});

export default router;
