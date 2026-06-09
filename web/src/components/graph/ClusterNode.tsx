'use client';

import React from 'react';

interface ClusterGroupData {
  label: string;
  nodeCount: number;
  visibleCount: number;
  color: string;
}

function ClusterGroupNode({ data }: { data: ClusterGroupData }) {
  const bg       = `${data.color}07`;
  const border   = `${data.color}28`;
  const headerBg = `${data.color}12`;
  const labelClr = data.color;
  const countClr = `${data.color}AA`;
  const isFiltered = data.visibleCount < data.nodeCount;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        pointerEvents: 'none',
        borderRadius: 14,
        background: bg,
        border: `1.5px solid ${border}`,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Header bar ─────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 44,
          borderRadius: '13px 13px 0 0',
          background: headerBg,
          borderBottom: `1px solid ${border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 10,
        }}
      >
        {/* Colored square icon */}
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: data.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
            <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
            <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
            <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>

        {/* Cluster name */}
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: labelClr,
            letterSpacing: '0.03em',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1,
            textTransform: 'uppercase',
          }}
        >
          {data.label}
        </span>

        {/* Pill: file count */}
        <div
          style={{
            marginLeft: 'auto',
            padding: '3px 9px',
            borderRadius: 20,
            background: `${data.color}18`,
            border: `1px solid ${data.color}30`,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: data.color,
              opacity: 0.8,
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: countClr,
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.02em',
            }}
          >
            {isFiltered
              ? `${data.visibleCount} / ${data.nodeCount} files`
              : `${data.nodeCount} ${data.nodeCount === 1 ? 'file' : 'files'}`}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ClusterGroupNode;

export const clusterNodeTypes = {
  clusterBubble: ClusterGroupNode,
};
