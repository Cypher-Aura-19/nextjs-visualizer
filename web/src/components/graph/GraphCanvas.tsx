'use client';

import { useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeMouseHandler,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useExplorer } from '../../store/useExplorer';
import { clusterGraph } from '../../lib/clustering';
import { computeClusteredLayout, clusterGroupSize } from '../../lib/layout';
import { clusterNodeTypes } from './ClusterNode';
import { nodeTypes as fileNodeTypes } from './CustomNode';
import { flowEdgeTypes } from './FlowEdge';
import { NODE_COLORS } from '../../types/graph';

// ─── node/edge types defined at module level (no recreation on render) ────────
const allNodeTypes = {
  ...clusterNodeTypes,
  ...fileNodeTypes,
} as any;

const allEdgeTypes = {
  ...flowEdgeTypes,
} as any;

// ─── build RF nodes ───────────────────────────────────────────────────────────
function buildNodes(
  clusteredGraph: ReturnType<typeof clusterGraph>,
  layoutMap: ReturnType<typeof computeClusteredLayout>,
  revealedNodes: any[],
  selectedNodeId: string | null,
  searchQuery: string,
  activeFilters: Set<string>,
  fullGraph: any
): Node[] {
  const rfNodes: Node[] = [];

  // 1) Cluster group nodes — always render all clusters
  // Pre-compute per-cluster visible count for the header badge
  const revealedSet = new Set(revealedNodes.map((n: any) => n.id));
  const visibleCountByCluster = new Map<string, number>();
  clusteredGraph.clusters.forEach(cluster => {
    const visibleCount = cluster.nodeIds.filter(nodeId => {
      const node = revealedNodes.find((n: any) => n.id === nodeId);
      if (!node) return false;
      return activeFilters.size === 0 || activeFilters.has(node.type);
    }).length;
    visibleCountByCluster.set(cluster.id, visibleCount);
  });

  clusteredGraph.clusters.forEach(cluster => {
    const groupId = `cluster-${cluster.id}`;
    const layout = layoutMap.get(groupId);
    const size = clusterGroupSize(cluster.nodeIds.length);

    rfNodes.push({
      id: groupId,
      type: 'clusterBubble',
      position: { x: layout?.x ?? 0, y: layout?.y ?? 0 },
      data: {
        label: cluster.label,
        nodeCount: cluster.nodeIds.length,
        visibleCount: visibleCountByCluster.get(cluster.id) ?? cluster.nodeIds.length,
        color: cluster.color,
      },
      style: {
        width: size.width,
        height: size.height,
        // No border/bg here — ClusterNode component draws it
        pointerEvents: 'none' as const,
      },
      draggable: false,
      selectable: false,
      focusable: false,
      zIndex: 0,
    });
  });

  // 2) File nodes at ABSOLUTE world positions — no parentId, no extent clipping
  revealedNodes.forEach((fileNode: any) => {
    const layout = layoutMap.get(fileNode.id);

    const isFullyExplored =
      fullGraph
        ? fullGraph.edges
            .filter((e: any) => e.source === fileNode.id || e.target === fileNode.id)
            .map((e: any) => (e.source === fileNode.id ? e.target : e.source))
            .every((id: string) => revealedSet.has(id))
        : false;

    const isFiltered = activeFilters.size === 0 || activeFilters.has(fileNode.type);

    rfNodes.push({
      id: fileNode.id,
      type: 'fileNode',
      position: { x: layout?.x ?? 0, y: layout?.y ?? 0 },
      // NO parentId, NO extent — absolute world coords, never clamped
      data: {
        node: fileNode,
        isSelected: fileNode.id === selectedNodeId,
        isNewlyRevealed: false,
        isFullyExplored,
        isSearchMatch: searchQuery
          ? fileNode.label.toLowerCase().includes(searchQuery.toLowerCase())
          : false,
        isFiltered,
      },
      zIndex: 10,
      draggable: true,
    });
  });

  return rfNodes;
}

// ─── build RF edges ───────────────────────────────────────────────────────────
function buildEdges(
  revealedEdges: any[],
  revealedNodes: any[],
  clusteredGraph: ReturnType<typeof clusterGraph>
): Edge[] {
  const revealedIds = new Set(revealedNodes.map((n: any) => n.id));

  return revealedEdges
    .filter(e => revealedIds.has(e.source) && revealedIds.has(e.target))
    .map(edge => {
      const srcCluster = clusteredGraph.nodeClusterMap.get(edge.source);
      const tgtCluster = clusteredGraph.nodeClusterMap.get(edge.target);
      const isInter = srcCluster !== tgtCluster;
      const srcClusterObj = clusteredGraph.clusters.find(c => c.id === srcCluster);
      const edgeColor = isInter ? (srcClusterObj?.color ?? '#94a3b8') : '#94a3b8';

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'flowEdge',
        animated: edge.type === 'call',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: edgeColor,
        },
        style: {
          stroke: edgeColor,
          strokeWidth: isInter ? 2 : 1.5,
          strokeOpacity: isInter ? 0.75 : 0.4,
          strokeDasharray: edge.type === 'import-only' ? '5 3' : undefined,
        },
        zIndex: 5,
        data: {
          label: edge.label,
          edgeType: edge.type,
          color: edgeColor,
          isInter,
        },
      };
    });
}

// ─── component ────────────────────────────────────────────────────────────────
function GraphCanvas() {
  const {
    revealedNodes,
    revealedEdges,
    fullGraph,
    selectedNodeId,
    exploreNode,
    selectNode,
    searchQuery,
    activeFilters,
  } = useExplorer();

  // Cluster + layout only recalculated when fullGraph identity changes
  const clusteredGraph = useMemo(() => {
    if (!fullGraph) return null;
    return clusterGraph(fullGraph);
  }, [fullGraph]);

  const layoutMap = useMemo(() => {
    if (!fullGraph || !clusteredGraph) return new Map();
    return computeClusteredLayout(clusteredGraph, fullGraph.nodes);
  }, [fullGraph, clusteredGraph]);

  // Nodes rebuilt on every relevant state change — no stale state via useNodesState
  const rfNodes = useMemo(() => {
    if (!clusteredGraph) return [];
    return buildNodes(
      clusteredGraph,
      layoutMap,
      revealedNodes,
      selectedNodeId,
      searchQuery,
      activeFilters,
      fullGraph
    );
  }, [clusteredGraph, layoutMap, revealedNodes, selectedNodeId, searchQuery, activeFilters, fullGraph]);

  // Edges rebuilt whenever revealed edges or nodes change
  const rfEdges = useMemo(() => {
    if (!clusteredGraph) return [];
    return buildEdges(revealedEdges, revealedNodes, clusteredGraph);
  }, [revealedEdges, revealedNodes, clusteredGraph]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, rfNode) => {
      if (rfNode.type === 'clusterBubble') return;
      exploreNode(rfNode.id);
    },
    [exploreNode]
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  // Use fullGraph reference as the ReactFlow instance key
  // This forces a clean remount only when a new graph is loaded
  const graphRef = useRef(fullGraph);
  const instanceKey = fullGraph === graphRef.current
    ? 'same-graph'
    : (() => { graphRef.current = fullGraph; return 'new-graph-' + Date.now(); })();

  if (!fullGraph) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f9' }}>
        <p style={{ color: '#9ca3af', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>No graph loaded</p>
      </div>
    );
  }

  return (
    <div key={instanceKey} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={allNodeTypes}
        edgeTypes={allEdgeTypes}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.1, maxZoom: 0.85 }}
        minZoom={0.03}
        maxZoom={2.5}
        nodesDraggable={true}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        defaultEdgeOptions={{ type: 'flowEdge' }}
        attributionPosition="bottom-left"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#d1d5db"
        />
        <Controls
          showInteractive={false}
          style={{ bottom: 24, left: 16 }}
        />
        <MiniMap
          zoomable
          pannable
          nodeColor={(n: any) => {
            if (n.type === 'clusterBubble') return n.data?.color ?? '#ccc';
            const t = n.data?.node?.type;
            return t ? (NODE_COLORS[t as keyof typeof NODE_COLORS] ?? '#9ca3af') : '#9ca3af';
          }}
          maskColor="rgba(0,0,0,0.04)"
          style={{
            borderRadius: 10,
            border: '1px solid #e9ecef',
            bottom: 24,
            right: 16,
          }}
        />
      </ReactFlow>
    </div>
  );
}

export default GraphCanvas;
