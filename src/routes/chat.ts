// 聊天 API 路由
import { Router, Request, Response } from 'express';
import { chatWithGemini, buildSystemPrompt, ChatMessage } from '@/src/services/gemini.js';

const router: ReturnType<typeof Router> = Router();

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

/**
 * POST /api/chat
 * 与 Gemini 进行对话（流式响应）
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [] }: ChatRequest = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 构建消息列表
    const messages: ChatMessage[] = [
      { role: 'system', content: buildSystemPrompt() },
      ...history,
      { role: 'user', content: message }
    ];

    // 调用 Gemini API
    await chatWithGemini(messages, {
      onProgress: (chunk: string) => {
        res.write(`data: ${JSON.stringify({ type: 'progress', content: chunk })}\n\n`);
      },
      onComplete: (fullContent: string) => {
        res.write(`data: ${JSON.stringify({ type: 'complete', content: fullContent })}\n\n`);
        res.end();
      },
      onError: (error: Error) => {
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
        res.end();
      }
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : '未知错误' 
      });
    }
  }
});

export default router;
