'use client';

import type { Achievement } from '../../types/graph';
import { ACHIEVEMENT_COLORS } from '../../types/graph';

interface AchievementBadgeProps {
  achievement: Achievement;
  size: 'small' | 'large';
}

export default function AchievementBadge({ achievement, size }: AchievementBadgeProps) {
  const colors = ACHIEVEMENT_COLORS[achievement.color] || ACHIEVEMENT_COLORS.blue;

  if (size === 'small') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 10px',
          borderRadius: '100px',
          backgroundColor: colors.bg,
          color: colors.text,
          border: `0.5px solid ${colors.border}`,
          fontSize: '11px',
          fontWeight: 500,
        }}
      >
        <i
          className={`ti ti-${achievement.icon}`}
          style={{ fontSize: '13px' }}
          aria-hidden="true"
        />
        {achievement.label}
      </span>
    );
  }

  // Large size with shimmer animation
  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%) skewX(-15deg);
            }
            100% {
              transform: translateX(400%) skewX(-15deg);
            }
          }
          
          .shimmer-wrapper {
            position: relative;
            overflow: hidden;
          }
          
          .shimmer-effect {
            position: absolute;
            top: 0;
            left: 0;
            width: 30%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.3),
              transparent
            );
            animation: shimmer 1.2s ease-in-out;
            pointer-events: none;
          }
        `}
      </style>
      <div
        className="shimmer-wrapper"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 18px',
          borderRadius: '10px',
          backgroundColor: '#0C447C',
          minWidth: '240px',
          maxWidth: '300px',
        }}
      >
        <div className="shimmer-effect" />
        <i
          className={`ti ti-${achievement.icon}`}
          style={{
            fontSize: '24px',
            color: 'white',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div
            style={{
              fontSize: '10px',
              color: '#85B7EB',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Achievement unlocked
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
            }}
          >
            {achievement.label}
          </div>
        </div>
      </div>
    </>
  );
}
