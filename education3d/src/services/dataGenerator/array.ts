/**
 * 数组数据生成器
 */
import type {
  IDataGenerator,
  DataGeneratorConfig,
  ArrayData,
  BoundaryCase,
  BoundaryCaseInfo,
} from './types.js';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uniqueRandomArray(size: number, min: number, max: number): number[] {
  const set = new Set<number>();
  const range = max - min + 1;
  if (size > range) size = range;
  while (set.size < size) {
    set.add(randInt(min, max));
  }
  return Array.from(set);
}

function randomArray(size: number, min: number, max: number): number[] {
  return Array.from({ length: size }, () => randInt(min, max));
}

function wrap(values: number[]): ArrayData {
  return { type: 'array', values, size: values.length };
}

const DEFAULT_CONFIG: Required<DataGeneratorConfig> = {
  size: 8,
  valueRange: [1, 99],
  sorted: false,
  unique: false,
  values: [],
  randomValues: false,
};

export class ArrayGenerator implements IDataGenerator<ArrayData> {

  generate(config?: DataGeneratorConfig): ArrayData {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    if (cfg.values.length > 0) return wrap([...cfg.values]);
    const values = cfg.unique
      ? uniqueRandomArray(cfg.size, cfg.valueRange[0], cfg.valueRange[1])
      : randomArray(cfg.size, cfg.valueRange[0], cfg.valueRange[1]);
    if (cfg.sorted) values.sort((a, b) => a - b);
    return wrap(values);
  }

  getBoundaryCase(caseType: BoundaryCase, config?: DataGeneratorConfig): ArrayData {
    const cfg = { ...DEFAULT_CONFIG, ...config };

    switch (caseType) {
      case 'empty':
        return wrap([]);

      case 'single':
        return wrap([randInt(cfg.valueRange[0], cfg.valueRange[1])]);

      case 'sorted': {
        const values = uniqueRandomArray(cfg.size, cfg.valueRange[0], cfg.valueRange[1]);
        values.sort((a, b) => a - b);
        return wrap(values);
      }

      case 'reversed': {
        const values = uniqueRandomArray(cfg.size, cfg.valueRange[0], cfg.valueRange[1]);
        values.sort((a, b) => b - a);
        return wrap(values);
      }

      case 'allSame': {
        const val = randInt(cfg.valueRange[0], cfg.valueRange[1]);
        return wrap(Array(cfg.size).fill(val));
      }

      case 'nearSorted': {
        // 近乎有序：先排序，再交换少量相邻元素
        const values = uniqueRandomArray(cfg.size, cfg.valueRange[0], cfg.valueRange[1]);
        values.sort((a, b) => a - b);
        const swaps = Math.max(1, Math.floor(cfg.size * 0.15));
        for (let i = 0; i < swaps; i++) {
          const idx = randInt(0, values.length - 2);
          [values[idx], values[idx + 1]] = [values[idx + 1], values[idx]];
        }
        return wrap(values);
      }

      case 'full': {
        // 满 = 较大的数组
        const values = randomArray(Math.max(cfg.size, 16), cfg.valueRange[0], cfg.valueRange[1]);
        return wrap(values);
      }

      default:
        return this.generate(config);
    }
  }

  getSupportedCases(): BoundaryCaseInfo[] {
    return [
      { id: 'single', label: '单元素', icon: '1️⃣', description: '只有一个元素的数组' },
      { id: 'sorted', label: '已排序(升序)', icon: '⬆️', description: '从小到大排列的数组' },
      { id: 'reversed', label: '逆序', icon: '⬇️', description: '从大到小排列的数组' },
      { id: 'allSame', label: '全相同元素', icon: '🔁', description: '所有元素都相同的数组' },
      { id: 'nearSorted', label: '近乎有序', icon: '〰️', description: '基本有序但有少量逆序对' },
    ];
  }

  fromValues(values: number[]): ArrayData {
    return wrap([...values]);
  }
}
