export type NodeType =
  | 'page'
  | 'layout'
  | 'server-component'
  | 'client-component'
  | 'api-route'
  | 'server-action'
  | 'middleware'
  | 'hook'
  | 'utility'
  | 'unknown';

export type EdgeType = 'render' | 'call' | 'import-only';

export interface FileNode {
  id: string;
  label: string;
  type: NodeType;
  filePath: string;
  isClientComponent: boolean;
  isServerComponent: boolean;
  exports: string[];
  description: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label: string;
}

export interface ProjectGraph {
  nodes: FileNode[];
  edges: GraphEdge[];
  projectName: string;
  analyzedAt: string;
  totalFiles: number;
}

export const NODE_COLORS: Record<NodeType, string> = {
  page: '#2563eb',           // Strong Blue
  layout: '#16a34a',         // Strong Green
  'server-component': '#ea580c', // Strong Orange
  'client-component': '#c026d3', // Strong Magenta/Purple
  'api-route': '#dc2626',    // Strong Red
  'server-action': '#ca8a04', // Strong Gold/Yellow
  middleware: '#64748b',     // Slate Grey
  hook: '#64748b',           // Slate Grey
  utility: '#64748b',        // Slate Grey
  unknown: '#94a3b8',        // Light Grey
};

export const NODE_LABELS: Record<NodeType, string> = {
  page: 'Page',
  layout: 'Layout',
  'server-component': 'Server Component',
  'client-component': 'Client Component',
  'api-route': 'API Route',
  'server-action': 'Server Action',
  middleware: 'Middleware',
  hook: 'Hook',
  utility: 'Utility',
  unknown: 'Unknown',
};

export type AchievementColor = 'blue' | 'green' | 'gold' | 'purple' | 'red';

export interface Achievement {
  id: string;
  label: string;
  icon: string;
  color: AchievementColor;
}

export const ACHIEVEMENT_COLORS: Record<AchievementColor, { bg: string; text: string; border: string }> = {
  blue: {
    bg: '#EFF6FF',
    text: '#1E40AF',
    border: '#BFDBFE',
  },
  green: {
    bg: '#ECFDF5',
    text: '#065F46',
    border: '#A7F3D0',
  },
  gold: {
    bg: '#FFFBEB',
    text: '#92400E',
    border: '#FDE68A',
  },
  purple: {
    bg: '#F5F3FF',
    text: '#5B21B6',
    border: '#DDD6FE',
  },
  red: {
    bg: '#FEF2F2',
    text: '#991B1B',
    border: '#FECACA',
  },
};
