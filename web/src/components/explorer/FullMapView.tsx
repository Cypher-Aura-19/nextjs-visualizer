'use client';

import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useExplorer } from '../../store/useExplorer';
import { NODE_COLORS } from '../../types/graph';
import type { NodeType, FileNode } from '../../types/graph';

// Inline FogNode component
function FogNode({
  data,
}: {
  data: { node: FileNode; isRevealed: boolean; isSelected: boolean };
}) {
  const { exploreNode, setViewMode } = useExplorer();

  const handleClick = () => {
    if (!data.isRevealed) {
      exploreNode(data.node.id);
      setViewMode('explore');
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: 110,
        padding: '8px 10px',
        borderRadius: 8,
        border: data.isRevealed
          ? '0.5px solid var(--color-border-tertiary)'
          : '1px dashed var(--color-border-secondary)',
        background: 'var(--color-background-primary)',
        borderLeft: data.isRevealed
          ? `4px solid ${NODE_COLORS[data.node.type]}`
          : '4px solid var(--color-border-tertiary)',
        opacity: data.isRevealed ? 1 : 0.3,
        cursor: data.isRevealed ? 'default' : 'pointer',
        boxShadow: data.isSelected ? '0 0 0 2px #378ADD' : 'none',
        position: 'relative',
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 500,
          marginBottom: 4,
          color: data.isRevealed
            ? NODE_COLORS[data.node.type]
            : 'var(--color-text-tertiary)',
          textTransform: 'uppercase',
        }}
      >
        {data.isRevealed ? data.node.type.replace('-', ' ') : '???'}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: data.isRevealed
            ? 'var(--color-text-primary)'
            : 'var(--color-text-tertiary)',
          filter: data.isRevealed ? 'none' : 'blur(2px)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {data.node.label}
      </div>
    </div>
  );
}

const nodeTypes = {
  fogNode: FogNode,
};

export default function FullMapView() {
  const {
    fullGraph,
    revealedNodes,
    exploreNode,
    selectNode,
    selectedNodeId,
    setViewMode,
    completionPercent,
  } = useExplorer();

  // Convert fullGraph nodes to React Flow nodes with concentric ring layout
  const rfNodes = useMemo(() => {
    if (!fullGraph) return [];

    const centerX = 600;
    const centerY = 500;

    // Group nodes by ring
    const innerTypes: NodeType[] = ['page', 'layout'];
    const middleTypes: NodeType[] = [
      'server-component',
      'client-component',
      'middleware',
    ];
    const outerTypes: NodeType[] = [
      'api-route',
      'server-action',
      'hook',
      'utility',
      'unknown',
    ];

    const innerNodes = fullGraph.nodes.filter((n) => innerTypes.includes(n.type));
    const middleNodes = fullGraph.nodes.filter((n) => middleTypes.includes(n.type));
    const outerNodes = fullGraph.nodes.filter((n) => outerTypes.includes(n.type));

    const allRfNodes: Node[] = [];

    // Helper to place nodes in a ring
    const placeInRing = (nodes: FileNode[], radius: number) => {
      const count = nodes.length;
      if (count === 0) return;

      nodes.forEach((node, index) => {
        const angle = (index / count) * Math.PI * 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const isRevealed = revealedNodes.some((n) => n.id === node.id);

        allRfNodes.push({
          id: node.id,
          type: 'fogNode',
          position: { x, y },
          data: {
            node,
            isRevealed,
            isSelected: node.id === selectedNodeId,
          },
        });
      });
    };

    // Place nodes in concentric rings
    placeInRing(innerNodes, 150); // Inner ring
    placeInRing(middleNodes, 300); // Middle ring
    placeInRing(outerNodes, 520); // Outer ring

    return allRfNodes;
  }, [fullGraph, revealedNodes, selectedNodeId]);

  // Convert edges (only show revealed edges)
  const rfEdges = useMemo(() => {
    if (!fullGraph) return [];

    const revealedIds = new Set(revealedNodes.map((n) => n.id));

    return fullGraph.edges
      .filter((edge) => revealedIds.has(edge.source) && revealedIds.has(edge.target))
      .map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'straight',
        style: {
          stroke: 'var(--color-border-secondary)',
          strokeWidth: 1,
          opacity: 0.3,
        },
      }));
  }, [fullGraph, revealedNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Update nodes when rfNodes change
  useMemo(() => {
    setNodes(rfNodes);
  }, [rfNodes, setNodes]);

  // Update edges when rfEdges change
  useMemo(() => {
    setEdges(rfEdges);
  }, [rfEdges, setEdges]);

  if (!fullGraph) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-tertiary)',
        }}
      >
        No graph loaded
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      {/* Banner */}
      <div
        style={{
          padding: '10px 20px',
          background: 'var(--color-background-secondary)',
          borderBottom: '0.5px solid var(--color-border-tertiary)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-text-primary)',
          }}
        >
          Full map — {revealedNodes.length} of {fullGraph?.nodes.length ?? 0} files
          explored
        </span>
        <div
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: 'var(--color-border-tertiary)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${completionPercent}%`,
              background: '#378ADD',
              borderRadius: 2,
              transition: 'width 0.4s',
            }}
          />
        </div>
        <span style={{ fontSize: 12, color: '#378ADD', fontWeight: 500 }}>
          {completionPercent}%
        </span>
        <button
          onClick={() => setViewMode('explore')}
          style={{
            padding: '5px 14px',
            borderRadius: 6,
            border: '0.5px solid var(--color-border-secondary)',
            background: 'var(--color-background-primary)',
            color: 'var(--color-text-secondary)',
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <i
            className="ti ti-arrow-left"
            aria-hidden="true"
            style={{ fontSize: 13 }}
          />
          Back to exploring
        </button>
      </div>

      {/* React Flow Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          minZoom={0.04}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={28}
            size={1}
            color="var(--color-border-tertiary)"
          />
          <Controls showInteractive={false} />
          <MiniMap
            maskColor="rgba(0,0,0,0.05)"
            nodeColor={(node) => {
              const data = node.data as { isRevealed: boolean; node: FileNode };
              return data.isRevealed
                ? NODE_COLORS[data.node.type]
                : 'var(--color-border-tertiary)';
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
