'use client';

import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

interface FlowEdgeData {
  label?: string;
  edgeType?: 'render' | 'call' | 'import-only';
  color?: string;
  isInter?: boolean;
}

export default function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.35,
  });

  const edgeData = data as FlowEdgeData | undefined;
  const showLabel = edgeData?.isInter && edgeData?.label && edgeData.label !== 'imports';

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />

      {showLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'none',
              padding: '2px 7px',
              borderRadius: 10,
              fontSize: 10,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              background: 'white',
              border: `1px solid ${edgeData?.color ?? '#e5e7eb'}`,
              color: edgeData?.color ?? '#6b7280',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
            className="nodrag nopan"
          >
            {edgeData?.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const flowEdgeTypes = {
  flowEdge: FlowEdge,
};
