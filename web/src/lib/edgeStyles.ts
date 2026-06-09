import type { GraphEdge } from '../types/graph';
import type { ClusteredGraph, Cluster } from './clustering';
import { NODE_COLORS } from '../types/graph';

export interface StyledEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
  style: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  labelBgStyle?: React.CSSProperties;
  label?: string;
  zIndex: number;
}

/**
 * Styles edges differently based on whether they connect nodes within the same cluster
 * (intra-cluster) or between different clusters (inter-cluster).
 * 
 * @param edges - Array of graph edges to style
 * @param clusteredGraph - The clustered graph with node-to-cluster mapping
 * @param clusters - Array of cluster objects with color information
 * @returns Array of styled edges ready for React Flow
 */
export function styleEdges(
  edges: GraphEdge[],
  clusteredGraph: ClusteredGraph,
  clusters: Cluster[]
): StyledEdge[] {
  return edges.map(edge => {
    // Determine if edge is intra-cluster or inter-cluster
    const sourceClusterId = clusteredGraph.nodeClusterMap.get(edge.source);
    const targetClusterId = clusteredGraph.nodeClusterMap.get(edge.target);
    const isInterCluster = sourceClusterId !== targetClusterId;

    if (isInterCluster) {
      // INTER-CLUSTER EDGE (between bubbles)
      // Find the source cluster to get its color
      const sourceCluster = clusters.find(c => c.id === sourceClusterId);
      const clusterColor = sourceCluster?.color || '#667EEA';
      
      // Color at 60% opacity (append '99' for ~60% opacity)
      const strokeColor = `${clusterColor}99`;
      
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated: edge.type === 'call',
        style: {
          stroke: clusterColor,
          strokeWidth: edge.type === 'render' ? 2.5 : 1.5,
          strokeOpacity: 0.7,
          strokeDasharray: edge.type === 'import-only' ? '6 3' : undefined,
        },
        label: edge.label,
        labelStyle: {
          fontSize: 10,
          fill: clusterColor,
        },
        labelBgStyle: {
          fill: 'white',
          fillOpacity: 0.8,
        },
        zIndex: 5,
      };
    } else {
      // INTRA-CLUSTER EDGE (inside same bubble)
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: '#94a3b8',
          strokeWidth: 1,
          strokeOpacity: 0.5,
          strokeDasharray: edge.type === 'import-only' ? '4 2' : undefined,
        },
        zIndex: 5,
      };
    }
  });
}
