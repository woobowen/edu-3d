/**
 * 栈 & 队列数据生成器
 */
import type {
  IDataGenerator,
  DataGeneratorConfig,
  StackData,
  QueueData,
  BoundaryCase,
  BoundaryCaseInfo,
} from './types.js';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomArray(size: number, min: number, max: number): number[] {
  return Array.from({ length: size }, () => randInt(min, max));
}

// ========== 栈生成器 ==========

const STACK_DEFAULT: Required<DataGeneratorConfig> = {
  size: 5,
  valueRange: [1, 99],
  sorted: false,
  unique: false,
  values: [],
  randomValues: false,
};

export class StackGenerator implements IDataGenerator<StackData> {

  generate(config?: DataGeneratorConfig): StackData {
    const cfg = { ...STACK_DEFAULT, ...config };
    const values = cfg.values.length > 0
      ? [...cfg.values]
      : randomArray(cfg.size, cfg.valueRange[0], cfg.valueRange[1]);
    return { type: 'stack', values, size: values.length };
  }

  getBoundaryCase(caseType: BoundaryCase, config?: DataGeneratorConfig): StackData {
    const cfg = { ...STACK_DEFAULT, ...config };

    switch (caseType) {
      case 'empty':
        return { type: 'stack', values: [], size: 0 };

      case 'single':
        return { type: 'stack', values: [randInt(cfg.valueRange[0], cfg.valueRange[1])], size: 1 };

      case 'full': {
        const values = randomArray(Math.max(cfg.size, 10), cfg.valueRange[0], cfg.valueRange[1]);
        return { type: 'stack', values, size: values.length };
      }

      default:
        return this.generate(config);
    }
  }

  getSupportedCases(): BoundaryCaseInfo[] {
    return [
      { id: 'single', label: '单元素', icon: '1️⃣', description: '只有一个元素的栈' },
      { id: 'full', label: '满栈', icon: '📦', description: '接近容量上限的栈' },
    ];
  }

  fromValues(values: number[]): StackData {
    return { type: 'stack', values: [...values], size: values.length };
  }
}

// ========== 队列生成器 ==========

const QUEUE_DEFAULT: Required<DataGeneratorConfig> = {
  size: 5,
  valueRange: [1, 99],
  sorted: false,
  unique: false,
  values: [],
  randomValues: false,
};

export class QueueGenerator implements IDataGenerator<QueueData> {

  generate(config?: DataGeneratorConfig): QueueData {
    const cfg = { ...QUEUE_DEFAULT, ...config };
    const values = cfg.values.length > 0
      ? [...cfg.values]
      : randomArray(cfg.size, cfg.valueRange[0], cfg.valueRange[1]);
    return { type: 'queue', values, size: values.length };
  }

  getBoundaryCase(caseType: BoundaryCase, config?: DataGeneratorConfig): QueueData {
    const cfg = { ...QUEUE_DEFAULT, ...config };

    switch (caseType) {
      case 'empty':
        return { type: 'queue', values: [], size: 0 };

      case 'single':
        return { type: 'queue', values: [randInt(cfg.valueRange[0], cfg.valueRange[1])], size: 1 };

      case 'full': {
        const values = randomArray(Math.max(cfg.size, 10), cfg.valueRange[0], cfg.valueRange[1]);
        return { type: 'queue', values, size: values.length };
      }

      default:
        return this.generate(config);
    }
  }

  getSupportedCases(): BoundaryCaseInfo[] {
    return [
      { id: 'single', label: '单元素', icon: '1️⃣', description: '只有一个元素的队列' },
      { id: 'full', label: '满队列', icon: '📦', description: '接近容量上限的队列' },
    ];
  }

  fromValues(values: number[]): QueueData {
    return { type: 'queue', values: [...values], size: values.length };
  }
}
