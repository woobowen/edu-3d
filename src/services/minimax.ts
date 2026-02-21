// MiniMax/DMX 代码生成 API 调用服务
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import https from 'https';

// 强制使用绝对工作目录加载 .env，防止路径丢失
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// 创建持久化 HTTPS Agent，防止 ERR_STREAM_PREMATURE_CLOSE 早退 BUG
// keepAlive: 复用 TCP 连接，避免流式传输中途被断开
// timeout: 与客户端超时对齐，设为 5 分钟
// rejectUnauthorized: 兼容部分代理网关的自签名证书
const agent = new https.Agent({
  keepAlive: true,
  timeout: 300000,
  rejectUnauthorized: false,
});

interface DMXCodeConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

// 统一使用 DMX_API_KEY / DMX_BASE_URL / CODE_MODEL，清除所有旧 MINIMAX_ 引用
// MAX_TOKENS: 从环境变量读取，解锁长文本输出上限，默认 64000 支持 2w+ 字符代码生成
const config: DMXCodeConfig = {
  baseUrl: process.env.DMX_BASE_URL || 'https://vip.dmxapi.com/v1',
  apiKey: process.env.DMX_API_KEY || '',
  model: process.env.CODE_MODEL || '',
  temperature: 0.7,
  maxTokens: parseInt(process.env.MAX_TOKENS || '64000', 10),
};

// 验证必要配置
if (!config.apiKey) {
  console.error('❌ 错误：未设置 DMX_API_KEY 环境变量');
  console.error('请创建 .env 文件并设置 DMX_API_KEY=your-api-key');
  process.exit(1);
}

if (!config.model) {
  console.error('❌ 错误：未设置 CODE_MODEL 环境变量');
  console.error('请在 .env 文件中设置 CODE_MODEL=your-code-model-name');
  process.exit(1);
}

// 创建 OpenAI 兼容客户端，强制注入超时、重试抗压参数及持久化 HTTPS Agent
// timeout: 300000ms (5分钟)，防止长代码生成（2w+ 字符）时连接超时被中断
const client = new OpenAI({
  baseURL: config.baseUrl,
  apiKey: config.apiKey,
  timeout: 300000,   // 5 分钟超时，防止大模型长时间生成被中断
  maxRetries: 3,     // 最多重试 3 次，提升抗压稳定性
  httpAgent: agent,  // 注入持久化 Agent，防止 ERR_STREAM_PREMATURE_CLOSE
  defaultHeaders: {
    'Connection': 'keep-alive', // 强制保持长连接，避免流式传输被提前关闭
  },
});

export interface StreamCallbacks {
  onProgress: (chunk: string) => void;
  onComplete: (fullContent: string) => Promise<void> | void;
  onError: (error: Error) => void;
}

/**
 * 调用代码生成模型进行流式生成
 * 注意：stream: true 为必须项，确保前端能实时看到 2w+ 字符的生成进度
 * max_tokens 使用 config.maxTokens（默认 64000），解锁长文本输出上限
 */
export async function generateVisualization(
  systemPrompt: string,
  userPrompt: string,
  callbacks: StreamCallbacks
): Promise<void> {
  let fullContent = '';

  try {
    // stream: true 开启流式模式，前端可实时接收长代码生成进度，避免等待超时
    const stream = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        callbacks.onProgress(content);
      }
    }

    await callbacks.onComplete(fullContent);
  } catch (error) {
    console.error('DMX Code Model API Error:', error);
    callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
  }
}

/**
 * 非流式调用（用于测试）
 * 注意：长文本生成场景建议使用 generateVisualization 流式版本
 */
export async function generateVisualizationSync(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: false,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('DMX Code Model API Error:', error);
    throw error;
  }
}
