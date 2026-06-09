'use client';

import React from 'react';
import { useExplorer } from '../../store/useExplorer';

export default function ExplorerHUD() {
  const { explorationPath, fullGraph, selectNode, revealedNodes, completionPercent } = useExplorer();

  // Last 4 unique nodes in breadcrumb
  const crumbs = explorationPath.slice(-4);

  // Contextual hint — only show when less than 50% explored
  const hint =
    completionPercent >= 50
      ? null
      : revealedNodes.length < 5
      ? 'Click a node to explore its connections'
      : revealedNodes.length < 15
      ? 'Click nodes to reveal more of the graph'
      : 'Use Map view to see the full codebase';

  return (
    <div
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      {/* Breadcrumb trail — top left */}
      {crumbs.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            pointerEvents: 'auto',
          }}
        >
          {crumbs.map((nodeId, i) => {
            const node = fullGraph?.nodes.find((n) => n.id === nodeId);
            const isLast = i === crumbs.length - 1;
            return (
              <React.Fragment key={`${nodeId}-${i}`}>
                <button
                  onClick={() => { if (!isLast) selectNode(nodeId); }}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 20,
                    border: '1px solid #e9ecef',
                    background: isLast ? '#f1f5f9' : '#fff',
                    color: isLast ? '#0f172a' : '#64748b',
                    fontSize: 11,
                    fontWeight: isLast ? 500 : 400,
                    cursor: isLast ? 'default' : 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {node?.label ?? nodeId}
                </button>
                {!isLast && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: '#94a3b8', flexShrink: 0 }}>
                    <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Hint — bottom right, only when relevant */}
      {hint && (
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            right: 16,
            padding: '6px 12px',
            borderRadius: 8,
            background: '#fff',
            border: '1px solid #e9ecef',
            fontSize: 11,
            color: '#64748b',
            pointerEvents: 'none',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
