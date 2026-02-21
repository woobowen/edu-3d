# EduVibe Backend - 当前系统状态逆向工程报告

## 1. 核心业务流程图
`POST /api/generate`
│
▼
`buildSystemPrompt()` (无参数，固定内容) & `buildUserPrompt(concept)` (仅接收 concept)
│
▼
`generateVisualization(systemPrompt, userPrompt, callbacks)` [minimax.ts - SSE 流式调用 AI]
│
▼ `onComplete(fullContent)`
`extractContent(fullContent)` [codeExtractor.ts - 提取 HTML]
│
├─ htmlCode 为 null? ──► error ──► res.end()
│
▼
`validateGeneratedCode(htmlCode)` [validator.ts - 安全验证]
│
├─ 验证失败? ──► autoFixCode() ──► 重新验证 ──► error
│
▼
`saveHtmlOutput(htmlCode)` [outputsStore.ts - SHA-256 内容寻址落盘]
│
▼
`sendEvent('complete', { htmlSha256, ... })` ──► res.end()

## 2. API 路由与数据结构
### 2.1 `POST /api/generate` (流式生成 3D 代码)
- **Request**: `{ "message": "string (如: 汉诺塔)" }`
- **Response**: SSE 事件流 (progress 过程块 -> complete 携带 hash 和分析)

### 2.2 `POST /api/chat` (自然语言控制对话)
- **Request**: `{ "message": "string", "history": [...] }`
- **Response**: SSE 流式回复。
- **注意**: 目前复用了生成的 `buildSystemPrompt`，AI 缺乏独立的交互助理人设。

### 2.3 `POST /api/parse-profile` (用户画像解析)
- **Request**: `{ "text": "我是大二学生，学Python，想准备算法面试" }`
- **Response**: 返回结构化的 `UserProfile` JSON (age, gender, language, cycle, difficulty, goal)。

## 3. 关键问题与潜在风险汇总 (The Disconnect)
| 编号 | 问题描述 | 影响范围 | 严重程度 |
|---|---|---|---|
| P1 | `UserProfile` 已在路由层接收，但未传入 Prompt 引擎，个性化功能实际未生效。 | `generate.ts` ↔ `promptEngine.ts` | 中 |
| P2 | `buildSystemPrompt()` 不接受任何动态参数，所有用户生成的 3D 模型风格千人一面。 | `promptEngine.ts` | 中 |
| P3 | System Prompt 中内嵌了大量固定代码模板（二叉树、汉诺塔等），限制了 AI 自由发挥高级视觉效果的空间。 | `promptEngine.ts` | 高 |
| P4 | `LanguageProfileMap` 类型已定义，但在当前审计的所有文件中均未被使用。 | `types.ts` | 低 |
| P5 | `generate.ts` 路由中，进度触发条件逻辑在 chunk 较大时可能漏发进度。 | `generate.ts` | 低 |
| P6 | **(补全)** `chat.ts` 路由目前是一个孤岛，它只能跟用户聊天，但缺乏通过 `postMessage` 向前端 iframe 里的 3D 模型直接发送指令的确定性机制。 | `chat.ts` | 中 |