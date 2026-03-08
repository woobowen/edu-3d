/**
 * 链表数据生成器
 */
import type {
  IDataGenerator,
  DataGeneratorConfig,
  LinkedListData,
  ListNodeData,
  BoundaryCase,
  BoundaryCaseInfo,
} from './types.js';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomArray(size: number, min: number, max: number): number[] {
  return Array.from({ length: size }, () => randInt(min, max));
}

function buildList(values: number[], cycleIndex?: number): LinkedListData {
  if (values.length === 0) {
    return { type: 'linkedList', nodes: [], hasCycle: false };
  }
  const nodes: ListNodeData[] = values.map((v, i) => ({
    value: v,
    next: i < values.length - 1 ? i + 1 : null,
  }));
  const hasCycle = cycleIndex !== undefined && cycleIndex >= 0 && cycleIndex < values.length;
  if (hasCycle) {
    nodes[nodes.length - 1].next = cycleIndex;
  }
  return {
    type: 'linkedList',
    nodes,
    hasCycle,
    cycleIndex: hasCycle ? cycleIndex : undefined,
  };
}

const DEFAULT_CONFIG: Required<DataGeneratorConfig> = {
  size: 6,
  valueRange: [1, 99],
  sorted: false,
  unique: false,
  values: [],
  randomValues: false,
};

export class LinkedListGenerator implements IDataGenerator<LinkedListData> {

  generate(config?: DataGeneratorConfig): LinkedListData {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    const values = cfg.values.length > 0
      ? [...cfg.values]
      : randomArray(cfg.size, cfg.valueRange[0], cfg.valueRange[1]);
    if (cfg.sorted) values.sort((a, b) => a - b);
    return buildList(values);
  }

  getBoundaryCase(caseType: BoundaryCase, config?: DataGeneratorConfig): LinkedListData {
    const cfg = { ...DEFAULT_CONFIG, ...config };

    switch (caseType) {
      case 'single':
        return buildList([randInt(cfg.valueRange[0], cfg.valueRange[1])]);

      case 'circular': {
        const values = randomArray(Math.min(cfg.size, 5), cfg.valueRange[0], cfg.valueRange[1]);
        const cycleIdx = randInt(0, Math.max(0, values.length - 2));
        return buildList(values, cycleIdx);
      }

      case 'palindrome': {
        const half = randomArray(Math.ceil(cfg.size / 2), cfg.valueRange[0], cfg.valueRange[1]);
        const values = [...half, ...half.slice(0, Math.floor(cfg.size / 2)).reverse()];
        return buildList(values);
      }

      case 'full': {
        const values = randomArray(Math.max(cfg.size, 10), cfg.valueRange[0], cfg.valueRange[1]);
        return buildList(values);
      }

      default:
        return this.generate(config);
    }
  }

  getSupportedCases(): BoundaryCaseInfo[] {
    return [
      { id: 'single', label: '单节点', icon: '1️⃣', description: '只有一个节点的链表' },
      { id: 'circular', label: '环形链表', icon: '🔄', description: '尾节点指向中间节点形成环' },
      { id: 'palindrome', label: '回文链表', icon: '🪞', description: '正读反读相同的链表' },
    ];
  }

  fromValues(values: number[]): LinkedListData {
    return buildList([...values]);
  }
}
