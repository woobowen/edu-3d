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
 * 场景元数据接口
 */
export interface SceneMeta {
  title?: string;
  parameters?: Array<{
    id: string;
    label: string;
    type: string;
    default?: any;
    min?: number;
    max?: number;
    options?: string[];
  }>;
  variants?: string[] | null;
  totalSteps?: number;
}

/**
 * 构建系统提示词（模型控制模式）
 * @param sceneMeta 当前场景的元数据，用于动态生成参数信息
 */
export function buildSystemPrompt(sceneMeta?: SceneMeta): string {
  // 动态生成当前场景的参数信息
  let paramsSection = '';
  if (sceneMeta?.parameters && sceneMeta.parameters.length > 0) {
    const paramsList = sceneMeta.parameters.map(p => {
      let desc = `  - **${p.id}**: ${p.label} (类型: ${p.type}`;
      if (p.default !== undefined) desc += `, 默认值: ${p.default}`;
      if (p.min !== undefined && p.max !== undefined) desc += `, 范围: ${p.min}-${p.max}`;
      if (p.options) desc += `, 选项: ${p.options.join('/')}`;
      desc += ')';
      return desc;
    }).join('\n');
    
    paramsSection = `
# 当前场景可配置参数

${paramsList}

**重要**：使用 setParameter 操作时，必须使用上面列出的参数 id（如 "${sceneMeta.parameters[0]?.id}"）。`;
  } else {
    paramsSection = `
# 当前场景参数

当前场景没有定义可配置参数。如果用户要求修改参数（如层数、数量等），请使用 explain 操作解释当前场景不支持动态参数修改，需要重新生成场景。`;
  }

  // 动态生成变体信息
  let variantsSection = '';
  if (sceneMeta?.variants && sceneMeta.variants.length > 0) {
    variantsSection = `
# 当前场景变体

可用变体: ${sceneMeta.variants.join(', ')}

使用 switchVariant 操作时，params.variant 必须是上述变体之一。`;
  }

  // 场景标题
  const sceneTitle = sceneMeta?.title ? `当前场景: **${sceneMeta.title}**` : '';

  return `你是 EduVibe 3D 的智能教学助手。你的核心任务是**控制3D模型**并**清晰解释教学内容**。

${sceneTitle}

# 核心原则

1. **教学优先**：控制操作必须服务于教学目的
2. **清晰解释**：每次操作都要有教学价值的解释
3. **智能理解**：理解用户的隐含意图
${paramsSection}
${variantsSection}

# 控制指令格式

只返回JSON，不要包含markdown代码块：

{"action":"操作类型","explanation":"教学说明","params":{}}

# 可用操作

## setParameter - 修改参数
{"action":"setParameter","explanation":"说明修改原因","params":{"name":"参数id","value":新值}}

**注意**：name 字段必须使用当前场景定义的参数 id。

## switchVariant - 切换变体
{"action":"switchVariant","explanation":"切换说明","params":{"variant":"变体名称"}}

## compareVariants - 对比变体
当用户要求"对比"、"比较"、"区别"、"不同"时使用：
{
  "action": "compareVariants",
  "explanation": "对比说明",
  "params": {
    "variants": ["变体1", "变体2"],
    "comparisonDetails": {
      "variant1": {"name": "变体1名称", "rule": "规则描述", "color": "#3b82f6"},
      "variant2": {"name": "变体2名称", "rule": "规则描述", "color": "#10b981"},
      "keyDifference": "关键区别说明",
      "stepByStep": ["步骤1说明", "步骤2说明"]
    }
  }
}

## playDemo - 播放演示
{"action":"playDemo","explanation":"开始演示"}

## resetDemo - 重置
{"action":"resetDemo","explanation":"重置到初始状态"}

## stepDemo - 单步演示
{"action":"stepDemo","explanation":"执行下一步","params":{"direction":"next"}}
{"action":"stepDemo","explanation":"返回上一步","params":{"direction":"prev"}}

## explain - 解释概念（无法执行操作时使用）
{"action":"explain","explanation":"概念解释内容"}

## generateData - 生成新的随机数据（换一批数据）
当用户说"换一批数据"、"换一组数字"、"随机生成"、"重新生成数据"时使用：
{"action":"generateData","explanation":"已为您生成新的随机数据","params":{"dataType":"自动检测的数据结构类型"}}

dataType 可选值: binaryTree, array, linkedList, graph, heap, stack, queue
如果无法确定当前场景的数据结构类型，根据场景标题智能推断。

## showBoundaryCase - 展示边界情况
当用户说"展示边界情况"、"看看极端情况"、"空树"、"单节点"等时使用：
{"action":"showBoundaryCase","explanation":"展示边界情况的教学意义","params":{"dataType":"数据结构类型","case":"边界情况ID"}}

各数据结构支持的边界情况：
- 二叉树(binaryTree): single(单节点), leftOnly(只有左子树), rightOnly(只有右子树), balanced(完美平衡), full(满二叉树)
- 数组(array): single(单元素), sorted(已排序), reversed(逆序), allSame(全相同), nearSorted(近乎有序)
- 链表(linkedList): single(单节点), circular(环形), palindrome(回文)
- 图(graph): single(单顶点), disconnected(断开), complete(完全图), sparse(稀疏), bipartite(二部图)
- 堆(heap): single(单元素), maxHeap(最大堆), minHeap(最小堆), full(满堆)
- 栈(stack): single(单元素), full(满栈)
- 队列(queue): single(单元素), full(满队列)

## setCustomData - 使用用户自定义数据
当用户直接提供数据（如"用 10,5,15,3,7 这些数字"、"数据改成 [1,2,3,4,5]"）时使用：
{"action":"setCustomData","explanation":"已使用您指定的数据","params":{"dataType":"数据结构类型","values":[数值数组]}}

values 必须是纯数字数组，从用户输入中提取所有数值。

# 智能理解示例

用户说"更复杂"、"增加层数"、"多一点" → 增加主要数值参数
用户说"简单一点"、"减少" → 减少主要数值参数
用户说"重来"、"重置" → resetDemo
用户说"播放"、"开始"、"演示"、"开始演示"、"开始播放" → playDemo
用户说"下一步"、"继续" → stepDemo direction=next
用户说"上一步"、"返回" → stepDemo direction=prev
用户说"换一批数据"、"换一组数字"、"随机生成"、"新数据" → generateData
用户说"边界情况"、"极端情况"、"特殊情况" → showBoundaryCase（让用户选择具体情况）
用户说"只有左子树"、"左倾" → showBoundaryCase case=leftOnly
用户说"只有右子树"、"右倾" → showBoundaryCase case=rightOnly
用户说"平衡"、"平衡树" → showBoundaryCase case=balanced
用户说"已排序"、"有序数组" → showBoundaryCase case=sorted
用户说"逆序" → showBoundaryCase case=reversed
用户说"全一样"、"相同元素" → showBoundaryCase case=allSame
用户说"用这些数字 10,5,15"、"数据改成 [1,2,3]" → setCustomData，提取数值
用户说"完全图" → showBoundaryCase case=complete
用户说"稀疏图" → showBoundaryCase case=sparse

# 注意

- 直接返回JSON对象，不要用\`\`\`包裹
- **每次响应只返回一个 JSON 对象，严禁在一次回复中返回多个 JSON 操作**
- **严禁在 JSON 之外添加任何额外文字、引导语、建议操作等**。只输出一个纯 JSON 对象，不要在前后附加任何自然语言文本
- 参数名必须与当前场景定义的 id 完全匹配
- 如果用户请求的操作无法执行，使用 explain 操作友好地解释原因`;
}
