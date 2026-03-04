/**
 * 二叉树数据生成器
 * 支持两种模式：
 * - 普通二叉树（binaryTree）：层序构建，输入顺序 = 树结构顺序
 * - 二叉搜索树（binarySearchTree）：BST 规则，左 < 根 < 右
 */
import type {
  IDataGenerator,
  DataGeneratorConfig,
  BinaryTreeData,
  TreeNodeData,
  BoundaryCase,
  BoundaryCaseInfo,
} from './types.js';

// ========== 工具函数 ==========

/** 生成简单序列 [1, 2, 3, ..., n] */
function simpleSequence(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i + 1);
}

/** 生成指定范围内的随机整数 */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 生成不重复的随机数数组 */
function uniqueRandomArray(size: number, min: number, max: number): number[] {
  const set = new Set<number>();
  const range = max - min + 1;
  if (size > range) size = range;
  while (set.size < size) {
    set.add(randInt(min, max));
  }
  return Array.from(set);
}

// ========== 树构建方法 ==========

/** 从数组层序构建普通二叉树（输入顺序 = 树结构顺序） */
function buildTreeFromLevelOrder(values: number[]): TreeNodeData | null {
  if (values.length === 0) return null;
  const root: TreeNodeData = { value: values[0], left: null, right: null };
  const queue: TreeNodeData[] = [root];
  let i = 1;
  while (i < values.length && queue.length > 0) {
    const parent = queue.shift()!;
    if (i < values.length) {
      parent.left = { value: values[i], left: null, right: null };
      queue.push(parent.left);
      i++;
    }
    if (i < values.length) {
      parent.right = { value: values[i], left: null, right: null };
      queue.push(parent.right);
      i++;
    }
  }
  return root;
}

/** 将有序数组构建为平衡 BST */
function sortedArrayToBST(arr: number[]): TreeNodeData | null {
  if (arr.length === 0) return null;
  const mid = Math.floor(arr.length / 2);
  return {
    value: arr[mid],
    left: sortedArrayToBST(arr.slice(0, mid)),
    right: sortedArrayToBST(arr.slice(mid + 1)),
  };
}

/** 将值依次插入 BST */
function insertIntoBST(root: TreeNodeData | null, value: number): TreeNodeData {
  if (!root) return { value, left: null, right: null };
  if (value < (root.value as number)) {
    root.left = insertIntoBST(root.left ?? null, value);
  } else {
    root.right = insertIntoBST(root.right ?? null, value);
  }
  return root;
}

/** 直接构建左链（每个节点只有左子节点） */
function buildLeftChain(values: number[]): TreeNodeData | null {
  if (values.length === 0) return null;
  const root: TreeNodeData = { value: values[0], left: null, right: null };
  let current = root;
  for (let i = 1; i < values.length; i++) {
    current.left = { value: values[i], left: null, right: null };
    current = current.left;
  }
  return root;
}

/** 直接构建右链（每个节点只有右子节点） */
function buildRightChain(values: number[]): TreeNodeData | null {
  if (values.length === 0) return null;
  const root: TreeNodeData = { value: values[0], left: null, right: null };
  let current = root;
  for (let i = 1; i < values.length; i++) {
    current.right = { value: values[i], left: null, right: null };
    current = current.right;
  }
  return root;
}

// ========== 遍历/统计函数 ==========

/** 层序遍历获取值列表 */
function levelOrderValues(root: TreeNodeData | null): (number | string | null)[] {
  if (!root) return [];
  const result: (number | string | null)[] = [];
  const queue: (TreeNodeData | null)[] = [root];
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (node) {
      result.push(node.value);
      queue.push(node.left ?? null);
      queue.push(node.right ?? null);
    } else {
      result.push(null);
    }
  }
  // 去除末尾的 null
  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop();
  }
  return result;
}

/** 获取所有节点值（中序遍历） */
function flatValues(root: TreeNodeData | null): number[] {
  if (!root) return [];
  return [
    ...flatValues(root.left ?? null),
    root.value as number,
    ...flatValues(root.right ?? null),
  ];
}

/** 计算节点数 */
function countNodes(root: TreeNodeData | null): number {
  if (!root) return 0;
  return 1 + countNodes(root.left ?? null) + countNodes(root.right ?? null);
}

/** 包装结果 */
function wrapResult(root: TreeNodeData | null): BinaryTreeData {
  return {
    type: 'binaryTree',
    root,
    values: levelOrderValues(root) as (number | string)[],
    flatValues: flatValues(root),
    nodeCount: countNodes(root),
  };
}

const DEFAULT_CONFIG: Required<DataGeneratorConfig> = {
  size: 7,
  valueRange: [1, 99],
  sorted: false,
  unique: true,
  values: [],
  randomValues: false,
};

// ========== 普通二叉树生成器（层序构建） ==========

export class BinaryTreeGenerator implements IDataGenerator<BinaryTreeData> {

  generate(config?: DataGeneratorConfig): BinaryTreeData {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    const values = cfg.values.length > 0
      ? cfg.values
      : uniqueRandomArray(cfg.size, cfg.valueRange[0], cfg.valueRange[1]);

    // 普通二叉树：层序构建
    const root = buildTreeFromLevelOrder(values);
    return wrapResult(root);
  }

  getBoundaryCase(caseType: BoundaryCase, config?: DataGeneratorConfig): BinaryTreeData {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    const n = Math.min(cfg.size, 5);

    /** 根据 randomValues 决定使用随机值还是简单序列 */
    const getValues = (count: number) =>
      cfg.randomValues
        ? uniqueRandomArray(count, cfg.valueRange[0], cfg.valueRange[1])
        : simpleSequence(count);

    switch (caseType) {
      case 'empty':
        return wrapResult(null);

      case 'single': {
        const v = cfg.randomValues ? randInt(cfg.valueRange[0], cfg.valueRange[1]) : 1;
        return wrapResult({ value: v, left: null, right: null });
      }

      case 'leftOnly': {
        // 只有左子树：直接构建左链
        const values = getValues(n);
        return wrapResult(buildLeftChain(values));
      }

      case 'rightOnly': {
        // 只有右子树：直接构建右链
        const values = getValues(n);
        return wrapResult(buildRightChain(values));
      }

      case 'full': {
        // 满二叉树：每个非叶节点都有 2 个子节点，且所有叶子在同一层
        const h = 3;  // 固定 3 层，7 个节点
        const nodeCount = Math.pow(2, h) - 1;
        const values = getValues(nodeCount);
        return wrapResult(buildTreeFromLevelOrder(values));
      }

      case 'skewed': {
        // 极度不平衡：交替左右
        const values = getValues(Math.min(cfg.size, 6));
        if (values.length === 0) return wrapResult(null);
        const root: TreeNodeData = { value: values[0], left: null, right: null };
        let current = root;
        for (let i = 1; i < values.length; i++) {
          const node: TreeNodeData = { value: values[i], left: null, right: null };
          if (i % 2 === 1) {
            current.left = node;
          } else {
            current.right = node;
          }
          current = node;
        }
        return wrapResult(root);
      }

      default:
        return this.generate(config);
    }
  }

  getSupportedCases(): BoundaryCaseInfo[] {
    return [
      { id: 'single', label: '单节点', icon: '1️⃣', description: '只有根节点的二叉树' },
      { id: 'leftOnly', label: '只有左子树', icon: '↙️', description: '退化为左链的二叉树' },
      { id: 'rightOnly', label: '只有右子树', icon: '↗️', description: '退化为右链的二叉树' },
      { id: 'full', label: '满二叉树', icon: '📦', description: '每个非叶节点都有2个子节点，叶子在同一层' },
    ];
  }

  fromValues(values: number[]): BinaryTreeData {
    if (values.length === 0) return wrapResult(null);
    // 普通二叉树：按层序构建（输入顺序 = 树结构顺序）
    return wrapResult(buildTreeFromLevelOrder(values));
  }
}

// ========== 二叉搜索树生成器（BST 规则） ==========

export class BinarySearchTreeGenerator implements IDataGenerator<BinaryTreeData> {

  generate(config?: DataGeneratorConfig): BinaryTreeData {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    const values = cfg.values.length > 0
      ? cfg.values
      : uniqueRandomArray(cfg.size, cfg.valueRange[0], cfg.valueRange[1]);

    // BST：排序后用中点法构建平衡 BST
    const sorted = [...values].sort((a, b) => a - b);
    const root = sortedArrayToBST(sorted);
    return wrapResult(root);
  }

  getBoundaryCase(caseType: BoundaryCase, config?: DataGeneratorConfig): BinaryTreeData {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    const n = Math.min(cfg.size, 5);

    /** 根据 randomValues 决定使用随机值还是简单序列 */
    const getValues = (count: number) =>
      cfg.randomValues
        ? uniqueRandomArray(count, cfg.valueRange[0], cfg.valueRange[1])
        : simpleSequence(count);

    switch (caseType) {
      case 'empty':
        return wrapResult(null);

      case 'single': {
        const v = cfg.randomValues ? randInt(cfg.valueRange[0], cfg.valueRange[1]) : 1;
        return wrapResult({ value: v, left: null, right: null });
      }

      case 'leftOnly': {
        // 只有左子树：降序插入 BST
        const values = getValues(n).sort((a, b) => a - b);
        let root: TreeNodeData | null = null;
        for (let i = values.length - 1; i >= 0; i--) {
          root = insertIntoBST(root, values[i]);
        }
        return wrapResult(root);
      }

      case 'rightOnly': {
        // 只有右子树：升序插入 BST
        const values = getValues(n).sort((a, b) => a - b);
        let root: TreeNodeData | null = null;
        for (const v of values) {
          root = insertIntoBST(root, v);
        }
        return wrapResult(root);
      }

      case 'full': {
        // 满 BST：3 层，7 个节点
        const h = 3;
        const nodeCount = Math.pow(2, h) - 1;
        const values = getValues(nodeCount).sort((a, b) => a - b);
        return wrapResult(sortedArrayToBST(values));
      }

      case 'skewed': {
        // 极度不平衡 BST：交替插入大小值
        const values = getValues(Math.min(cfg.size, 6)).sort((a, b) => a - b);
        const reordered: number[] = [];
        let lo = 0, hi = values.length - 1;
        while (lo <= hi) {
          reordered.push(values[lo++]);
          if (lo <= hi) reordered.push(values[hi--]);
        }
        let root: TreeNodeData | null = null;
        for (const v of reordered) {
          root = insertIntoBST(root, v);
        }
        return wrapResult(root);
      }

      default:
        return this.generate(config);
    }
  }

  getSupportedCases(): BoundaryCaseInfo[] {
    return [
      { id: 'single', label: '单节点', icon: '1️⃣', description: '只有根节点的 BST' },
      { id: 'leftOnly', label: '只有左子树', icon: '↙️', description: '退化为左链的 BST（降序插入）' },
      { id: 'rightOnly', label: '只有右子树', icon: '↗️', description: '退化为右链的 BST（升序插入）' },
      { id: 'full', label: '满二叉搜索树', icon: '📦', description: '每层都填满的 BST' },
    ];
  }

  fromValues(values: number[]): BinaryTreeData {
    if (values.length === 0) return wrapResult(null);
    // BST：以第一个值为根，依次插入
    let root: TreeNodeData | null = null;
    for (const v of values) {
      root = insertIntoBST(root, v);
    }
    return wrapResult(root);
  }
}
