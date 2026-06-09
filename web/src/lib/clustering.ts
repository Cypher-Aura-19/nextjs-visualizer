import type { ProjectGraph, FileNode } from '../types/graph';

export interface Cluster {
  id: string;              // slugified cluster name e.g. 'auth-module'
  label: string;           // display name e.g. 'Auth Module'
  nodeIds: string[];       // IDs of nodes in this cluster
  color: string;           // hex color for this cluster's theme
  position: { x: number; y: number };  // center position
  radius: number;          // pixel radius of the bubble
}

export interface ClusteredGraph {
  clusters: Cluster[];
  nodeClusterMap: Map<string, string>;  // nodeId → clusterId
}

const CLUSTER_COLORS = [
  '#378ADD',  // blue
  '#10b981',  // green  
  '#f59e0b',  // amber
  '#8b5cf6',  // purple
  '#ec4899',  // pink
  '#14b8a6',  // teal
  '#f97316',  // orange
  '#6366f1',  // indigo
];

// Auth-related keywords
const AUTH_KEYWORDS = ['auth', 'login', 'signin', 'signup', 'session', 'token', 'user', 'account', 'password', 'credential'];

// Dashboard-related keywords
const DASHBOARD_KEYWORDS = ['dashboard', 'admin', 'panel', 'overview'];

// Utility to slugify cluster names
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Utility to title case
function titleCase(text: string): string {
  return text
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Step 1: Detect feature folders
function detectFeatureFolders(nodes: FileNode[]): Map<string, string> {
  const folderCounts = new Map<string, number>();
  const folderDisplayNames = new Map<string, string>();

  nodes.forEach(node => {
    const path = node.filePath;
    
    // Check for feature folders in common patterns
    const patterns = [
      /^app\/([^\/]+)\//,
      /^src\/app\/([^\/]+)\//,
      /^features\/([^\/]+)\//,
      /^modules\/([^\/]+)\//,
    ];

    for (const pattern of patterns) {
      const match = path.match(pattern);
      if (match && match[1]) {
        const folderName = match[1];
        // Skip common Next.js and framework folders that aren't feature modules
        const skipFolders = [
          'components', '_components', 'lib', 'utils', 'hooks',
          'styles', 'public', 'api', 'posts', 'blog', 'pages',
          'layouts', 'types', 'interfaces', 'helpers', 'constants',
          'assets', 'images', 'icons', 'fonts',
        ];
        // Also skip Next.js dynamic segments like [slug], (group), etc.
        const isDynamic = folderName.startsWith('[') || folderName.startsWith('(') || folderName.startsWith('_');
        if (!skipFolders.includes(folderName) && !isDynamic) {
          folderCounts.set(folderName, (folderCounts.get(folderName) || 0) + 1);
          if (!folderDisplayNames.has(folderName)) {
            folderDisplayNames.set(folderName, titleCase(folderName));
          }
        }
      }
    }
  });

  // Keep only folders with 3+ files
  const featureFolders = new Map<string, string>();
  folderCounts.forEach((count, folder) => {
    if (count >= 3) {
      featureFolders.set(folder, folderDisplayNames.get(folder) || titleCase(folder));
    }
  });

  return featureFolders;
}

// Step 2: Assign each node to exactly one cluster
function assignNodesToClusters(
  nodes: FileNode[],
  featureFolders: Map<string, string>
): Map<string, string[]> {
  const clusterNodes = new Map<string, string[]>();

  nodes.forEach(node => {
    const path = node.filePath.toLowerCase();
    let assignedCluster: string | null = null;

    // Priority 1: Feature folder clusters
    for (const [folder, displayName] of featureFolders.entries()) {
      if (path.includes(`/${folder}/`) || path.startsWith(`${folder}/`)) {
        assignedCluster = displayName;
        break;
      }
    }

    // Priority 2: Auth module
    if (!assignedCluster && AUTH_KEYWORDS.some(kw => path.includes(kw))) {
      assignedCluster = 'Auth Module';
    }

    // Priority 3: Dashboard
    if (!assignedCluster && DASHBOARD_KEYWORDS.some(kw => path.includes(kw))) {
      assignedCluster = 'Dashboard';
    }

    // Priority 4: API Routes
    if (!assignedCluster && (node.type === 'api-route' || path.includes('/api/'))) {
      assignedCluster = 'API Routes';
    }

    // Priority 5: Utils & Hooks
    if (!assignedCluster && (node.type === 'utility' || node.type === 'hook')) {
      assignedCluster = 'Utils & Hooks';
    }

    // Priority 6: Pages & Layouts
    if (!assignedCluster && (node.type === 'page' || node.type === 'layout')) {
      assignedCluster = 'Pages & Layouts';
    }

    // Priority 7: Shared UI (components)
    if (!assignedCluster && 
        (node.type === 'client-component' || node.type === 'server-component') &&
        path.includes('components/')) {
      assignedCluster = 'Shared UI';
    }

    // Default: Other
    if (!assignedCluster) {
      assignedCluster = 'Other';
    }

    if (!clusterNodes.has(assignedCluster)) {
      clusterNodes.set(assignedCluster, []);
    }
    clusterNodes.get(assignedCluster)!.push(node.id);
  });

  return clusterNodes;
}

// Fix: collect keys to delete first, then delete — avoids Map mutation during forEach
function consolidateClusters(clusterNodes: Map<string, string[]>): Map<string, string[]> {
  const otherNodes = clusterNodes.get('Other') || [];
  const singleNodeIds: string[] = [];
  const toDelete: string[] = [];

  clusterNodes.forEach((nodeIds, clusterName) => {
    if (nodeIds.length === 1 && clusterName !== 'Other') {
      singleNodeIds.push(...nodeIds);
      toDelete.push(clusterName);
    }
  });

  if (otherNodes.length + singleNodeIds.length <= 20) {
    toDelete.forEach(name => clusterNodes.delete(name));
    if (singleNodeIds.length > 0) {
      clusterNodes.set('Other', [...otherNodes, ...singleNodeIds]);
    }
  }

  return clusterNodes;
}

// Calculate cluster radius based on node count
function calculateRadius(nodeCount: number): number {
  if (nodeCount <= 5) return 220;
  if (nodeCount <= 12) return 340;
  if (nodeCount <= 20) return 460;
  if (nodeCount <= 30) return 580;
  return 700;
}

// Calculate cluster positions in a circle
function calculateClusterPositions(
  clusterNodes: Map<string, string[]>
): Map<string, { position: { x: number; y: number }; radius: number }> {
  const positions = new Map<string, { position: { x: number; y: number }; radius: number }>();
  
  const clusterArray = Array.from(clusterNodes.entries());
  const clusterCount = clusterArray.length;

  // Calculate max radius
  const maxRadius = Math.max(...clusterArray.map(([_, nodes]) => calculateRadius(nodes.length)));
  const circleRadius = maxRadius * 2.5 + 200;

  clusterArray.forEach(([clusterName, nodeIds], index) => {
    const angle = (index / clusterCount) * 2 * Math.PI;
    const radius = calculateRadius(nodeIds.length);
    
    positions.set(clusterName, {
      position: {
        x: Math.cos(angle) * circleRadius,
        y: Math.sin(angle) * circleRadius,
      },
      radius,
    });
  });

  return positions;
}

// Main clustering function
export function clusterGraph(graph: ProjectGraph): ClusteredGraph {
  // Step 1: Detect feature folders
  const featureFolders = detectFeatureFolders(graph.nodes);

  // Step 2: Assign nodes to clusters
  let clusterNodes = assignNodesToClusters(graph.nodes, featureFolders);

  // Step 3: Consolidate small clusters
  clusterNodes = consolidateClusters(clusterNodes);

  // Step 4: Sort clusters by size (largest first)
  const sortedClusters = Array.from(clusterNodes.entries())
    .sort((a, b) => b[1].length - a[1].length);

  // Calculate positions
  const positions = calculateClusterPositions(new Map(sortedClusters));

  // Create clusters with colors
  const clusters: Cluster[] = sortedClusters.map(([clusterName, nodeIds], index) => {
    const color = CLUSTER_COLORS[index % CLUSTER_COLORS.length];
    const posInfo = positions.get(clusterName)!;

    return {
      id: slugify(clusterName),
      label: clusterName,
      nodeIds,
      color,
      position: posInfo.position,
      radius: posInfo.radius,
    };
  });

  // Create node-to-cluster map
  const nodeClusterMap = new Map<string, string>();
  clusters.forEach(cluster => {
    cluster.nodeIds.forEach(nodeId => {
      nodeClusterMap.set(nodeId, cluster.id);
    });
  });

  return {
    clusters,
    nodeClusterMap,
  };
}
