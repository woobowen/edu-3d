/**
 * 通用数据结构生成器 - 类型定义
 */

// ========== 数据结构类型枚举 ==========

export type DataStructureType =
  | 'binaryTree'        // 普通二叉树（层序构建，输入顺序 = 树结构顺序）
  | 'binarySearchTree'  // 二叉搜索树（BST 规则，左 < 根 < 右）
  | 'array'
  | 'linkedList'
  | 'graph'
  | 'heap'
  | 'stack'
  | 'queue'
  | 'hashTable';

// ========== 边界情况类型 ==========

/** 通用边界情况 */
export type CommonBoundaryCase =
  | 'empty'       // 空结构
  | 'single'      // 单元素
  | 'full';       // 满/完全

/** 二叉树专用边界情况 */
export type BinaryTreeBoundaryCase =
  | CommonBoundaryCase
  | 'leftOnly'     // 只有左子树（退化为链表）
  | 'rightOnly'    // 只有右子树（退化为链表）
  | 'skewed';      // 极度不平衡

/** 数组专用边界情况 */
export type ArrayBoundaryCase =
  | CommonBoundaryCase
  | 'sorted'       // 已排序(升序)
  | 'reversed'     // 逆序
  | 'allSame'      // 全相同元素
  | 'nearSorted';  // 近乎有序

/** 链表专用边界情况 */
export type LinkedListBoundaryCase =
  | CommonBoundaryCase
  | 'circular'     // 环形链表
  | 'palindrome';  // 回文链表

/** 图专用边界情况 */
export type GraphBoundaryCase =
  | CommonBoundaryCase
  | 'disconnected'  // 断开的图
  | 'complete'      // 完全图
  | 'sparse'        // 稀疏图
  | 'bipartite';    // 二部图

/** 堆专用边界情况 */
export type HeapBoundaryCase =
  | CommonBoundaryCase
  | 'minHeap'       // 最小堆
  | 'maxHeap';      // 最大堆

/** 所有边界情况的联合类型 */
export type BoundaryCase =
  | CommonBoundaryCase
  | BinaryTreeBoundaryCase
  | ArrayBoundaryCase
  | LinkedListBoundaryCase
  | GraphBoundaryCase
  | HeapBoundaryCase;

// ========== 边界情况元信息 ==========

export interface BoundaryCaseInfo {
  id: BoundaryCase;
  label: string;       // 显示名称
  icon: string;        // 图标 emoji
  description: string; // 描述
}

// ========== 生成配置 ==========

export interface DataGeneratorConfig {
  size?: number;                 // 数据规模
  valueRange?: [number, number]; // 数值范围
  sorted?: boolean;              // 是否排序
  unique?: boolean;              // 是否唯一
  values?: number[];             // 用户自定义值
  randomValues?: boolean;        // 边界情况是否使用随机值（而非简单序列）
}

// ========== 数据结构输出格式 ==========

/** 二叉树节点 */
export interface TreeNodeData {
  value: number | string;
  left?: TreeNodeData | null;
  right?: TreeNodeData | null;
}

/** 二叉树生成结果 */
export interface BinaryTreeData {
  type: 'binaryTree';
  root: TreeNodeData | null;
  values: (number | string)[];   // 层序遍历值列表（含 null 占位）
  flatValues: number[];          // 纯数值列表
  nodeCount: number;
}

/** 数组生成结果 */
export interface ArrayData {
  type: 'array';
  values: number[];
  size: number;
}

/** 链表节点 */
export interface ListNodeData {
  value: number | string;
  next?: number | null;  // 指向下一个节点的索引
}

/** 链表生成结果 */
export interface LinkedListData {
  type: 'linkedList';
  nodes: ListNodeData[];
  hasCycle: boolean;
  cycleIndex?: number;  // 环入口索引
}

/** 图的边 */
export interface GraphEdge {
  from: number | string;
  to: number | string;
  weight?: number;
}

/** 图生成结果 */
export interface GraphData {
  type: 'graph';
  vertices: (number | string)[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
}

/** 堆生成结果 */
export interface HeapData {
  type: 'heap';
  values: number[];
  heapType: 'min' | 'max';
  size: number;
}

/** 栈生成结果 */
export interface StackData {
  type: 'stack';
  values: number[];
  size: number;
}

/** 队列生成结果 */
export interface QueueData {
  type: 'queue';
  values: number[];
  size: number;
}

/** 哈希表条目 */
export interface HashEntry {
  key: string | number;
  value: any;
  bucket: number;
}

/** 哈希表生成结果 */
export interface HashTableData {
  type: 'hashTable';
  entries: HashEntry[];
  bucketCount: number;
  loadFactor: number;
}

/** 所有数据结构结果的联合类型 */
export type GeneratedData =
  | BinaryTreeData
  | ArrayData
  | LinkedListData
  | GraphData
  | HeapData
  | StackData
  | QueueData
  | HashTableData;

// ========== 生成器接口 ==========

export interface IDataGenerator<T extends GeneratedData> {
  /** 生成随机数据 */
  generate(config?: DataGeneratorConfig): T;

  /** 获取指定边界情况的数据 */
  getBoundaryCase(caseType: BoundaryCase, config?: DataGeneratorConfig): T;

  /** 获取支持的边界情况列表 */
  getSupportedCases(): BoundaryCaseInfo[];

  /** 从用户输入的值生成数据 */
  fromValues(values: number[]): T;
}

// ========== 数据结构元信息 ==========

export interface DataStructureMeta {
  type: DataStructureType;
  label: string;
  icon: string;
  supportedCases: BoundaryCaseInfo[];
}
