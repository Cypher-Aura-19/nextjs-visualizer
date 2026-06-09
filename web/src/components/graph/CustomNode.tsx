'use client';

import { memo, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { FileNode } from '../../types/graph';
import { NODE_COLORS as nodeColors, NODE_LABELS as nodeLabels } from '../../types/graph';

interface CustomNodeData {
  node: FileNode;
  isSelected: boolean;
  isSearchMatch: boolean;
  isFiltered: boolean;
  isNewlyRevealed?: boolean;
  isFullyExplored?: boolean;
}

// SVG icons — no emoji, crisp at any scale
function NodeIcon({ type }: { type: FileNode['type'] }) {
  const s = { width: 14, height: 14, display: 'block' } as const;
  switch (type) {
    case 'page':
      return (
        <svg {...s} viewBox="0 0 16 16" fill="none">
          <rect x="2" y="1" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 5h6M5 8h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'layout':
      return (
        <svg {...s} viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M1 5h14M5 5v10" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      );
    case 'api-route':
      return (
        <svg {...s} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 8h6M8 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'server-action':
      return (
        <svg {...s} viewBox="0 0 16 16" fill="none">
          <path d="M8 2l1.5 4.5H14l-3.75 2.7 1.5 4.5L8 11.25 4.25 13.7l1.5-4.5L2 6.5h4.5L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      );
    case 'middleware':
      return (
        <svg {...s} viewBox="0 0 16 16" fill="none">
          <path d="M2 8h3l2-5 2 10 2-5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'hook':
      return (
        <svg {...s} viewBox="0 0 16 16" fill="none">
          <path d="M8 2v7a3 3 0 0 0 3 3h0a3 3 0 0 0 0-6H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'client-component':
      return (
        <svg {...s} viewBox="0 0 16 16" fill="none">
          <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="4" cy="6" r="1" fill="currentColor"/>
          <path d="M7 6h5M4 9h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      );
    case 'server-component':
      return (
        <svg {...s} viewBox="0 0 16 16" fill="none">
          <rect x="1" y="2" width="14" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="1" y="9" width="14" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="13" cy="4.5" r="1" fill="currentColor"/>
          <circle cx="13" cy="11.5" r="1" fill="currentColor"/>
        </svg>
      );
    default:
      return (
        <svg {...s} viewBox="0 0 16 16" fill="none">
          <path d="M3 3h10v3L8 9 3 6V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M3 6v7h10V6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      );
  }
}

function CustomNode({ data }: { data: CustomNodeData }) {
  const {
    node,
    isSelected,
    isSearchMatch,
    isFiltered,
    isNewlyRevealed = false,
    isFullyExplored = false,
  } = data;

  const color = nodeColors[node.type] ?? '#94a3b8';
  const typeLabel = nodeLabels[node.type] ?? 'Unknown';
  const [hovered, setHovered] = useState(false);
  const [showPop, setShowPop] = useState(isNewlyRevealed);

  useEffect(() => {
    if (isNewlyRevealed) {
      setShowPop(true);
      const t = setTimeout(() => setShowPop(false), 1500);
      return () => clearTimeout(t);
    }
  }, [isNewlyRevealed]);

  // Truncate path sensibly
  const parts = node.filePath.split('/');
  const shortPath = parts.length > 3
    ? `…/${parts.slice(-2).join('/')}`
    : node.filePath;

  const opacity = isFiltered ? 1 : 0.18;
  const pe: React.CSSProperties['pointerEvents'] = isFiltered ? 'auto' : 'none';

  const shadow = isSelected
    ? `0 0 0 2px ${color}, 0 8px 32px ${color}28`
    : isSearchMatch
    ? `0 0 0 2px #f59e0b`
    : hovered
    ? `0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)`
    : `0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)`;

  const borderColor = isSelected
    ? color
    : isSearchMatch
    ? '#f59e0b'
    : hovered
    ? '#d1d5db'
    : '#e9ecef';

  // Render/client/server badge
  const isClient = node.isClientComponent;
  const isServer = node.isServerComponent;

  return (
    <>
      <style>{`
        @keyframes nodePopIn {
          0%   { opacity: 0; transform: scale(0.78) translateY(6px); }
          65%  { opacity: 1; transform: scale(1.03) translateY(-1px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 8, height: 8, background: '#fff', border: `2px solid ${color}`, left: -4, opacity: 0.85 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 8, height: 8, background: '#fff', border: `2px solid ${color}`, right: -4, opacity: 0.85 }}
      />

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          width: 192,
          minHeight: 118,
          backgroundColor: '#ffffff',
          border: `1.5px solid ${borderColor}`,
          borderRadius: 12,
          boxShadow: shadow,
          transition: 'box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease',
          transform: isSelected ? 'scale(1.03)' : hovered ? 'scale(1.01)' : 'scale(1)',
          opacity,
          pointerEvents: pe,
          animation: showPop ? 'nodePopIn 280ms ease-out forwards' : undefined,
          cursor: 'pointer',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Left accent strip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: 3,
            backgroundColor: color,
            borderRadius: '12px 0 0 12px',
          }}
        />

        {/* Fully-explored badge */}
        {isFullyExplored && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#10b981',
              border: '2px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              color: 'white',
              fontWeight: 700,
              zIndex: 2,
              boxShadow: '0 1px 4px rgba(16,185,129,0.4)',
            }}
          >
            ✓
          </div>
        )}

        {/* Main content — offset for left strip */}
        <div style={{ paddingLeft: 14, paddingRight: 14, paddingTop: 13, paddingBottom: 13, flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>

          {/* Row 1: Icon + type badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: `${color}14`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color,
                flexShrink: 0,
              }}
            >
              <NodeIcon type={node.type} />
            </div>

            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 20,
                backgroundColor: `${color}12`,
                color,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
                lineHeight: 1.6,
              }}
            >
              {typeLabel}
            </div>
          </div>

          {/* Row 2: File name */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 650,
              color: '#0f172a',
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
              wordBreak: 'break-word',
            }}
          >
            {node.label}
          </div>

          {/* Row 3: File path */}
          <div
            style={{
              fontSize: 10,
              color: '#94a3b8',
              fontFamily: 'DM Mono, monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
            }}
            title={node.filePath}
          >
            {shortPath}
          </div>

          {/* Row 4: footer meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
            {/* Server / Client badge */}
            {(isClient || isServer) && (
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 4,
                  backgroundColor: isClient ? '#fdf2f8' : '#f0fdf4',
                  color: isClient ? '#db2777' : '#16a34a',
                  border: `1px solid ${isClient ? '#fbcfe8' : '#bbf7d0'}`,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {isClient ? 'Client' : 'Server'}
              </div>
            )}

            {/* Exports count */}
            {node.exports.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 10,
                  color: '#94a3b8',
                  marginLeft: 'auto',
                }}
              >
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v7M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>{node.exports.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(CustomNode);

export const nodeTypes = {
  fileNode: CustomNode,
};
