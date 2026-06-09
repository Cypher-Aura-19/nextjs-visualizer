'use client';

import { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileNode, NODE_COLORS, NODE_LABELS } from '../../types/graph';

interface ExplorerNodeData {
  node: FileNode;
  isSelected: boolean;
  isNewlyRevealed: boolean; // true if this node was just revealed in the last click
  isFullyExplored: boolean; // true if ALL its neighbors are already revealed
  isSearchMatch: boolean;
  isFiltered: boolean; // false means hidden by filter toggle
}

function ExplorerNode({ data }: { data: ExplorerNodeData }) {
  const { node, isSelected, isNewlyRevealed, isFullyExplored, isSearchMatch, isFiltered } = data;
  
  // Track if node should show reveal animation
  const [showRevealAnimation, setShowRevealAnimation] = useState(isNewlyRevealed);
  const [showGlow, setShowGlow] = useState(isNewlyRevealed);

  // Reset reveal animation state after 1.5s
  useEffect(() => {
    if (isNewlyRevealed) {
      setShowRevealAnimation(true);
      setShowGlow(true);

      // Stop glow after 1s
      const glowTimer = setTimeout(() => {
        setShowGlow(false);
      }, 1000);

      // Stop reveal animation after 1.5s
      const revealTimer = setTimeout(() => {
        setShowRevealAnimation(false);
      }, 1500);

      return () => {
        clearTimeout(glowTimer);
        clearTimeout(revealTimer);
      };
    }
  }, [isNewlyRevealed]);

  const nodeColor = NODE_COLORS[node.type] || NODE_COLORS.unknown;
  const nodeLabel = NODE_LABELS[node.type] || 'Unknown';

  // Determine cursor style
  const cursorStyle = isFiltered
    ? 'default'
    : isFullyExplored && !isSelected
    ? 'default'
    : 'pointer';

  return (
    <>
      {/* Connection handles - invisible but needed for React Flow */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />

      {/* Node container */}
      <div
        className="relative bg-white rounded-[10px] overflow-hidden"
        style={{
          width: '150px',
          border: '0.5px solid #e5e7eb',
          borderLeftWidth: isSelected ? '6px' : '4px',
          borderLeftColor: nodeColor,
          opacity: isFiltered ? 1 : 0.2,
          pointerEvents: isFiltered ? 'auto' : 'none',
          cursor: cursorStyle,
          boxShadow: isSelected
            ? `0 0 0 2px ${nodeColor}66`
            : isSearchMatch
            ? '0 0 0 2px #fbbf24'
            : 'none',
          transform: showRevealAnimation ? 'scale(1)' : 'scale(1)',
          animation: showRevealAnimation
            ? 'popIn 300ms ease-out'
            : 'none',
        }}
      >
        {/* Glow ring for newly revealed nodes */}
        {showGlow && (
          <div
            className="absolute inset-0 rounded-[10px] pointer-events-none"
            style={{
              boxShadow: `0 0 20px 4px ${nodeColor}`,
              opacity: 0,
              animation: 'glowFade 1s ease-out',
            }}
          />
        )}

        {/* Node content */}
        <div className="p-3 flex flex-col gap-1.5">
          {/* Type badge */}
          <div
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium w-fit"
            style={{
              backgroundColor: `${nodeColor}15`,
              color: nodeColor,
            }}
          >
            {nodeLabel}
          </div>

          {/* Label */}
          <div className="text-[13px] font-bold text-gray-900 leading-tight">
            {node.label}
          </div>

          {/* File path */}
          <div className="font-mono text-[10px] text-gray-500 leading-tight truncate">
            {node.filePath}
          </div>
        </div>

        {/* Fully explored checkmark badge */}
        {isFullyExplored && !isSelected && (
          <div
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <span className="text-white text-[11px] font-bold">✓</span>
          </div>
        )}
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes popIn {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes glowFade {
          0% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

export const explorerNodeTypes = {
  explorerNode: ExplorerNode,
};

export default ExplorerNode;
