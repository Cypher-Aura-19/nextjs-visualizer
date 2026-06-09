'use client';

import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import type { FileNode } from '../../types/graph';
import { NODE_COLORS } from '../../types/graph';

interface MiniFileNodeData extends Record<string, unknown> {
  node: FileNode;
  isSelected: boolean;
  isNewlyRevealed: boolean;
  isFullyExplored: boolean;
  isSearchMatch: boolean;
  isFiltered: boolean;
  clusterColor: string;
}

type MiniFileNodeType = Node<MiniFileNodeData>;

function MiniFileNode({ data }: NodeProps<MiniFileNodeType>) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPopAnimation, setShowPopAnimation] = useState(data.isNewlyRevealed);

  // Auto-clear the pop animation after 1 second
  useEffect(() => {
    if (data.isNewlyRevealed) {
      setShowPopAnimation(true);
      const timer = setTimeout(() => {
        setShowPopAnimation(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [data.isNewlyRevealed]);

  const nodeColor = NODE_COLORS[data.node.type] || NODE_COLORS.unknown;

  // Build dynamic styles based on state
  const baseStyle: React.CSSProperties = {
    width: '80px',
    height: 'auto',
    minHeight: '36px',
    backgroundColor: 'var(--color-background-primary, #ffffff)',
    border: data.isSelected 
      ? `1px solid ${data.clusterColor}` 
      : '0.5px solid var(--color-border-tertiary, #e5e7eb)',
    borderRadius: '6px',
    padding: '5px 8px',
    boxShadow: data.isSelected
      ? `0 0 0 2px ${data.clusterColor}33`
      : data.isSearchMatch
      ? '0 0 0 2px #f59e0b66'
      : isHovered
      ? '0 2px 4px rgba(0,0,0,0.1)'
      : '0 1px 3px rgba(0,0,0,0.06)',
    position: 'relative',
    transform: data.isSelected 
      ? 'scale(1.05)' 
      : isHovered 
      ? 'scale(1.02)' 
      : 'scale(1)',
    transition: 'all 0.2s ease',
    opacity: data.isFiltered ? 1 : 0.15,
    pointerEvents: data.isFiltered ? 'auto' : 'none',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
  };

  // Apply pop animation if needed
  if (showPopAnimation) {
    baseStyle.animation = 'miniPop 250ms ease-out';
  }

  return (
    <>
      <style jsx>{`
        @keyframes miniPop {
          from {
            opacity: 0;
            transform: scale(0.6);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div
        style={baseStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left colored strip */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '3px',
            backgroundColor: nodeColor,
            borderRadius: '6px 0 0 6px',
          }}
        />

        {/* Content with padding to clear the strip */}
        <div style={{ paddingLeft: '7px' }}>
          {/* Top line: colored dot + label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '2px',
            }}
          >
            {/* Tiny colored dot */}
            <div
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: nodeColor,
                flexShrink: 0,
              }}
            />
            {/* Node label */}
            <div
              style={{
                fontSize: '10px',
                fontWeight: 500,
                color: 'var(--color-text-primary, #111827)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '56px',
              }}
              title={data.node.label}
            >
              {data.node.label}
            </div>
          </div>

          {/* Bottom line: node type */}
          <div
            style={{
              fontSize: '9px',
              color: 'var(--color-text-tertiary, #9ca3af)',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {data.node.type.replace(/-/g, ' ')}
          </div>
        </div>

        {/* Fully explored indicator - green dot in top-right */}
        {data.isFullyExplored && (
          <div
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
            }}
          />
        )}

        {/* Invisible handles */}
        <Handle
          type="target"
          position={Position.Left}
          style={{ opacity: 0, width: 6, height: 6 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ opacity: 0, width: 6, height: 6 }}
        />
      </div>
    </>
  );
}

export default MiniFileNode;

export const miniFileNodeTypes = {
  miniFileNode: MiniFileNode,
};
