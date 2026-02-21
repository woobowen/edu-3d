// 代码提取器 - 从 AI 响应中提取 HTML 代码和结构化信息

export interface ExtractedContent {
  aestheticAnalysis: string | null;
  educationalRationale: string | null;
  htmlCode: string | null;
  interactionGuide: string | null;
}

/**
 * 从 AI 生成的内容中提取各个部分。
 * HTML 提取采用"降维打击"策略：直接定位 HTML 文档的起止标签，
 * 不依赖 Markdown 反引号包裹，彻底规避模型输出格式不稳定的问题。
 *
 * 断尾模式：若找不到 </html> 结束标签（模型输出被截断），
 * 则从起始位置截取至响应末尾，并自动补齐 </body></html> 闭合标签，
 * 保证下游 validator 和浏览器渲染不因缺失闭合标签而崩溃。
 */
export function extractContent(fullResponse: string): ExtractedContent {
  const result: ExtractedContent = {
    aestheticAnalysis: null,
    educationalRationale: null,
    htmlCode: null,
    interactionGuide: null,
  };

  // 【降维打击】提取 HTML 代码
  // 策略：查找 '<!DOCTYPE html>' 或 '<html' 的首次出现位置作为起点，
  //       查找 '</html>' 的最后一次出现位置作为终点，截取中间全部内容。
  const doctypeIndex = fullResponse.indexOf('<!DOCTYPE html>');
  const htmlTagIndex = fullResponse.indexOf('<html');

  // 确定 HTML 起始位置：优先使用 <!DOCTYPE html>，否则使用 <html
  let startIndex = -1;
  if (doctypeIndex !== -1 && htmlTagIndex !== -1) {
    // 两者都存在时，取位置更靠前的那个（通常 DOCTYPE 在 <html 之前）
    startIndex = Math.min(doctypeIndex, htmlTagIndex);
  } else if (doctypeIndex !== -1) {
    startIndex = doctypeIndex;
  } else if (htmlTagIndex !== -1) {
    startIndex = htmlTagIndex;
  }

  if (startIndex !== -1) {
    // 查找最后一个 </html> 作为终点
    const endTag = '</html>';
    const endIndex = fullResponse.lastIndexOf(endTag);

    if (endIndex !== -1 && endIndex > startIndex) {
      // 正常模式：截取从起点到 </html> 结束标签末尾的全部内容
      result.htmlCode = fullResponse.substring(startIndex, endIndex + endTag.length).trim();
    } else {
      // 【断尾模式】找不到合法的 </html> 结束标签，说明模型输出被截断。
      // 从起始位置截取至响应末尾，并自动补齐 </body></html> 闭合标签，
      // 确保产物是结构上可解析的完整 HTML 文档。
      console.warn('[codeExtractor] ⚠️ 断尾模式激活：未找到 </html> 结束标签，推测模型输出被截断。');
      console.warn('[codeExtractor] 将从起始位置截取至末尾，并自动补齐 </body></html> 闭合标签。');
      const truncatedHtml = fullResponse.substring(startIndex).trim();
      result.htmlCode = truncatedHtml + '\n</body>\n</html>';
    }
  } else {
    // 完全找不到 HTML 内容
    console.warn('[codeExtractor] 在 AI 响应中未找到任何 HTML 起始标志（<!DOCTYPE html> 或 <html）。');
    result.htmlCode = null;
  }

  // 提取美学分析（在 ### 美学分析 和下一个 ### 之间）
  const aestheticMatch = fullResponse.match(/###\s*美学分析\s*\n([\s\S]*?)(?=###|$)/);
  if (aestheticMatch) {
    result.aestheticAnalysis = aestheticMatch[1].trim();
  }

  // 提取教育设计理念
  const rationaleMatch = fullResponse.match(/###\s*教育设计理念\s*\n([\s\S]*?)(?=###|$)/);
  if (rationaleMatch) {
    result.educationalRationale = rationaleMatch[1].trim();
  }

  // 提取交互指南
  const guideMatch = fullResponse.match(/###\s*交互指南\s*\n([\s\S]*?)(?=###|$)/);
  if (guideMatch) {
    result.interactionGuide = guideMatch[1].trim();
  }

  return result;
}

/**
 * 从美学分析中提取 JSON
 */
export function extractAestheticJSON(aestheticText: string): any {
  try {
    const jsonMatch = aestheticText.match(/```json\s*\n([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return null;
  } catch (error) {
    console.error('Failed to parse aesthetic JSON:', error);
    return null;
  }
}

/**
 * 从交互指南中提取交互列表
 */
export function extractInteractionList(guideText: string): string[] {
  const interactions: string[] = [];

  // 匹配项目符号列表
  const listItems = guideText.match(/[-*•]\s*(.+?)(?=\n[-*•]|\n\n|$)/gs);
  if (listItems) {
    interactions.push(...listItems.map(item => item.replace(/^[-*•]\s*/, '').trim()));
  }

  // 匹配数字列表
  const numberedItems = guideText.match(/\d+\.\s*(.+?)(?=\n\d+\.|\n\n|$)/gs);
  if (numberedItems) {
    interactions.push(...numberedItems.map(item => item.replace(/^\d+\.\s*/, '').trim()));
  }

  return interactions.filter(item => item.length > 0);
}
