// Gemini API 调用服务
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

// 从父目录加载 .env 文件
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

interface GeminiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

const config: GeminiConfig = {
  baseUrl: process.env.GEMINI_BASE_URL || 'https://vip.dmxapi.com/v1',
  apiKey: process.env.GEMINI_API_KEY || '',
  model: process.env.GEMINI_MODEL || 'gemini-3-pro-preview',
  temperature: 0.7,
  maxTokens: 2000
};

// 验证 API Key
if (!config.apiKey) {
  console.warn('⚠️ 警告：未设置 GEMINI_API_KEY 环境变量');
}

// 创建 OpenAI 客户端（Gemini 兼容接口）
const client = new OpenAI({
  baseURL: config.baseUrl,
  apiKey: config.apiKey,
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
 * 调用 Gemini API 进行对话（流式）
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
    console.error('Gemini API Error:', error);
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
    console.error('Gemini API Error:', error);
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
