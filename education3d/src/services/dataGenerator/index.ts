/**
 * 通用数据结构生成器 - 统一导出
 *
 * 提供工厂函数，根据数据结构类型返回对应的生成器实例。
 * 支持：二叉树、数组、链表、图、堆、栈、队列
 */
import type {
  DataStructureType,
  DataStructureMeta,
  GeneratedData,
  IDataGenerator,
  DataGeneratorConfig,
  BoundaryCase,
  BoundaryCaseInfo,
} from './types.js';

import { BinaryTreeGenerator, BinarySearchTreeGenerator } from './binaryTree.js';
import { ArrayGenerator } from './array.js';
import { LinkedListGenerator } from './linkedList.js';
import { GraphGenerator } from './graph.js';
import { HeapGenerator } from './heap.js';
import { StackGenerator, QueueGenerator } from './stackQueue.js';

// ========== 单例注册表 ==========

const generators: Record<string, IDataGenerator<any>> = {
  binaryTree: new BinaryTreeGenerator(),
  binarySearchTree: new BinarySearchTreeGenerator(),
  array: new ArrayGenerator(),
  linkedList: new LinkedListGenerator(),
  graph: new GraphGenerator(),
  heap: new HeapGenerator(),
  stack: new StackGenerator(),
  queue: new QueueGenerator(),
};

// ========== 数据结构元信息注册表 ==========

const dataStructureMetas: DataStructureMeta[] = [
  {
    type: 'binaryTree',
    label: '二叉树',
    icon: '🌳',
    supportedCases: generators.binaryTree.getSupportedCases(),
  },
  {
    type: 'binarySearchTree',
    label: '二叉搜索树',
    icon: '🔍',
    supportedCases: generators.binarySearchTree.getSupportedCases(),
  },
  {
    type: 'array',
    label: '数组',
    icon: '📊',
    supportedCases: generators.array.getSupportedCases(),
  },
  {
    type: 'linkedList',
    label: '链表',
    icon: '🔗',
    supportedCases: generators.linkedList.getSupportedCases(),
  },
  {
    type: 'graph',
    label: '图',
    icon: '🕸️',
    supportedCases: generators.graph.getSupportedCases(),
  },
  {
    type: 'heap',
    label: '堆',
    icon: '⛰️',
    supportedCases: generators.heap.getSupportedCases(),
  },
  {
    type: 'stack',
    label: '栈',
    icon: '📚',
    supportedCases: generators.stack.getSupportedCases(),
  },
  {
    type: 'queue',
    label: '队列',
    icon: '🚶',
    supportedCases: generators.queue.getSupportedCases(),
  },
];

// ========== 公共 API ==========

/**
 * 获取指定数据结构的生成器实例
 */
export function getGenerator(type: DataStructureType): IDataGenerator<GeneratedData> | null {
  return generators[type] ?? null;
}

/**
 * 生成随机数据
 */
export function generateData(
  type: DataStructureType,
  config?: DataGeneratorConfig
): GeneratedData | null {
  const gen = generators[type];
  return gen ? gen.generate(config) : null;
}

/**
 * 生成边界情况数据
 */
export function generateBoundaryCase(
  type: DataStructureType,
  caseType: BoundaryCase,
  config?: DataGeneratorConfig
): GeneratedData | null {
  const gen = generators[type];
  return gen ? gen.getBoundaryCase(caseType, config) : null;
}

/**
 * 从用户自定义值生成数据
 */
export function generateFromValues(
  type: DataStructureType,
  values: number[]
): GeneratedData | null {
  const gen = generators[type];
  return gen ? gen.fromValues(values) : null;
}

/**
 * 获取指定数据结构支持的边界情况列表
 */
export function getSupportedCases(type: DataStructureType): BoundaryCaseInfo[] {
  const gen = generators[type];
  return gen ? gen.getSupportedCases() : [];
}

/**
 * 获取所有支持的数据结构元信息
 */
export function getAllDataStructures(): DataStructureMeta[] {
  return dataStructureMetas;
}

/**
 * 获取指定数据结构的元信息
 */
export function getDataStructureMeta(type: DataStructureType): DataStructureMeta | null {
  return dataStructureMetas.find(m => m.type === type) ?? null;
}

/**
 * 根据场景标题或关键词猜测数据结构类型
 */
export function guessDataStructureType(sceneTitle: string): DataStructureType | null {
  const title = sceneTitle.toLowerCase();

  const patterns: [RegExp, DataStructureType][] = [
    [/二叉搜索树|bst|binary\s*search\s*tree/, 'binarySearchTree'],
    [/二叉树|binary\s*tree|前序|中序|后序|层序|inorder|preorder|postorder|levelorder/, 'binaryTree'],
    [/数组|array|排序|sort|搜索|search|查找/, 'array'],
    [/链表|linked\s*list|单链|双链/, 'linkedList'],
    [/图|graph|bfs|dfs|dijkstra|最短路|拓扑|邻接/, 'graph'],
    [/堆|heap|优先队列|priority/, 'heap'],
    [/栈|stack|括号匹配|后缀表达式/, 'stack'],
    [/队列|queue|fifo|广度优先/, 'queue'],
    [/哈希|hash|散列/, 'hashTable'],
  ];

  for (const [regex, type] of patterns) {
    if (regex.test(title)) return type;
  }
  return null;
}

// ========== 导出类型 ==========

export type {
  DataStructureType,
  DataStructureMeta,
  GeneratedData,
  IDataGenerator,
  DataGeneratorConfig,
  BoundaryCase,
  BoundaryCaseInfo,
} from './types.js';
