'use client';

import { useEffect, useCallback, useMemo, useRef } from 'react';
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
  NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/base.css';
import { useExplorer } from '../../store/useExplorer';
import { explorerNodeTypes } from './ExplorerNode';
import { NODE_COLORS, type NodeType } from '../../types/graph';

export default function ExplorerCanvas() {
  const {
    revealedNodes,
    revealedEdges,
    selectedNodeId,
    exploreNode,
    selectNode,
    viewMode,
    searchQuery,
    activeFilters,
    fullGraph,
  } = useExplorer();

  // Track newly revealed nodes for animation
  const lastRevealedBatch = useRef<Set<string>>(new Set());
  const prevRevealedCount = useRef(0);

  // React Flow state
  const [rfNodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Helper: Check if a node is fully explored (all neighbors are revealed)
  const checkIfFullyExplored = useCallback(
    (nodeId: string): boolean => {
      if (!fullGraph) return false;

      // Find all neighbors from full graph
      const neighborIds = new Set<string>();
      fullGraph.edges.forEach((edge) => {
        if (edge.source === nodeId) neighborIds.add(edge.target);
        if (edge.target === nodeId) neighborIds.add(edge.source);
      });

      // Check if all neighbors are revealed
      const revealedIds = new Set(revealedNodes.map((n) => n.id));
      for (const neighborId of neighborIds) {
        if (!revealedIds.has(neighborId)) {
          return false;
        }
      }

      return true;
    },
    [fullGraph, revealedNodes]
  );

  // Auto layout: Force-directed style with concentric rings
  const calculateNodePositions = useCallback(() => {
    const positions = new Map<string, { x: number; y: number }>();
    const centerX = 500;
    const centerY = 400;

    // Group nodes by ring
    const centerRing: string[] = [];
    const middleRing: string[] = [];
    const outerRing: string[] = [];

    revealedNodes.forEach((node) => {
      if (node.type === 'page' || node.type === 'layout') {
        centerRing.push(node.id);
      } else if (
        node.type === 'server-component' ||
        node.type === 'client-component'
      ) {
        middleRing.push(node.id);
      } else {
        outerRing.push(node.id);
      }
    });

    // Position center ring (innermost)
    if (centerRing.length === 1) {
      positions.set(centerRing[0], { x: centerX, y: centerY });
    } else {
      centerRing.forEach((nodeId, index) => {
        const angle = (index / centerRing.length) * 2 * Math.PI;
        const radius = 0;
        positions.set(nodeId, {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        });
      });
    }

    // Position middle ring
    middleRing.forEach((nodeId, index) => {
      const angle = (index / middleRing.length) * 2 * Math.PI;
      const radius = 250;
      positions.set(nodeId, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    });

    // Position outer ring
    outerRing.forEach((nodeId, index) => {
      const angle = (index / outerRing.length) * 2 * Math.PI;
      const radius = 450;
      positions.set(nodeId, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    });

    return positions;
  }, [revealedNodes]);

  // Detect newly revealed nodes
  useEffect(() => {
    const currentCount = revealedNodes.length;
    if (currentCount > prevRevealedCount.current) {
      // New nodes were revealed
      const previousIds = new Set(
        rfNodes.map((n) => n.id)
      );
      const newIds = revealedNodes
        .filter((node) => !previousIds.has(node.id))
        .map((node) => node.id);

      lastRevealedBatch.current = new Set(newIds);

      // Clear the batch after 1.5 seconds
      const timer = setTimeout(() => {
        lastRevealedBatch.current.clear();
      }, 1500);

      return () => clearTimeout(timer);
    }
    prevRevealedCount.current = currentCount;
  }, [revealedNodes, rfNodes]);

  // Convert revealed nodes to React Flow format
  const convertedNodes = useMemo(() => {
    const positions = calculateNodePositions();
    const newlyRevealedIds = lastRevealedBatch.current;

    return revealedNodes.map((node) => {
      const position = positions.get(node.id) || { x: 0, y: 0 };
      
      // Check if matches search
      const isSearchMatch = searchQuery
        ? node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.filePath.toLowerCase().includes(searchQuery.toLowerCase())
        : false;

      // Check if filtered (true means show, false means hide)
      const isFiltered = activeFilters.size === 0 || activeFilters.has(node.type);

      const rfNode: Node = {
        id: node.id,
        type: 'explorerNode',
        position,
        data: {
          node,
          isSelected: node.id === selectedNodeId,
          isNewlyRevealed: newlyRevealedIds.has(node.id),
          isFullyExplored: checkIfFullyExplored(node.id),
          isSearchMatch,
          isFiltered,
        },
      };

      return rfNode;
    });
  }, [
    revealedNodes,
    selectedNodeId,
    searchQuery,
    activeFilters,
    checkIfFullyExplored,
    calculateNodePositions,
  ]);

  // Convert revealed edges to React Flow format
  const convertedEdges = useMemo(() => {
    return revealedEdges.map((edge) => {
      // Edge colors matching the design
      let strokeColor = '#B4B2A9'; // Default grey for imports
      let strokeWidth = 1;
      let strokeDasharray: string | undefined = '5 3';
      let animated = false;

      if (edge.type === 'render') {
        strokeColor = '#378ADD'; // Blue for renders
        strokeWidth = 2;
        strokeDasharray = undefined;
      } else if (edge.type === 'call') {
        strokeColor = '#D4537E'; // Pink for calls
        strokeWidth = 2;
        strokeDasharray = undefined;
        animated = true;
      }

      const rfEdge: Edge = {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated,
        label: edge.label,
        labelStyle: {
          fontSize: 10,
          fill: '#6b7280',
        },
        labelBgStyle: {
          fill: '#ffffff',
          fillOpacity: 0.8,
        },
        style: {
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
        },
      };

      return rfEdge;
    });
  }, [revealedEdges]);

  // Update React Flow state when converted data changes
  useEffect(() => {
    setNodes(convertedNodes);
  }, [convertedNodes, setNodes]);

  useEffect(() => {
    setEdges(convertedEdges);
  }, [convertedEdges, setEdges]);

  // Handle node click - explore the node
  const handleNodeClick: NodeMouseHandler = useCallback(
    (event, rfNode) => {
      exploreNode(rfNode.id);
    },
    [exploreNode]
  );

  // Handle background click - deselect
  const handlePaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={explorerNodeTypes}
        onNodeClick={handleNodeClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1.2 }}
        minZoom={0.05}
        maxZoom={2.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#e5e7eb"
          style={{ backgroundColor: '#F9FAFB' }}
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const nodeType = (n.data as any)?.node?.type as NodeType | undefined;
            return nodeType ? (NODE_COLORS[nodeType] ?? '#B4B2A9') : '#B4B2A9';
          }}
          maskColor="rgba(0,0,0,0.05)"
          style={{
            borderRadius: 8,
            border: '0.5px solid #e5e7eb',
          }}
        />
      </ReactFlow>
    </div>
  );
}
