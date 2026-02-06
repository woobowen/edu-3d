// 安全验证器 - 验证生成的 HTML 代码安全性

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 验证生成的 HTML 代码
 */
export function validateGeneratedCode(html: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  if (!html || html.trim().length === 0) {
    result.isValid = false;
    result.errors.push('HTML 代码为空');
    return result;
  }

  // 危险模式列表
  const forbiddenPatterns = [
    { pattern: /localStorage/gi, message: '禁止使用 localStorage' },
    { pattern: /sessionStorage/gi, message: '禁止使用 sessionStorage' },
    { pattern: /document\.cookie/gi, message: '禁止访问 cookie' },
    { pattern: /window\.parent/gi, message: '禁止访问父窗口' },
    { pattern: /window\.top/gi, message: '禁止访问顶层窗口' },
    { pattern: /eval\s*\(/gi, message: '禁止使用 eval' },
    { pattern: /new\s+Function/gi, message: '禁止使用 Function 构造器' },
    { pattern: /innerHTML\s*=/gi, message: '警告：使用 innerHTML 可能存在 XSS 风险', isWarning: true },
  ];

  // 检查危险模式
  for (const { pattern, message, isWarning } of forbiddenPatterns) {
    if (pattern.test(html)) {
      if (isWarning) {
        result.warnings.push(message);
      } else {
        result.isValid = false;
        result.errors.push(message);
      }
    }
  }

  // 检查跨域脚本：仅允许当前域的相对路径
  const scriptSrcMatches = html.matchAll(/<script[^>]*src=["']([^"']+)["']/gi);
  for (const match of scriptSrcMatches) {
    const src = match[1];
    const isRelativePath = !/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(src) && !src.startsWith('//');

    if (!isRelativePath) {
      result.isValid = false;
      result.errors.push(`禁止跨域脚本: ${src} - 请使用当前域的相对路径`);
    }
  }

  // 检查是否包含基本的 HTML 结构
  if (!/<html/i.test(html) || !/<body/i.test(html)) {
    result.warnings.push('HTML 结构不完整，可能缺少 <html> 或 <body> 标签');
  }

  // 检查是否包含 Three.js
  if (!/three\.module\.js|three\.min\.js/i.test(html)) {
    result.warnings.push('未检测到 Three.js 引用');
  }

  return result;
}

/**
 * 尝试自动修复常见问题
 */
export function autoFixCode(html: string): string {
  let fixed = html;

  // 移除危险的 API 调用
  fixed = fixed.replace(/localStorage\./g, '// localStorage.');
  fixed = fixed.replace(/sessionStorage\./g, '// sessionStorage.');
  fixed = fixed.replace(/document\.cookie/g, '// document.cookie');
  fixed = fixed.replace(/window\.parent/g, '// window.parent');
  fixed = fixed.replace(/window\.top/g, '// window.top');

  return fixed;
}
