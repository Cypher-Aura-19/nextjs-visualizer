'use client';

import { useGraph } from '../../store/useGraph';
import type { NodeType } from '../../types/graph';

interface ClusterConfig {
  x: number;
  y: number;
  radius: number;
  color: string;
  label: string;
  type: NodeType;
}

const clusters: ClusterConfig[] = [
  { x: 300, y: 250, radius: 180, color: '#EFF6FF', label: 'DASHBOARD', type: 'page' },
  { x: 550, y: 150, radius: 180, color: '#ECFDF5', label: 'AUTH MODULE', type: 'server-action' },
  { x: 800, y: 200, radius: 200, color: '#FFF7ED', label: 'BLOG MODULE', type: 'server-component' },
  { x: 600, y: 500, radius: 160, color: '#F3E8FF', label: 'SHARED UI', type: 'client-component' },
  { x: 450, y: 700, radius: 150, color: '#ECFEFF', label: 'API ROUTES', type: 'api-route' },
  { x: 800, y: 650, radius: 140, color: '#F9FAFB', label: 'UTILS', type: 'utility' },
];

export default function ClusterBackground() {
  const { graph } = useGraph();

  const getClusterFileCount = (type: NodeType) => {
    return graph?.nodes.filter(n => n.type === type).length || 0;
  };

  const getTextColor = (bgColor: string) => {
    const colorMap: Record<string, string> = {
      '#EFF6FF': '#3B82F6',
      '#ECFDF5': '#10B981',
      '#FFF7ED': '#F97316',
      '#F3E8FF': '#A855F7',
      '#ECFEFF': '#06B6D4',
      '#F9FAFB': '#6B7280',
    };
    return colorMap[bgColor] || '#6B7280';
  };

  const getLightTextColor = (bgColor: string) => {
    const colorMap: Record<string, string> = {
      '#EFF6FF': '#93C5FD',
      '#ECFDF5': '#6EE7B7',
      '#FFF7ED': '#FDBA74',
      '#F3E8FF': '#D8B4FE',
      '#ECFEFF': '#67E8F9',
      '#F9FAFB': '#9CA3AF',
    };
    return colorMap[bgColor] || '#9CA3AF';
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      {clusters.map((cluster, index) => {
        const fileCount = getClusterFileCount(cluster.type);
        if (fileCount === 0) return null;

        const textColor = getTextColor(cluster.color);
        const lightTextColor = getLightTextColor(cluster.color);
        
        // Position label at top or bottom based on cluster position
        const labelY = cluster.y < 400 ? cluster.y + cluster.radius + 30 : cluster.y - cluster.radius - 20;
        const subLabelY = cluster.y < 400 ? cluster.y + cluster.radius + 45 : cluster.y - cluster.radius - 5;

        return (
          <g key={index}>
            <circle 
              cx={cluster.x} 
              cy={cluster.y} 
              r={cluster.radius} 
              fill={cluster.color} 
              opacity="0.3" 
            />
            <text 
              x={cluster.x} 
              y={labelY} 
              textAnchor="middle" 
              fill={textColor} 
              fontSize="12" 
              fontWeight="600" 
              fontFamily="Inter"
            >
              {cluster.label}
            </text>
            <text 
              x={cluster.x} 
              y={subLabelY} 
              textAnchor="middle" 
              fill={lightTextColor} 
              fontSize="10" 
              fontFamily="Inter"
            >
              {fileCount} files
            </text>
          </g>
        );
      })}
    </svg>
  );
}
