// 后端入口文件
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import generateRouter from "@/src/routes/generate.js";
import chatRouter from "@/src/routes/chat.js";
import profileRouter from "@/src/routes/profile.js";
import dataRouter from "@/src/routes/data.js";
import { OUTPUTS_DIR, htmlOutputExists } from "@/src/services/outputsStore.js";
import { buildViewerHtml } from "@/src/templates/viewer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 提供静态文件服务
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/outputs", express.static(OUTPUTS_DIR));

// 路由
app.use("/api", generateRouter);
app.use("/api", chatRouter);
app.use("/api", profileRouter);
app.use("/api", dataRouter);

// 健康检查
app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Viewer 页面路由
app.get("/viewer/:hash", async (req, res) => {
  const { hash } = req.params;

  // 验证 hash 格式
  if (!/^[a-f0-9]{64}$/i.test(hash)) {
    return res.status(400).send("Invalid hash format");
  }

  // 验证文件是否存在
  const exists = await htmlOutputExists(hash);
  if (!exists) {
    return res.status(404).send("Visualization not found");
  }

  // 返回 viewer 页面
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(buildViewerHtml(hash));
});

// 启动服务器
app.listen(PORT, () => console.log(`📡 Listening at ${PORT}`));
