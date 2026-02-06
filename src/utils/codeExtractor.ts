// 代码提取器 - 从 AI 响应中提取 HTML 代码和结构化信息

export interface ExtractedContent {
  aestheticAnalysis: string | null;
  educationalRationale: string | null;
  htmlCode: string | null;
  interactionGuide: string | null;
}

/**
 * 从 AI 生成的内容中提取各个部分
 */
export function extractContent(fullResponse: string): ExtractedContent {
  const result: ExtractedContent = {
    aestheticAnalysis: null,
    educationalRationale: null,
    htmlCode: null,
    interactionGuide: null,
  };

  // 提取 HTML 代码（在 ```html 和 ``` 之间）
  const htmlMatch = fullResponse.match(/```html\s*\n([\s\S]*?)```/);
  
  if (htmlMatch) {
    result.htmlCode = htmlMatch[1].trim();
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
