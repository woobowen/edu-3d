/**
 * 图数据生成器
 */
import type {
  IDataGenerator,
  DataGeneratorConfig,
  GraphData,
  GraphEdge,
  GraphPosition,
  BoundaryCase,
  BoundaryCaseInfo,
} from './types.js';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const VERTEX_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function makeVertices(count: number): string[] {
  return VERTEX_LABELS.slice(0, Math.min(count, 26));
}

/** 生成环形布局坐标（适用于一般图、完全图） */
function circularLayout(vertices: (number | string)[], radius: number = 5): GraphPosition[] {
  const n = vertices.length;
  if (n === 0) return [];
  if (n === 1) return [{ id: vertices[0], x: 0, y: 0, z: 0 }];
  return vertices.map((v, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2; // 从顶部开始
    return {
      id: v,
      x: Math.round(radius * Math.cos(angle) * 100) / 100,
      y: Math.round(radius * Math.sin(angle) * 100) / 100,
      z: 0,
    };
  });
}

/** 生成水平线性布局坐标（适用于链状图） */
function linearLayout(vertices: (number | string)[], spacing: number = 2.5): GraphPosition[] {
  const n = vertices.length;
  const startX = -((n - 1) * spacing) / 2;
  return vertices.map((v, i) => ({
    id: v,
    x: Math.round((startX + i * spacing) * 100) / 100,
    y: 0,
    z: 0,
  }));
}

/** 生成分组布局坐标（适用于不连通图、二部图） */
function splitLayout(group1: (number | string)[], group2: (number | string)[], gapX: number = 4): GraphPosition[] {
  const positions: GraphPosition[] = [];
  // 左侧子图
  const leftStartX = -(gapX / 2) - ((group1.length - 1) * 2) / 2;
  group1.forEach((v, i) => {
    positions.push({
      id: v,
      x: Math.round((leftStartX + i * 2) * 100) / 100,
      y: Math.round((i % 2 === 0 ? 1 : -1) * 1.5 * 100) / 100,
      z: 0,
    });
  });
  // 右侧子图
  group2.forEach((v, i) => {
    positions.push({
      id: v,
      x: Math.round(((gapX / 2) + i * 2) * 100) / 100,
      y: Math.round((i % 2 === 0 ? 1 : -1) * 1.5 * 100) / 100,
      z: 0,
    });
  });
  return positions;
}

/** 生成随机连通图（附带环形布局坐标） */
function randomConnectedGraph(vertexCount: number, edgeDensity: number = 0.4): GraphData {
  const vertices = makeVertices(vertexCount);
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  // 先生成一棵生成树确保连通
  const shuffled = [...vertices].sort(() => Math.random() - 0.5);
  for (let i = 1; i < shuffled.length; i++) {
    const from = shuffled[i - 1];
    const to = shuffled[i];
    const key = [from, to].sort().join('-');
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ from, to });
    }
  }

  // 根据密度添加额外边
  const maxEdges = (vertexCount * (vertexCount - 1)) / 2;
  const targetEdges = Math.floor(maxEdges * edgeDensity);
  while (edges.length < targetEdges) {
    const i = randInt(0, vertexCount - 1);
    const j = randInt(0, vertexCount - 1);
    if (i === j) continue;
    const key = [vertices[i], vertices[j]].sort().join('-');
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ from: vertices[i], to: vertices[j] });
    }
  }

  const positions = circularLayout(vertices);
  return { type: 'graph', vertices, edges, directed: false, weighted: false, positions };
}

const DEFAULT_CONFIG: Required<DataGeneratorConfig> = {
  size: 6,
  valueRange: [1, 10],
  sorted: false,
  unique: true,
  values: [],
  randomValues: false,
};

export class GraphGenerator implements IDataGenerator<GraphData> {

  generate(config?: DataGeneratorConfig): GraphData {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    return randomConnectedGraph(cfg.size, 0.4);
  }

  getBoundaryCase(caseType: BoundaryCase, config?: DataGeneratorConfig): GraphData {
    const cfg = { ...DEFAULT_CONFIG, ...config };

    switch (caseType) {
      case 'single':
        return {
          type: 'graph', vertices: ['A'], edges: [], directed: false, weighted: false,
          positions: [{ id: 'A', x: 0, y: 0, z: 0 }],
        };

      case 'disconnected': {
        // 两个不相连的子图
        const v1 = makeVertices(Math.ceil(cfg.size / 2));
        const v2 = VERTEX_LABELS.slice(v1.length, v1.length + Math.floor(cfg.size / 2));
        const edges: GraphEdge[] = [];
        // 子图1内部连接
        for (let i = 1; i < v1.length; i++) {
          edges.push({ from: v1[i - 1], to: v1[i] });
        }
        // 子图2内部连接
        for (let i = 1; i < v2.length; i++) {
          edges.push({ from: v2[i - 1], to: v2[i] });
        }
        const disconnectedPositions = splitLayout(v1, v2);
        return { type: 'graph', vertices: [...v1, ...v2], edges, directed: false, weighted: false, positions: disconnectedPositions };
      }

      case 'complete': {
        // 完全图
        const count = Math.min(cfg.size, 6);
        const vertices = makeVertices(count);
        const edges: GraphEdge[] = [];
        for (let i = 0; i < count; i++) {
          for (let j = i + 1; j < count; j++) {
            edges.push({ from: vertices[i], to: vertices[j] });
          }
        }
        const completePositions = circularLayout(vertices, 4);
        return { type: 'graph', vertices, edges, directed: false, weighted: false, positions: completePositions };
      }

      case 'sparse': {
        // 稀疏图：仅比树多一两条边（randomConnectedGraph 自带 positions）
        return randomConnectedGraph(cfg.size, 0.15);
      }

      case 'bipartite': {
        // 二部图
        const halfA = Math.ceil(cfg.size / 2);
        const halfB = cfg.size - halfA;
        const verticesA = makeVertices(halfA);
        const verticesB = VERTEX_LABELS.slice(halfA, halfA + halfB);
        const edges: GraphEdge[] = [];
        const edgeSet = new Set<string>();
        // 确保连通：至少每个B节点连一个A
        for (const b of verticesB) {
          const a = verticesA[randInt(0, verticesA.length - 1)];
          edges.push({ from: a, to: b });
          edgeSet.add(`${a}-${b}`);
        }
        // 额外添加一些边
        const extra = randInt(1, Math.min(3, halfA * halfB - edges.length));
        for (let k = 0; k < extra; k++) {
          const a = verticesA[randInt(0, halfA - 1)];
          const b = verticesB[randInt(0, halfB - 1)];
          const key = `${a}-${b}`;
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push({ from: a, to: b });
          }
        }
        const bipartitePositions = splitLayout(verticesA, verticesB, 6);
        return { type: 'graph', vertices: [...verticesA, ...verticesB], edges, directed: false, weighted: false, positions: bipartitePositions };
      }

      case 'full':
        return this.getBoundaryCase('complete', config);

      default:
        return this.generate(config);
    }
  }

  getSupportedCases(): BoundaryCaseInfo[] {
    return [
      { id: 'single', label: '单顶点', icon: '1️⃣', description: '只有一个顶点的图' },
      { id: 'disconnected', label: '断开的图', icon: '🔌', description: '包含不相连的子图' },
      { id: 'complete', label: '完全图', icon: '🕸️', description: '每对顶点间都有边' },
      { id: 'sparse', label: '稀疏图', icon: '🌿', description: '边数接近最小连通' },
      { id: 'bipartite', label: '二部图', icon: '⚖️', description: '顶点分两组，边仅在组间' },
    ];
  }

  fromValues(values: number[]): GraphData {
    // 将数值作为顶点数量生成图
    const count = values.length > 0 ? Math.min(values[0], 15) : 6;
    return randomConnectedGraph(count, 0.4);
  }
}
