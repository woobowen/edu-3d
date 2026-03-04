/**
 * 堆数据生成器
 */
import type {
  IDataGenerator,
  DataGeneratorConfig,
  HeapData,
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

/** 堆化（下沉） */
function heapify(arr: number[], n: number, i: number, isMax: boolean): void {
  let target = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (isMax) {
    if (left < n && arr[left] > arr[target]) target = left;
    if (right < n && arr[right] > arr[target]) target = right;
  } else {
    if (left < n && arr[left] < arr[target]) target = left;
    if (right < n && arr[right] < arr[target]) target = right;
  }

  if (target !== i) {
    [arr[i], arr[target]] = [arr[target], arr[i]];
    heapify(arr, n, target, isMax);
  }
}

/** 构建堆 */
function buildHeap(arr: number[], isMax: boolean): number[] {
  const result = [...arr];
  const n = result.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(result, n, i, isMax);
  }
  return result;
}

function wrap(values: number[], heapType: 'min' | 'max'): HeapData {
  return { type: 'heap', values, heapType, size: values.length };
}

const DEFAULT_CONFIG: Required<DataGeneratorConfig> = {
  size: 7,
  valueRange: [1, 99],
  sorted: false,
  unique: true,
  values: [],
  randomValues: false,
};

export class HeapGenerator implements IDataGenerator<HeapData> {

  generate(config?: DataGeneratorConfig): HeapData {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    const raw = cfg.values.length > 0
      ? [...cfg.values]
      : uniqueRandomArray(cfg.size, cfg.valueRange[0], cfg.valueRange[1]);
    const values = buildHeap(raw, true); // 默认最大堆
    return wrap(values, 'max');
  }

  getBoundaryCase(caseType: BoundaryCase, config?: DataGeneratorConfig): HeapData {
    const cfg = { ...DEFAULT_CONFIG, ...config };

    switch (caseType) {
      case 'empty':
        return wrap([], 'max');

      case 'single':
        return wrap([randInt(cfg.valueRange[0], cfg.valueRange[1])], 'max');

      case 'full': {
        // 满堆：节点数 = 2^h - 1
        const h = Math.max(2, Math.min(4, Math.ceil(Math.log2(cfg.size + 1))));
        const count = Math.pow(2, h) - 1;
        const raw = uniqueRandomArray(count, cfg.valueRange[0], cfg.valueRange[1]);
        return wrap(buildHeap(raw, true), 'max');
      }

      case 'minHeap': {
        const raw = uniqueRandomArray(cfg.size, cfg.valueRange[0], cfg.valueRange[1]);
        return wrap(buildHeap(raw, false), 'min');
      }

      case 'maxHeap': {
        const raw = uniqueRandomArray(cfg.size, cfg.valueRange[0], cfg.valueRange[1]);
        return wrap(buildHeap(raw, true), 'max');
      }

      default:
        return this.generate(config);
    }
  }

  getSupportedCases(): BoundaryCaseInfo[] {
    return [
      { id: 'single', label: '单元素', icon: '1️⃣', description: '只有一个元素的堆' },
      { id: 'maxHeap', label: '最大堆', icon: '⬆️', description: '父节点 ≥ 子节点的堆' },
      { id: 'minHeap', label: '最小堆', icon: '⬇️', description: '父节点 ≤ 子节点的堆' },
      { id: 'full', label: '满堆', icon: '📦', description: '每层都填满的完全堆' },
    ];
  }

  fromValues(values: number[]): HeapData {
    if (values.length === 0) return wrap([], 'max');
    return wrap(buildHeap([...values], true), 'max');
  }
}
