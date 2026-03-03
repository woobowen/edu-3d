/**
 * Viewer 页面模板生成器
 * 55% 左侧 iframe (纯3D画布) + 45% 右侧控制面板
 * 配色遵循 education3d 规范
 */

export function buildViewerHtml(sha256: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D 教学可视化</title>
  <style>
    :root {
      --bg-main: #FFFDF4;
      --text-main: #2C1608;
      --title-main: #c28e4a;
      --concept-text: #9B6D0B;
      --concept-bg: #FAECD2;
      --concept-border: #f2cf7f;
      --error-text: #C84A2B;
      --error-bg: #FBDDD6;
      --error-border: #f4b1a1;
      --accent-text: #C35101;
      --accent-bg: #FDDFCA;
      --accent-border: #f7bc93;
      --info-text: #1A7F99;
      --info-bg: #ecf6fa;
      --info-border: #bde0ee;
      --success-text: #478211;
      --success-bg: #effce3;
      --success-border: #c7e7aa;
      --code-bg: #fff7e8;
      --code-border: #e4c8a6;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg-main);
      color: var(--text-main);
      overflow: hidden;
      height: 100vh;
    }
    .container {
      display: flex;
      height: 100vh;
      width: 100vw;
    }
    .left-panel {
      width: 55%;
      height: 100%;
      position: relative;
      background: var(--bg-main);
    }
    .right-panel {
      width: 45%;
      height: 100%;
      background: var(--bg-main);
      border-left: 1px solid var(--code-border);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px;
      background: var(--title-main);
      border-bottom: 1px solid #A07638;
    }
    .back-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: #f8daabfc;
      border: 1px solid var(--concept-border);
      border-radius: 8px;
      color: var(--text-main);
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.2s;
    }
    .back-btn:hover {
      background: #e8c89a;
      border-color: var(--title-main);
    }
    .title {
      font-size: 22px;
      font-weight: bold;
      color: white;
    }
    .ai-toggle-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: #f8daabfc;
      border: 1px solid var(--concept-border);
      border-radius: 8px;
      color: var(--text-main);
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.2s;
    }
    .ai-toggle-btn:hover {
      background: #e8c89a;
      border-color: var(--title-main);
    }
    .section {
      margin: 12px;
      background: white;
      border: 1px solid var(--code-border);
      border-radius: 12px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .section-header {
      padding: 12px 16px;
      background: #f7dcb1fc;
      border-bottom: 1px solid var(--title-main);
      font-size: 14px;
      font-weight: bold;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-body {
      padding: 16px;
    }
    .params-body-scroll {
      max-height: 150px;
      overflow-y: auto;
    }
    .param-row {
      margin-bottom: 12px;
    }
    .param-label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      color: var(--text-main);
    }
    .param-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--code-border);
      border-radius: 8px;
      font-size: 14px;
      background: white;
      color: var(--text-main);
      transition: border-color 0.2s;
    }
    .param-input:focus {
      outline: none;
      border-color: var(--title-main);
    }
    .apply-btn {
      width: 100%;
      padding: 12px;
      background: var(--title-main);
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    .apply-btn:hover {
      background: #A07638;
    }
    /* 变体选择器样式 */
    .variant-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px dashed var(--code-border);
    }
    .variant-label {
      display: block;
      margin-bottom: 10px;
      font-size: 13px;
      font-weight: normal;
      color: var(--text-main);
    }
    .variant-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .variant-btn {
      padding: 8px 16px;
      background: var(--concept-bg);
      border: 2px solid var(--concept-border);
      border-radius: 20px;
      color: var(--concept-text);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .variant-btn:hover {
      background: var(--accent-bg);
      border-color: var(--accent-border);
      color: var(--accent-text);
    }
    .variant-btn.active {
      background: var(--title-main);
      border-color: var(--title-main);
      color: white;
      font-weight: bold;
    }
    .code-block {
      background: var(--code-bg);
      border: 1px solid var(--code-border);
      border-radius: 8px;
      padding: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
      line-height: 1.6;
      overflow-x: auto;
      max-height: 180px;
      overflow-y: auto;
    }
    .code-line {
      display: block;
      padding: 2px 8px;
      margin: 0 -8px;
      white-space: pre;
    }
    .code-line.current {
      background: var(--accent-bg);
      border-left: 3px solid var(--accent-text);
    }
    .control-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .control-btn {
      padding: 10px 12px;
      background: var(--concept-bg);
      border: 1px solid var(--concept-border);
      border-radius: 8px;
      color: var(--concept-text);
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .control-btn:hover {
      background: var(--title-main);
      color: white;
      border-color: var(--title-main);
    }
    .control-btn.primary {
      grid-column: span 2;
      background: var(--title-main);
      color: white;
      border-color: var(--title-main);
    }
    .control-btn.primary:hover {
      background: #A07638;
    }
    .progress-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 12px;
      font-size: 13px;
      color: var(--text-main);
    }
    .progress-bar {
      flex: 1;
      height: 6px;
      background: var(--concept-bg);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--title-main);
      transition: width 0.3s, background 0.3s;
    }
    .progress-fill.complete {
      background: var(--accent-text);
    }
    .step-info {
      background: var(--code-bg);
      border: 1px solid var(--code-border);
      border-radius: 8px;
      padding: 16px;
      max-height: 120px;
      overflow-y: auto;
    }
    .step-title {
      font-size: 14px;
      font-weight: bold;
      color: var(--accent-text);
      margin-bottom: 8px;
    }
    .step-desc {
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-main);
    }
    .ai-console {
      margin: 12px;
      background: white;
      border: 1px solid var(--code-border);
      border-radius: 12px;
      overflow: hidden;
      display: none;
      flex-direction: column;
      max-height: 750px;
      flex-shrink: 0;
    }
    .ai-console.visible {
      display: flex;
    }
    .ai-messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      max-height: 350px;
      background: var(--bg-main);
    }
    .ai-msg {
      margin-bottom: 10px;
      padding: 10px 12px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.5;
      max-width: 90%;
    }
    .ai-msg.user {
      background: var(--title-main);
      color: white;
      margin-left: auto;
      border-bottom-right-radius: 4px;
    }
    .ai-msg.system {
      background: var(--code-bg);
      color: var(--text-main);
      border: 1px solid var(--code-border);
      border-bottom-left-radius: 4px;
    }
    .ai-input-row {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid var(--code-border);
      background: white;
    }
    .ai-input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid var(--code-border);
      border-radius: 8px;
      font-size: 13px;
    }
    .ai-input:focus {
      outline: none;
      border-color: var(--title-main);
    }
    .ai-send-btn {
      padding: 10px 16px;
      background: var(--title-main);
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 13px;
      cursor: pointer;
    }
    .ai-send-btn:hover {
      background: #A07638;
    }
    .ai-send-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    #scene-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .loading-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: var(--bg-main);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }
    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--concept-bg);
      border-top-color: var(--title-main);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .loading-text {
      margin-top: 16px;
      font-size: 14px;
      color: var(--text-main);
    }
    /* 自定义滚动条样式 */
    .right-panel::-webkit-scrollbar,
    .params-body-scroll::-webkit-scrollbar,
    .step-info::-webkit-scrollbar,
    .ai-messages::-webkit-scrollbar,
    .code-block::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .right-panel::-webkit-scrollbar-track,
    .params-body-scroll::-webkit-scrollbar-track,
    .step-info::-webkit-scrollbar-track,
    .ai-messages::-webkit-scrollbar-track,
    .code-block::-webkit-scrollbar-track {
      background: var(--concept-bg);
      border-radius: 3px;
    }
    .right-panel::-webkit-scrollbar-thumb,
    .params-body-scroll::-webkit-scrollbar-thumb,
    .step-info::-webkit-scrollbar-thumb,
    .ai-messages::-webkit-scrollbar-thumb,
    .code-block::-webkit-scrollbar-thumb {
      background: var(--title-main);
      border-radius: 3px;
    }
    .right-panel::-webkit-scrollbar-thumb:hover,
    .params-body-scroll::-webkit-scrollbar-thumb:hover,
    .step-info::-webkit-scrollbar-thumb:hover,
    .ai-messages::-webkit-scrollbar-thumb:hover,
    .code-block::-webkit-scrollbar-thumb:hover {
      background: #A07638;
    }
    /* 平滑滚动 */
    .right-panel,
    .params-body-scroll,
    .step-info,
    .ai-messages,
    .code-block {
      scroll-behavior: smooth;
    }
    /* header固定在顶部 */
    .header {
      flex-shrink: 0;
      position: sticky;
      top: 0;
      z-index: 5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="left-panel">
      <div class="loading-overlay" id="loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载 3D 场景中...</div>
      </div>
      <iframe id="scene-iframe" src="/outputs/${sha256}.html" sandbox="allow-scripts allow-same-origin"></iframe>
    </div>
    <div class="right-panel">
      <div class="header">
        <button class="back-btn" onclick="window.close()">⬅️ 返回</button>
        <span class="title" id="scene-title">3D 教学可视化</span>
        <button class="ai-toggle-btn" onclick="toggleAI()">🤖 AI控制台</button>
      </div>
      <div class="section" id="params-section">
        <div class="section-header">⚙️ 参数设置</div>
        <div class="section-body params-body-scroll" id="params-body">
          <div class="param-row">
            <label class="param-label">加载中...</label>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="section-header">🎮 演示控制</div>
        <div class="section-body">
          <div class="control-grid">
            <button class="control-btn primary" onclick="sendCmd('autoPlay')">▶️ 自动演示</button>
            <button class="control-btn" onclick="sendCmd('pause')">⏸️ 暂停</button>
            <button class="control-btn" onclick="sendCmd('reset')">🔄 重置</button>
            <button class="control-btn" onclick="sendCmd('prevStep')">⏮️ 上一步</button>
            <button class="control-btn" onclick="sendCmd('nextStep')">下一步 ⏭️</button>
          </div>
          <div class="progress-row">
            <span id="step-counter">0/0</span>
            <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>
          </div>
        </div>
      </div>
      <div class="section" id="code-section">
        <div class="section-header">💻 算法代码</div>
        <div class="section-body">
          <div class="code-block" id="code-block">
            <span class="code-line">// 等待场景加载...</span>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="section-header">📖 当前步骤</div>
        <div class="section-body">
          <div class="step-info">
            <div class="step-title" id="step-title">准备就绪</div>
            <div class="step-desc" id="step-desc">等待场景加载完成后，点击"自动演示"开始学习。</div>
          </div>
        </div>
      </div>
      <div class="ai-console" id="ai-console">
        <div class="section-header">🤖 AI 自然语言控制台</div>
        <div class="ai-messages" id="ai-messages">
          <div class="ai-msg system">👋 你好！我是AI助手，可以用自然语言控制3D演示。</div>
          <div class="ai-msg system">💡 试试说："开始演示"、"下一步"、"增加复杂度"</div>
        </div>
        <div class="ai-input-row">
          <input type="text" class="ai-input" id="ai-input" placeholder="输入自然语言指令..." onkeypress="if(event.key==='Enter')sendAI()">
          <button class="ai-send-btn" id="ai-send" onclick="sendAI()">发送</button>
        </div>
      </div>
    </div>
  </div>
  <script>
    const iframe = document.getElementById('scene-iframe');
    const loading = document.getElementById('loading');
    let sceneMeta = null;
    let isAIVisible = false;

    // iframe 加载完成
    iframe.onload = function() {
      loading.style.display = 'none';
      setTimeout(initFromIframe, 500);
    };

    function initFromIframe() {
      try {
        const win = iframe.contentWindow;
        if (win && win.SCENE_META) {
          sceneMeta = win.SCENE_META;
          document.getElementById('scene-title').textContent = sceneMeta.title || '3D 教学可视化';
          renderParams(sceneMeta.parameters || []);
          
          // 优先使用 codeSnippets 中第一个变体的代码
          let initialCode = sceneMeta.codeSnippet;
          if (sceneMeta.codeSnippets && sceneMeta.variants && sceneMeta.variants.length > 0) {
            const firstVariant = sceneMeta.variants[0];
            if (sceneMeta.codeSnippets[firstVariant]) {
              initialCode = sceneMeta.codeSnippets[firstVariant];
            }
          }
          renderCode(initialCode);
          
          if (sceneMeta.totalSteps) {
            document.getElementById('step-counter').textContent = '0/' + sceneMeta.totalSteps;
          }
        }
      } catch(e) {
        console.warn('无法读取 SCENE_META:', e);
      }
    }

    let currentVariant = null;  // 当前选中的变体

    function renderParams(params) {
      const body = document.getElementById('params-body');
      let html = '';
      
      // 渲染参数输入
      if (params && params.length > 0) {
        params.forEach(p => {
          html += '<div class="param-row">';
          html += '<label class="param-label">' + (p.label || p.id) + '</label>';
          if (p.type === 'select' && p.options) {
            html += '<select class="param-input" id="param-' + p.id + '">';
            p.options.forEach(opt => {
              const sel = opt === p.default ? ' selected' : '';
              html += '<option value="' + opt + '"' + sel + '>' + opt + '</option>';
            });
            html += '</select>';
          } else {
            const val = p.default !== undefined ? p.default : '';
            const t = p.type === 'number' ? 'number' : 'text';
            let attrs = '';
            if (p.min !== undefined) attrs += ' min="' + p.min + '"';
            if (p.max !== undefined) attrs += ' max="' + p.max + '"';
            html += '<input type="' + t + '" class="param-input" id="param-' + p.id + '" value="' + val + '"' + attrs + '>';
          }
          html += '</div>';
        });
        html += '<button class="apply-btn" onclick="applyParams()">✓ 应用参数</button>';
      } else {
        html += '<div class="param-row"><span style="color:#999">无可配置参数</span></div>';
      }
      
      // 渲染变体选择器（如果有变体）
      if (sceneMeta && sceneMeta.variants && sceneMeta.variants.length > 0) {
        currentVariant = currentVariant || sceneMeta.variants[0];  // 默认选中第一个
        html += '<div class="variant-section">';
        html += '<label class="variant-label">🔀 模式切换</label>';
        html += '<div class="variant-group">';
        sceneMeta.variants.forEach((v, i) => {
          const activeClass = (v === currentVariant) ? ' active' : '';
          html += '<button class="variant-btn' + activeClass + '" onclick="switchVariant(\\''+v+'\\', this)">' + v + '</button>';
        });
        html += '</div>';
        html += '</div>';
      }
      
      body.innerHTML = html;
    }

    function switchVariant(variant, btn) {
      if (currentVariant === variant) return;  // 已经是当前变体
      currentVariant = variant;
      
      // 更新按钮状态
      document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      
      // 发送切换命令到 iframe
      sendCmd('switchVariant', { variant: variant });
      
      // 重置进度条
      document.getElementById('step-counter').textContent = '0/' + (sceneMeta?.totalSteps || 0);
      document.getElementById('progress-fill').style.width = '0%';
      document.getElementById('progress-fill').classList.remove('complete');
    }

    function renderCode(snippet) {
      const block = document.getElementById('code-block');
      if (!snippet || !snippet.lines) {
        block.innerHTML = '<span class="code-line">// 无代码片段</span>';
        return;
      }
      let html = '';
      snippet.lines.forEach((line, i) => {
        html += '<span class="code-line" id="code-line-' + i + '">' + escapeHtml(line) + '</span>';
      });
      block.innerHTML = html;
    }

    function escapeHtml(s) {
      return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function highlightCodeLine(idx) {
      document.querySelectorAll('.code-line').forEach(el => el.classList.remove('current'));
      const el = document.getElementById('code-line-' + idx);
      if (el) {
        el.classList.add('current');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function applyParams() {
      if (!sceneMeta || !sceneMeta.parameters) return;
      sceneMeta.parameters.forEach(p => {
        const el = document.getElementById('param-' + p.id);
        if (el) {
          const val = p.type === 'number' ? parseFloat(el.value) : el.value;
          sendCmd('setParameter', { id: p.id, value: val });
        }
      });
    }

    function sendCmd(type, params) {
      try {
        iframe.contentWindow.postMessage({ type, ...params }, '*');
      } catch(e) {
        console.error('发送命令失败:', e);
      }
    }

    function toggleAI() {
      isAIVisible = !isAIVisible;
      const aiConsole = document.getElementById('ai-console');
      aiConsole.classList.toggle('visible', isAIVisible);
      if (isAIVisible) {
        // 展开后平滑滚动到AI对话区域
        setTimeout(() => {
          aiConsole.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    }

    // 监听 iframe 消息
    window.addEventListener('message', function(e) {
      const d = e.data;
      if (!d || typeof d !== 'object') return;
      if (d.type === 'stepChanged') {
        document.getElementById('step-title').textContent = d.title || '步骤 ' + d.step;
        document.getElementById('step-desc').textContent = d.description || '';
        const total = d.totalSteps || (sceneMeta && sceneMeta.totalSteps) || 1;
        document.getElementById('step-counter').textContent = d.step + '/' + total;
        const pct = Math.min(100, (d.step / total) * 100);
        const progressFill = document.getElementById('progress-fill');
        progressFill.style.width = pct + '%';
        if (d.step >= total) {
          progressFill.classList.add('complete');
        } else {
          progressFill.classList.remove('complete');
        }
        if (d.currentCodeLine !== undefined) {
          highlightCodeLine(d.currentCodeLine);
        }
      } else if (d.type === 'codeChanged') {
        // 变体切换时更新代码显示
        if (d.codeSnippet) {
          renderCode(d.codeSnippet);
        }
      } else if (d.type === 'metaReady') {
        initFromIframe();
      }
    });

    // AI 聊天
    let aiLoading = false;
    function sendAI() {
      if (aiLoading) return;
      const input = document.getElementById('ai-input');
      const msg = input.value.trim();
      if (!msg) return;
      input.value = '';
      addAIMsg('user', msg);
      aiLoading = true;
      document.getElementById('ai-send').disabled = true;

      // 发送请求时包含场景元数据，让 AI 知道当前场景支持哪些参数
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: msg, 
          history: [],
          sceneMeta: sceneMeta  // 传递当前场景的元数据
        })
      }).then(res => {
        if (!res.ok) {
          throw new Error('服务器响应错误: ' + res.status);
        }
        if (!res.body) {
          throw new Error('响应体为空');
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullResp = '';
        function read() {
          reader.read().then(({ done, value }) => {
            if (done) {
              aiLoading = false;
              document.getElementById('ai-send').disabled = false;
              processAIResponse(fullResp);
              return;
            }
            const chunk = decoder.decode(value);
            chunk.split('\\n').forEach(line => {
              if (line.startsWith('data: ')) {
                try {
                  const d = JSON.parse(line.slice(6));
                  if (d.type === 'progress') fullResp += d.content;
                  else if (d.type === 'complete') fullResp = d.content;
                } catch(e) {}
              }
            });
            read();
          });
        }
        read();
      }).catch(err => {
        aiLoading = false;
        document.getElementById('ai-send').disabled = false;
        addAIMsg('system', '❌ 请求失败: ' + err.message);
      });
    }

    function addAIMsg(type, text) {
      const msgs = document.getElementById('ai-messages');
      const div = document.createElement('div');
      div.className = 'ai-msg ' + type;
      div.textContent = text;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function processAIResponse(text) {
      try {
        const match = text.match(/\\{[\\s\\S]*\\}/);
        if (match) {
          const cmd = JSON.parse(match[0]);
          addAIMsg('system', '🎮 ' + (cmd.explanation || '执行操作'));
          executeControlAction(cmd);
        } else {
          addAIMsg('system', text);
        }
      } catch(e) {
        addAIMsg('system', text);
      }
    }

    function executeControlAction(cmd) {
      switch(cmd.action) {
        case 'setParameter':
          if (cmd.params) sendCmd('setParameter', { id: cmd.params.name, value: cmd.params.value });
          break;
        case 'switchVariant':
          if (cmd.params) sendCmd('switchVariant', { variant: cmd.params.variant });
          break;
        case 'compareVariants':
          if (cmd.params) sendCmd('compareVariants', cmd.params);
          break;
        case 'playDemo':
          sendCmd('autoPlay');
          break;
        case 'resetDemo':
          sendCmd('reset');
          break;
        case 'stepDemo':
          sendCmd(cmd.params?.direction === 'prev' ? 'prevStep' : 'nextStep');
          break;
        case 'explain':
          // 纯解释，已显示
          break;
        default:
          console.warn('未知操作:', cmd.action);
      }
    }
  </script>
</body>
</html>`;
}
