'use client';

import { useState, useEffect } from 'react';
import type { FileNode } from '../../types/graph';
import { NODE_COLORS, NODE_LABELS } from '../../types/graph';

interface EntryAnimationProps {
  projectName: string;
  totalFiles: number;
  totalEdges: number;
  seedNodes: FileNode[];
  onComplete: () => void;
  onSkipToFullMap?: () => void; // Optional callback to skip exploration
}

export default function EntryAnimation({
  projectName,
  totalFiles,
  totalEdges,
  seedNodes,
  onComplete,
  onSkipToFullMap,
}: EntryAnimationProps) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Auto-complete after 2500ms
    const timer = setTimeout(() => {
      handleFadeOut();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleFadeOut = () => {
    setIsFading(true);
    // Wait for fade out animation, then call onComplete
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  const handleClick = () => {
    handleFadeOut();
  };

  const handleSkipClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent onClick from firing
    if (onSkipToFullMap) {
      setIsFading(true);
      setTimeout(() => {
        onSkipToFullMap();
      }, 400);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes fadeInSlideUp {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 0.5;
            }
            50% {
              opacity: 1;
            }
          }

          .entry-heading {
            animation: fadeIn 400ms ease-out forwards;
          }

          .entry-stats {
            animation: fadeIn 400ms ease-out 200ms forwards;
            opacity: 0;
          }

          .entry-card-0 {
            animation: fadeInSlideUp 400ms ease-out 400ms forwards;
            opacity: 0;
          }

          .entry-card-1 {
            animation: fadeInSlideUp 400ms ease-out 550ms forwards;
            opacity: 0;
          }

          .entry-card-2 {
            animation: fadeInSlideUp 400ms ease-out 700ms forwards;
            opacity: 0;
          }

          .entry-instruction {
            animation: fadeIn 400ms ease-out 1000ms forwards, pulse 1.8s ease-in-out 1400ms infinite;
            opacity: 0;
          }

          .entry-skip-button {
            animation: fadeIn 400ms ease-out 1200ms forwards;
            opacity: 0;
          }
        `}
      </style>
      <div
        onClick={handleClick}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          cursor: 'pointer',
          opacity: isFading ? 0 : 1,
          transition: isFading ? 'opacity 400ms ease-out' : 'none',
        }}
      >
        {/* Project name heading */}
        <h1
          className="entry-heading"
          style={{
            fontSize: '28px',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          {projectName}
        </h1>

        {/* Stats line */}
        <div
          className="entry-stats"
          style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
          }}
        >
          {totalFiles} files · {totalEdges} connections
        </div>

        {/* Seed node cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
            alignItems: 'stretch',
          }}
        >
          {seedNodes.slice(0, 3).map((node, index) => {
            const nodeColor = NODE_COLORS[node.type] || NODE_COLORS.unknown;
            const nodeLabel = NODE_LABELS[node.type] || 'Unknown';

            return (
              <div
                key={node.id}
                className={`entry-card-${index}`}
                style={{
                  width: '160px',
                  padding: '14px',
                  backgroundColor: 'var(--color-background-primary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderLeft: `4px solid ${nodeColor}`,
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {/* Type badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignSelf: 'flex-start',
                    padding: '2px 8px',
                    borderRadius: '100px',
                    backgroundColor: nodeColor + '15',
                    color: nodeColor,
                    fontSize: '10px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}
                >
                  {nodeLabel}
                </div>

                {/* Node label */}
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    lineHeight: '1.3',
                    wordBreak: 'break-word',
                  }}
                >
                  {node.label}
                </div>

                {/* File path */}
                <div
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    color: 'var(--color-text-tertiary)',
                    lineHeight: '1.4',
                    wordBreak: 'break-all',
                  }}
                >
                  {node.filePath}
                </div>
              </div>
            );
          })}
        </div>

        {/* Instruction text */}
        <div
          className="entry-instruction"
          style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
          }}
        >
          Click any node to begin exploring →
        </div>

        {/* Skip to full map button */}
        {onSkipToFullMap && (
          <button
            onClick={handleSkipClick}
            className="entry-skip-button"
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              borderRadius: 6,
              border: '0.5px solid var(--color-border-secondary)',
              background: 'var(--color-background-primary)',
              color: 'var(--color-text-secondary)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s',
              pointerEvents: 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-background-secondary)';
              e.currentTarget.style.borderColor = 'var(--color-border-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-background-primary)';
              e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
            }}
          >
            <i className="ti ti-map" aria-hidden="true" style={{ fontSize: 14 }} />
            Skip to full map
          </button>
        )}
      </div>
    </>
  );
}
