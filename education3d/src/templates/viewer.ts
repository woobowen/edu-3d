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
      --title-main: #cd9954;
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
    /* 快捷操作栏 */
    .ai-shortcuts {
      display: flex;
      gap: 8px;
      padding: 10px 12px;
      border-bottom: 1px solid var(--code-border);
      background: white;
      position: relative;
    }
    .shortcut-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 14px;
      background: var(--concept-bg);
      border: 1px solid var(--concept-border);
      border-radius: 20px;
      color: var(--concept-text);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      position: relative;
    }
    .shortcut-btn:hover {
      background: var(--accent-bg);
      border-color: var(--accent-border);
      color: var(--accent-text);
    }
    .shortcut-btn .arrow {
      font-size: 10px;
      margin-left: 2px;
    }
    /* 下拉菜单 */
    .dropdown-menu {
      display: none;
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      min-width: 180px;
      background: white;
      border: 1px solid var(--code-border);
      border-radius: 10px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      z-index: 20;
      overflow: hidden;
      animation: dropdownFadeIn 0.15s ease;
    }
    .dropdown-menu.show {
      display: block;
    }
    @keyframes dropdownFadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .dropdown-title {
      padding: 8px 14px;
      font-size: 11px;
      font-weight: bold;
      color: var(--text-main);
      background: #f7dcb1fc;
      border-bottom: 1px solid var(--concept-border);
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 14px;
      font-size: 13px;
      color: var(--text-main);
      cursor: pointer;
      transition: background 0.15s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
    }
    .dropdown-item:hover {
      background: var(--concept-bg);
    }
    .dropdown-item .item-icon {
      font-size: 14px;
      width: 20px;
      text-align: center;
    }
    .dropdown-item .item-label {
      flex: 1;
    }
    .dropdown-item .item-desc {
      font-size: 11px;
      color: #999;
    }
    .dropdown-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 15;
    }
    .dropdown-overlay.show {
      display: block;
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
        <div class="ai-shortcuts" id="ai-shortcuts">
          <div style="position:relative;" id="data-dropdown-wrap">
            <button class="shortcut-btn" onclick="toggleDropdown('data')">🎲 换一批数据 <span class="arrow">▼</span></button>
            <div class="dropdown-menu" id="data-dropdown">
              <div class="dropdown-title">🎲 换一批数据</div>
              <button class="dropdown-item" onclick="shortcutGenerateRandom()">
                <span class="item-icon">✨</span>
                <span class="item-label">随机生成</span>
              </button>
              <button class="dropdown-item" onclick="shortcutManualInput()">
                <span class="item-icon">✏️</span>
                <span class="item-label">手动输入...</span>
              </button>
            </div>
          </div>
          <div style="position:relative;" id="boundary-dropdown-wrap">
            <button class="shortcut-btn" onclick="toggleDropdown('boundary')">⚠️ 边界情况 <span class="arrow">▼</span></button>
            <div class="dropdown-menu" id="boundary-dropdown">
              <div class="dropdown-title">⚠️ 边界情况</div>
              <div id="boundary-cases-list">
                <div class="dropdown-item" style="color:#999;font-size:12px;">加载场景后显示...</div>
              </div>
            </div>
          </div>
        </div>
        <div class="dropdown-overlay" id="dropdown-overlay" onclick="closeAllDropdowns()"></div>
        <div class="ai-messages" id="ai-messages">
          <div class="ai-msg system">👋 你好！我是AI助手，可以帮你：</div>
          <div class="ai-msg system">💡 控制3D演示 · 解答演示相关问题 · 探索更多交互</div>
        </div>
        <div class="ai-input-row">
          <input type="text" class="ai-input" id="ai-input" placeholder="✨ 遇到不懂的知识点随时问我，或者直接让我帮你控制 3D 演示吧！" onkeypress="if(event.key==='Enter')sendAI()">
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
    let currentMode = 'normal';  // 'normal' | 'boundary-leftOnly' | 'boundary-rightOnly' | ...

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

          // ★ 根据 dataFeatures 控制快捷按钮显隐
          updateDataFeatureButtons();
          
          // 动态更新边界情况下拉菜单
          updateBoundaryCasesDropdown();
        }
      } catch(e) {
        console.warn('无法读取 SCENE_META:', e);
      }
    }

    /** ★ 根据 sceneMeta.dataFeatures 控制"换一批数据"和"边界情况"按钮的显隐 */
    function updateDataFeatureButtons() {
      const dataDropdown = document.getElementById('data-dropdown-wrap');
      const boundaryDropdown = document.getElementById('boundary-dropdown-wrap');
      const features = sceneMeta?.dataFeatures || {};
      
      // 如果不支持数据更换，隐藏"换一批数据"按钮
      if (features.supportsDataChange === false) {
        dataDropdown.style.display = 'none';
      } else {
        dataDropdown.style.display = '';
      }
      
      // 如果不支持边界情况，隐藏"边界情况"按钮
      if (features.supportsBoundaryCase === false) {
        boundaryDropdown.style.display = 'none';
      } else {
        boundaryDropdown.style.display = '';
      }
      
      // 如果两个按钮都隐藏，也隐藏整个快捷栏
      const shortcuts = document.getElementById('ai-shortcuts');
      if (features.supportsDataChange === false && features.supportsBoundaryCase === false) {
        shortcuts.style.display = 'none';
      } else {
        shortcuts.style.display = '';
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
      
      // 动态调整参数区域高度：有模式切换时增大 max-height，让模式切换直接可见
      if (sceneMeta && sceneMeta.variants && sceneMeta.variants.length > 0) {
        body.style.maxHeight = '250px';
      } else {
        body.style.maxHeight = '150px';
      }
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
      // ★ 用户手动应用参数时，重置为普通模式
      currentMode = 'normal';
      console.log('[状态机] 应用参数 → currentMode = normal');
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
        // ========== 数据生成相关 action ==========
        case 'generateData':
          handleGenerateData(cmd.params);
          break;
        case 'showBoundaryCase':
          handleBoundaryCase(cmd.params);
          break;
        case 'setCustomData':
          handleCustomData(cmd.params);
          break;
        default:
          console.warn('未知操作:', cmd.action);
      }
    }

    // ========== 数据生成处理函数 ==========

    /** 获取当前参数面板中用户设置的值，映射到 config 格式 */
    function getCurrentParamValues() {
      if (!sceneMeta?.parameters) return {};
      const config = {};
      let foundSize = false;
      sceneMeta.parameters.forEach(p => {
        const el = document.getElementById('param-' + p.id);
        if (el) {
          const val = p.type === 'number' ? parseInt(el.value) : el.value;
          // 保留原始参数名
          config[p.id] = val;
          // 智能映射：第一个数字类型参数自动映射为 size（适用于各种参数名：depth, layers, nodeCount, arraySize 等）
          if (p.type === 'number' && !foundSize) {
            config.size = val;
            foundSize = true;
          }
        }
      });
      console.log('[AI控制台] 当前参数:', JSON.stringify(config));
      return config;
    }

    /** 处理 generateData action：请求后端生成随机数据并发送到 iframe */
    function handleGenerateData(params) {
      const dataType = params?.dataType || guessDataType();
      if (!dataType) {
        addAIMsg('system', '⚠️ 无法确定当前场景的数据结构类型');
        return;
      }
      // ★ 读取当前用户设置的参数，合并到 config 中
      const currentConfig = getCurrentParamValues();
      const mergedConfig = { ...currentConfig, ...params?.config };
      fetch('/api/data/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: dataType, config: mergedConfig })
      }).then(r => r.json()).then(data => {
        if (data.error) {
          addAIMsg('system', '❌ ' + data.error);
        } else {
          // ★ 先重置旧的遍历状态，再设置新数据，防止结果重叠
          sendCmd('reset');
          sendCmd('setData', { data: data });
          addAIMsg('system', '✅ 已生成新的随机数据（' + (mergedConfig.size || '默认') + '个元素）');
          // ★ 双向同步：用生成结果的实际数量更新参数面板
          const actualSize = data.nodeCount || data.size || (data.values && data.values.length) || (data.nodes && data.nodes.length);
          if (actualSize) updateParamPanelSize(actualSize);
        }
      }).catch(err => {
        addAIMsg('system', '❌ 数据生成失败: ' + err.message);
      });
    }

    /** 处理 showBoundaryCase action */
    function handleBoundaryCase(params) {
      const dataType = params?.dataType || guessDataType();
      const caseType = params?.case || 'single';
      if (!dataType) {
        addAIMsg('system', '⚠️ 无法确定当前场景的数据结构类型');
        return;
      }
      fetch('/api/data/boundary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: dataType, case: caseType })
      }).then(r => r.json()).then(data => {
        if (data.error) {
          addAIMsg('system', '❌ ' + data.error);
        } else {
          // ★ 先重置旧的遍历状态，再设置新数据，防止结果重叠
          sendCmd('reset');
          sendCmd('setData', { data: data });
          // ★ 双向同步：用边界情况结果的实际数量更新参数面板
          const actualSize = data.nodeCount || data.size || (data.values && data.values.length) || (data.nodes && data.nodes.length);
          if (actualSize) updateParamPanelSize(actualSize);
        }
      }).catch(err => {
        addAIMsg('system', '❌ 边界数据生成失败: ' + err.message);
      });
    }

    /** 处理 setCustomData action */
    function handleCustomData(params) {
      const dataType = params?.dataType || guessDataType();
      const values = params?.values || [];
      if (!dataType) {
        addAIMsg('system', '⚠️ 无法确定当前场景的数据结构类型');
        return;
      }
      // ★ 用户手动输入数据时，重置为普通模式
      currentMode = 'normal';
      console.log('[状态机] 手动输入 → currentMode = normal');
      fetch('/api/data/fromValues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: dataType, values: values })
      }).then(r => r.json()).then(data => {
        if (data.error) {
          addAIMsg('system', '❌ ' + data.error);
        } else {
          // ★ 先重置旧的遍历状态，再设置新数据，防止结果重叠
          sendCmd('reset');
          sendCmd('setData', { data: data });
          addAIMsg('system', '✅ 已使用您指定的数据');
          // ★ 双向同步：更新参数面板中的 size 参数
          updateParamPanelSize(values.length);
        }
      }).catch(err => {
        addAIMsg('system', '❌ 自定义数据生成失败: ' + err.message);
      });
    }

    /** ★ 双向同步：更新参数面板中第一个数字类型参数（通常是 size/nodeCount）为指定值 */
    function updateParamPanelSize(newSize) {
      if (!sceneMeta?.parameters) return;
      for (const p of sceneMeta.parameters) {
        if (p.type === 'number') {
          const el = document.getElementById('param-' + p.id);
          if (el) {
            el.value = newSize;
            console.log('[双向同步] 更新参数面板 ' + p.id + ' = ' + newSize);
          }
          break;  // 只更新第一个数字参数（即 size）
        }
      }
    }

    /** 根据场景标题猜测数据结构类型 */
    function guessDataType() {
      if (sceneMeta?.dataStructure?.type) return sceneMeta.dataStructure.type;
      const title = (sceneMeta?.title || '').toLowerCase();
      const patterns = [
        [/二叉搜索树|bst|binary.?search.?tree/, 'binarySearchTree'],
        [/二叉树|binary.?tree|前序|中序|后序|层序/, 'binaryTree'],
        [/数组|array|排序|sort|搜索|search/, 'array'],
        [/链表|linked.?list|单链|双链/, 'linkedList'],
        [/图|graph|bfs|dfs|dijkstra|最短路|拓扑/, 'graph'],
        [/堆|heap|优先队列|priority/, 'heap'],
        [/栈|stack|括号匹配/, 'stack'],
        [/队列|queue|fifo/, 'queue'],
      ];
      for (const [re, type] of patterns) {
        if (re.test(title)) return type;
      }
      return null;
    }

    // ========== 下拉菜单控制 ==========

    let activeDropdown = null;

    function toggleDropdown(type) {
      const menuId = type + '-dropdown';
      const menu = document.getElementById(menuId);
      const overlay = document.getElementById('dropdown-overlay');
      if (activeDropdown === type) {
        closeAllDropdowns();
        return;
      }
      closeAllDropdowns();
      menu.classList.add('show');
      overlay.classList.add('show');
      activeDropdown = type;
    }

    function closeAllDropdowns() {
      document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
      document.getElementById('dropdown-overlay').classList.remove('show');
      activeDropdown = null;
    }

    // ========== 快捷按钮操作 ==========

    /** [🎲 换一批数据] → 随机生成 */
    function shortcutGenerateRandom() {
      closeAllDropdowns();
      const dataType = guessDataType();
      if (!dataType) {
        addAIMsg('system', '⚠️ 当前场景不支持数据生成，请通过AI对话描述需求');
        return;
      }

      // ★ 状态机逻辑：如果当前处于边界模式，随机生成时保持该边界形状（换随机值）
      if (currentMode.startsWith('boundary-')) {
        const caseId = currentMode.replace('boundary-', '');
        addAIMsg('user', '🎲 随机生成新数据（保持边界形状: ' + caseId + '）');
        // 调用边界情况 API，但带上 randomValues: true 来使用随机值
        const currentConfig = getCurrentParamValues();
        fetch('/api/data/boundary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: dataType, case: caseId, config: { ...currentConfig, randomValues: true } })
        }).then(r => r.json()).then(data => {
          if (data.error) {
            addAIMsg('system', '❌ ' + data.error);
          } else {
            sendCmd('reset');
            sendCmd('setData', { data: data });
            addAIMsg('system', '✅ 已生成新的随机数据（保持 ' + caseId + ' 形状）');
          }
        }).catch(err => {
          addAIMsg('system', '❌ 数据生成失败: ' + err.message);
        });
      } else {
        // 普通模式：根据参数面板生成随机数据
        addAIMsg('user', '🎲 随机生成新数据');
        handleGenerateData({ dataType: dataType });
      }
    }

    /** [🎲 换一批数据] → 手动输入 */
    function shortcutManualInput() {
      closeAllDropdowns();
      const dataType = guessDataType();
      const hints = {
        binaryTree: '请输入数值，用逗号分隔，如：10,5,15,3,7,12,20',
        array: '请输入数组元素，如：5,3,8,1,9,2,7',
        linkedList: '请输入链表值，如：1,3,5,7,9',
        graph: '暂不支持手动输入图数据，请使用自然语言描述',
        heap: '请输入堆元素，如：50,30,70,20,40,60,80',
        stack: '请输入栈元素（从底到顶），如：1,2,3,4,5',
        queue: '请输入队列元素（从头到尾），如：1,2,3,4,5',
      };
      const hint = hints[dataType] || '请输入数据，用逗号分隔';
      addAIMsg('system', '✏️ ' + hint);
      // 聚焦输入框
      const input = document.getElementById('ai-input');
      input.focus();
    }

    /** [⚠️ 边界情况] → 选择具体情况 */
    function shortcutBoundaryCase(caseId, caseLabel) {
      closeAllDropdowns();
      const dataType = guessDataType();
      if (!dataType) {
        addAIMsg('system', '⚠️ 当前场景不支持边界情况展示');
        return;
      }
      // ★ 记住边界情况形状，以便"随机生成"时保持形状
      currentMode = 'boundary-' + caseId;
      console.log('[状态机] 边界情况 → currentMode = ' + currentMode);
      addAIMsg('user', '⚠️ 展示边界情况: ' + caseLabel);
      handleBoundaryCase({ dataType: dataType, case: caseId });
    }

    /** 动态更新边界情况下拉菜单 */
    function updateBoundaryCasesDropdown() {
      const list = document.getElementById('boundary-cases-list');
      const features = sceneMeta?.dataFeatures || {};
      
      // 如果 dataFeatures 明确不支持边界情况，不渲染
      if (features.supportsBoundaryCase === false) {
        list.innerHTML = '<div class="dropdown-item" style="color:#999;font-size:12px;">当前场景不支持</div>';
        return;
      }
      
      // ★ 优先使用 dataFeatures.boundaryCases（由场景自己声明）
      if (features.boundaryCases && features.boundaryCases.length > 0) {
        let html = '';
        features.boundaryCases.forEach(c => {
          html += '<button class="dropdown-item" onclick="shortcutBoundaryCase(\\'' + c.id + '\\', \\'' + c.label + '\\')">';
          html += '<span class="item-icon">' + (c.icon || '⚠️') + '</span>';
          html += '<span class="item-label">' + c.label + '</span>';
          html += '</button>';
        });
        list.innerHTML = html;
        return;
      }
      
      // 回退：请求后端获取支持的边界情况
      const dataType = guessDataType();
      if (!dataType) {
        list.innerHTML = '<div class="dropdown-item" style="color:#999;font-size:12px;">当前场景不支持</div>';
        return;
      }
      fetch('/api/data/cases?type=' + dataType)
        .then(r => r.json())
        .then(cases => {
          if (!cases || cases.length === 0) {
            list.innerHTML = '<div class="dropdown-item" style="color:#999;font-size:12px;">无可用边界情况</div>';
            return;
          }
          let html = '';
          cases.forEach(c => {
            html += '<button class="dropdown-item" onclick="shortcutBoundaryCase(\\'' + c.id + '\\', \\'' + c.label + '\\')">';
            html += '<span class="item-icon">' + c.icon + '</span>';
            html += '<span class="item-label">' + c.label + '</span>';
            html += '</button>';
          });
          list.innerHTML = html;
        })
        .catch(() => {
          list.innerHTML = '<div class="dropdown-item" style="color:#999;font-size:12px;">加载失败</div>';
        });
    }
  </script>
</body>
</html>`;
}
