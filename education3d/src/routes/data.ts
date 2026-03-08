/**
 * 数据生成 API 路由
 * 提供数据结构的随机生成、边界情况生成、自定义值生成功能
 */
import { Router, Request, Response } from 'express';
import {
  generateData,
  generateBoundaryCase,
  generateFromValues,
  getSupportedCases,
} from '@/src/services/dataGenerator/index.js';
import type { DataStructureType, BoundaryCase } from '@/src/services/dataGenerator/types.js';

const router: ReturnType<typeof Router> = Router();

// 合法的数据结构类型
const VALID_TYPES = new Set<string>([
  'binaryTree', 'array', 'linkedList', 'graph', 'heap', 'stack', 'queue',
]);

function isValidType(type: string): type is DataStructureType {
  return VALID_TYPES.has(type);
}

/**
 * POST /api/data/generate
 * 生成随机数据
 * Body: { type: string, config?: { size?, valueRange?, sorted?, unique? } }
 */
router.post('/data/generate', (req: Request, res: Response) => {
  try {
    const { type, config } = req.body;

    if (!type || !isValidType(type)) {
      return res.status(400).json({ error: `不支持的数据结构类型: ${type}` });
    }

    const data = generateData(type, config);
    if (!data) {
      return res.status(500).json({ error: '数据生成失败' });
    }

    console.log(`[Data API] 生成 ${type} 随机数据`);
    res.json(data);
  } catch (error) {
    console.error('[Data API] generate error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : '数据生成失败',
    });
  }
});

/**
 * POST /api/data/boundary
 * 生成边界情况数据
 * Body: { type: string, case: string, config?: object }
 */
router.post('/data/boundary', (req: Request, res: Response) => {
  try {
    const { type, case: caseType, config } = req.body;

    if (!type || !isValidType(type)) {
      return res.status(400).json({ error: `不支持的数据结构类型: ${type}` });
    }

    if (!caseType) {
      return res.status(400).json({ error: '必须指定边界情况类型(case)' });
    }

    const data = generateBoundaryCase(type, caseType as BoundaryCase, config);
    if (!data) {
      return res.status(500).json({ error: '边界情况数据生成失败' });
    }

    console.log(`[Data API] 生成 ${type} 边界情况: ${caseType}`);
    res.json(data);
  } catch (error) {
    console.error('[Data API] boundary error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : '边界情况数据生成失败',
    });
  }
});

/**
 * POST /api/data/fromValues
 * 从用户自定义值生成数据
 * Body: { type: string, values: number[] }
 */
router.post('/data/fromValues', (req: Request, res: Response) => {
  try {
    const { type, values } = req.body;

    if (!type || !isValidType(type)) {
      return res.status(400).json({ error: `不支持的数据结构类型: ${type}` });
    }

    if (!Array.isArray(values)) {
      return res.status(400).json({ error: 'values 必须是数组' });
    }

    // 确保都是数字
    const numValues = values.map((v: any) => Number(v)).filter((v: number) => !isNaN(v));

    const data = generateFromValues(type, numValues);
    if (!data) {
      return res.status(500).json({ error: '自定义数据生成失败' });
    }

    console.log(`[Data API] 从自定义值生成 ${type}, 值: [${numValues.join(',')}]`);
    res.json(data);
  } catch (error) {
    console.error('[Data API] fromValues error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : '自定义数据生成失败',
    });
  }
});

/**
 * GET /api/data/cases?type=xxx
 * 获取指定数据结构支持的边界情况列表
 */
router.get('/data/cases', (req: Request, res: Response) => {
  try {
    const type = req.query.type as string;

    if (!type || !isValidType(type)) {
      return res.status(400).json({ error: `不支持的数据结构类型: ${type}` });
    }

    const cases = getSupportedCases(type);
    console.log(`[Data API] 获取 ${type} 边界情况列表, 共 ${cases.length} 项`);
    res.json(cases);
  } catch (error) {
    console.error('[Data API] cases error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : '获取边界情况失败',
    });
  }
});

export default router;
