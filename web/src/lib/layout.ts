import type { ClusteredGraph } from './clustering';
import type { FileNode } from '../types/graph';

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cluster' | 'file';
  clusterId?: string;
}

// ── Node card dimensions ───────────────────────────────────────────────────
const NODE_W = 192;
const NODE_H = 118;
const NODE_GAP_X = 64;
const NODE_GAP_Y = 52;
const CLUSTER_PAD_X = 72;
const CLUSTER_PAD_TOP = 68;  // room for header bar
const CLUSTER_PAD_BOT = 48;

function columnsFor(count: number): number {
  if (count === 1) return 1;
  if (count <= 2) return 2;
  if (count <= 6) return 3;
  if (count <= 12) return 4;
  return 5;
}

export function clusterGroupSize(count: number): { width: number; height: number } {
  const cols = columnsFor(count);
  const rows = Math.ceil(count / cols);
  return {
    width:  CLUSTER_PAD_X * 2 + cols * NODE_W + (cols - 1) * NODE_GAP_X,
    height: CLUSTER_PAD_TOP + CLUSTER_PAD_BOT + rows * NODE_H + (rows - 1) * NODE_GAP_Y,
  };
}

// ── Cluster circle placement ───────────────────────────────────────────────
function clusterCirclePositions(
  clusters: Array<{ id: string; size: { width: number; height: number } }>
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const n = clusters.length;

  if (n === 1) {
    positions.set(clusters[0].id, { x: 0, y: 0 });
    return positions;
  }

  const maxDiag = Math.max(...clusters.map(c => Math.hypot(c.size.width, c.size.height)));
  const orbitRadius = maxDiag * 0.72 + 320;

  clusters.forEach((c, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    positions.set(c.id, {
      x: Math.cos(angle) * orbitRadius,
      y: Math.sin(angle) * orbitRadius,
    });
  });

  return positions;
}

// ── Main entry point ───────────────────────────────────────────────────────
// All positions are ABSOLUTE world coordinates.
// File nodes are NOT parented to cluster groups — clusters are just backdrop rectangles.
export function computeClusteredLayout(
  clusteredGraph: ClusteredGraph,
  _nodes: FileNode[]
): Map<string, LayoutNode> {
  const layoutMap = new Map<string, LayoutNode>();

  const clusterSizes = clusteredGraph.clusters.map(cluster => ({
    id: `cluster-${cluster.id}`,
    size: clusterGroupSize(cluster.nodeIds.length),
  }));

  const clusterPositions = clusterCirclePositions(clusterSizes);

  clusteredGraph.clusters.forEach(cluster => {
    const groupId = `cluster-${cluster.id}`;
    const size = clusterGroupSize(cluster.nodeIds.length);
    const clusterOrigin = clusterPositions.get(groupId) ?? { x: 0, y: 0 };

    // Register cluster backdrop (absolute)
    layoutMap.set(groupId, {
      id: groupId,
      x: clusterOrigin.x,
      y: clusterOrigin.y,
      width: size.width,
      height: size.height,
      type: 'cluster',
    });

    // Register each file node at ABSOLUTE world position
    // = cluster origin + local grid offset
    const cols = columnsFor(cluster.nodeIds.length);
    cluster.nodeIds.forEach((nodeId, i) => {
      const localX = CLUSTER_PAD_X + (i % cols) * (NODE_W + NODE_GAP_X);
      const localY = CLUSTER_PAD_TOP + Math.floor(i / cols) * (NODE_H + NODE_GAP_Y);

      layoutMap.set(nodeId, {
        id: nodeId,
        x: clusterOrigin.x + localX,
        y: clusterOrigin.y + localY,
        width: NODE_W,
        height: NODE_H,
        type: 'file',
        clusterId: cluster.id,
      });
    });
  });

  return layoutMap;
}
