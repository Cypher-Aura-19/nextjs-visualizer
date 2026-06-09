import ELK, { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from '@xyflow/react';

const elk = new ELK();

export const getLayoutedElements = async (
  nodes: Node[],
  edges: Edge[],
  options: Record<string, string> = {}
) => {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';

  const elkEdges: ElkExtendedEdge[] = edges.map((e) => ({
    id: e.id,
    sources: [e.source],
    targets: [e.target],
  }));

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'org.eclipse.elk.layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': '80',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      ...options,
    },
    children: nodes.map((node) => ({
      id: node.id,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      width: 200,
      height: 90,
    })),
    edges: elkEdges,
  };

  const layoutedGraph = await elk.layout(graph);

  return {
    nodes: layoutedGraph.children?.map((node_1) => {
      const originalNode = nodes.find((n) => n.id === node_1.id);
      return {
        ...originalNode,
        position: { x: node_1.x ?? 0, y: node_1.y ?? 0 },
      } as Node;
    }) ?? [],
    edges,
  };
};
