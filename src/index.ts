// 后端入口文件
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import generateRouter from '@/src/routes/generate.js';
import chatRouter from '@/src/routes/chat.js';
import profileRouter from '@/src/routes/profile.js';
import { OUTPUTS_DIR } from '@/src/services/outputsStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 提供静态文件服务
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/outputs', express.static(OUTPUTS_DIR));

// 路由
app.use('/api', generateRouter);
app.use('/api', chatRouter);
app.use('/api', profileRouter);

// 健康检查
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => console.log(`📡 Listening at ${PORT}`));
