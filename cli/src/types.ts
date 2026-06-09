export type FileType = 
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
  type: FileType;
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
