# EduVibe Backend - 项目宪法与真理源 (GEMINI.md)

## 0. 核心基准 (Core Baseline)
- **环境铁律**: WSL2 原生 Linux 环境。绝对路径起始于 `~/project/education3d`。严禁任何 Windows 风格路径 (C:\...) 或跨界挂载路径 (/mnt/c/...)。
- **包管理器**: 强制且唯一使用 `npm`。严禁使用 `pnpm` 或 `yarn`。
- **AI 双核网络**: 统一通过 DMXAPI 聚合网关直连。
  - 逻辑层路由/判断默认: `gemini-3-pro-preview`
  - 代码生成层默认: `claude-sonnet-4-6`

## 1. 目录结构与架构边界 (Project Structure)
- `src/index.ts`: Express 启动入口。必须包含静态资源挂载。
- `src/routes/`: 存放 API 路由 (`generate`, `chat`, `profile`)，使用小驼峰命名。
- `src/services/`: AI 客户端集成、Prompt 引擎。
- `src/utils/`: 共享工具链 (如 `validator`, `codeExtractor`)。
- `src/config/`: 静态配置 (如语言档案)。
- `src/types.ts`: 后端全局类型定义 (不依赖外部共享包)。
- `src/assets/`: 静态资源，构建时需复制到 `dist/assets`。
- `outputs/`: 生成的 HTML 物理存储落盘区 (受 `OUTPUTS_DIR` 控制)。
- `dist/`: 构建输出目录。

**核心业务流**: `/api/generate` 采用 SSE 流式输出，链路为：`promptEngine` -> `AI Model` -> `codeExtractor` -> `validator` -> `outputsStore` -> 返回 `htmlSha256`。

## 2. 编码准则 (Coding Style & Conventions)
- **技术栈**: TypeScript, ESM 模块化, 2 空格缩进, 必须有分号。
- **导入规范**: 使用 `@` 别名指向后端根目录 (例如 `@/src/services/gemini.js`)。在 ESM 环境下，本地文件导入**必须显式保留 `.js` 后缀**。
- **强类型与注释**: 所有新增核心逻辑必须带有 Type Hinting。关键复杂逻辑必须包含中文注释。
- **配置禁忌**: `.json` 文件严禁包含任何形式的注释 (`//` 或 `/* */`)。

## 3. 防御性排错规范 (Critical Debugging & Defensive Rules)
在修改或生成对应模块代码时，必须强制遵守以下防线：
1. **环境变量防丢失**: 读取 `.env` 时，严禁相对路径猜测。强制使用绝对工作目录：`dotenv.config({ path: path.resolve(process.cwd(), '.env') });`
2. **大模型抗压机制**: 在 `src/services/` 实例化 OpenAI/Gemini 客户端时，必须显式注入：`timeout: 300000` (5分钟) 和 `maxRetries: 3`。
3. **Prompt 模板防逃逸**: `src/services/promptEngine.ts` 中拼接 TS 模板字符串时，**严禁使用未转义的 Markdown 反引号 (```)**。指令必须写为纯文本形式：`IMPORTANT: You MUST wrap the entire HTML output in a markdown code block.`
4. **多块特征提取器**: `src/utils/codeExtractor.ts` 严禁无脑抓取第一个代码块。必须遍历提取结果，严格匹配包含 `<!DOCTYPE html>` 或 `<html` 的文本块作为最终 HTML 产物。
5. **静态域与 DOM 隔离**: 
   - 后端 `src/index.ts` 必须注入：`app.use('/outputs/assets', express.static(path.join(process.cwd(), 'src/assets')));`
   - 前端生成的 `<script type="module">` 中，事件绑定函数必须显式挂载到全局 (如 `window.applyParameters = applyParameters;`)。

## 4. 代理与 Git 执行协议 (Aider CLI Protocol)
- **启动指令**: `aider-dmx --yes --no-auto-commits --read GEMINI.md <target_file>`
- **增量修改**: 先读取，后推断，仅针对目标模块生成代码，严禁盲目全量覆盖核心文件。破坏性操作前必须等待用户回复“确认执行”。
- **提交规范**: 测试通过后，用户手动 `git add .`，Commit Message 必须为中文格式 `Type: Description` (如 `feat: 增加多块过滤逻辑`)。