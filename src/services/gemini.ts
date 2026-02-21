// Gemini/DMX 逻辑路由 API 调用服务
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import https from 'https';

// 强制使用绝对工作目录加载 .env，严禁相对路径猜测
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

interface DMXLogicConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

// 统一使用 DMX_API_KEY / DMX_BASE_URL / LOGIC_MODEL，清除所有旧 GEMINI_ 引用
const config: DMXLogicConfig = {
  baseUrl: process.env.DMX_BASE_URL || 'https://vip.dmxapi.com/v1',
  apiKey: process.env.DMX_API_KEY || '',
  model: process.env.LOGIC_MODEL || '',
  temperature: 0.7,
  maxTokens: 2000
};

// 验证必要配置
if (!config.apiKey) {
  console.warn('⚠️ 警告：未设置 DMX_API_KEY 环境变量');
}

if (!config.model) {
  console.warn('⚠️ 警告：未设置 LOGIC_MODEL 环境变量');
}

// 创建 OpenAI 兼容客户端，强制注入超时、重试抗压参数及持久化 HTTPS Agent
const client = new OpenAI({
  baseURL: config.baseUrl,
  apiKey: config.apiKey,
  timeout: 300000,   // 5 分钟超时，防止逻辑判断层长时间挂起
  maxRetries: 3,     // 最多重试 3 次，提升抗压稳定性
  httpAgent: agent,  // 注入持久化 Agent，防止 ERR_STREAM_PREMATURE_CLOSE
  defaultHeaders: {
    'Connection': 'keep-alive', // 强制保持长连接，避免流式传输被提前关闭
  },
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamCallbacks {
  onProgress: (chunk: string) => void;
  onComplete: (fullContent: string) => Promise<void> | void;
  onError: (error: Error) => void;
}

/**
 * 调用逻辑路由模型进行对话（流式）
 */
export async function chatWithGemini(
  messages: ChatMessage[],
  callbacks: StreamCallbacks
): Promise<void> {
  let fullContent = '';

  try {
    const stream = await client.chat.completions.create({
      model: config.model,
      messages: messages,
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
    console.error('DMX Logic Model API Error:', error);
    callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
  }
}

/**
 * 非流式调用
 */
export async function chatWithGeminiSync(
  messages: ChatMessage[]
): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: config.model,
      messages: messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: false,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('DMX Logic Model API Error:', error);
    throw error;
  }
}

/**
 * 构建系统提示词（模型控制模式）
 */
export function buildSystemPrompt(): string {
  return `你是 EduVibe 3D 的智能教学助手。你的核心任务是**控制3D模型**并**清晰解释教学内容**。

# 核心原则

1. **教学优先**：控制操作必须服务于教学目的
2. **清晰解释**：每次操作都要有教学价值的解释
3. **智能理解**：理解用户的隐含意图

# 控制指令格式

只返回JSON，不要包含markdown代码块：

{"action":"操作类型","explanation":"教学说明","params":{}}

# 可用操作

## setParameter - 修改参数
{"action":"setParameter","explanation":"增加到5层","params":{"name":"num-layers","value":5}}

## switchVariant - 切换变体
{"action":"switchVariant","explanation":"切换到中序遍历","params":{"variant":"inorder"}}

变体选项：preorder（前序）、inorder（中序）、postorder（后序）

## compareVariants - 对比遍历（核心功能！）
**重要**：当用户要求"对比"、"比较"、"区别"、"不同"时必须使用此操作！

此操作会启动对比模式：
1. 左右并排显示两棵相同的二叉树
2. 同步逐步演示两种遍历
3. 用不同颜色高亮当前访问的节点
4. 清晰标注每种遍历的名称和规则

**必须包含 comparisonDetails**：
{
  "action": "compareVariants",
  "explanation": "对比前序与中序遍历",
  "params": {
    "variants": ["preorder", "inorder"],
    "comparisonDetails": {
      "variant1": {"name": "前序遍历", "rule": "根→左→右", "color": "#3b82f6"},
      "variant2": {"name": "中序遍历", "rule": "左→根→右", "color": "#10b981"},
      "keyDifference": "前序先访问根节点再遍历子树；中序先遍历左子树再访问根节点。对于BST，中序遍历得到有序序列。",
      "stepByStep": [
        "第1步：前序从根节点5开始，中序从最左叶子节点1开始",
        "第2步：前序访问左子树根节点3，中序访问节点3",
        "第3步：前序访问最左叶子1，中序访问根节点5"
      ]
    }
  }
}

## playDemo - 播放演示
{"action":"playDemo","explanation":"开始演示"}

## resetDemo - 重置
{"action":"resetDemo","explanation":"重置到初始状态"}

## stepDemo - 单步演示
{"action":"stepDemo","explanation":"执行下一步","params":{"direction":"next"}}

## explain - 解释概念
{"action":"explain","explanation":"概念解释内容"}

# 快速响应示例

"更复杂" → {"action":"setParameter","explanation":"已增加复杂度","params":{"name":"num-layers","value":5}}
"重来" → {"action":"resetDemo","explanation":"已重置"}
"播放" → {"action":"playDemo","explanation":"开始演示"}
"前序遍历" → {"action":"switchVariant","explanation":"切换到前序遍历","params":{"variant":"preorder"}}
"下一步" → {"action":"stepDemo","explanation":"执行下一步","params":{"direction":"next"}}
"对比前序和中序" → 必须返回包含comparisonDetails的compareVariants

# 注意

- 直接返回JSON对象，不要用\`\`\`包裹
- 当用户提到"对比"、"区别"、"不同"、"比较"时，**必须**使用compareVariants并包含comparisonDetails
- comparisonDetails必须包含variant1、variant2、keyDifference和stepByStep`;
}
