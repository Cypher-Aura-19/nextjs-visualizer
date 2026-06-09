'use client';

import { create } from 'zustand';
import type { ProjectGraph, FileNode, Achievement, GraphEdge } from '../types/graph';

type ViewMode = 'explore' | 'map';

interface ExplorerState {
  // Core data
  fullGraph: ProjectGraph | null;
  revealedNodes: FileNode[];
  revealedEdges: GraphEdge[]; // Actual edge objects, not just IDs
  explorationPath: string[];
  selectedNodeId: string | null;
  
  // UI state
  viewMode: ViewMode;
  searchQuery: string;
  activeFilters: Set<string>;
  
  // Gamification
  xp: number;
  achievements: Achievement[];
  completionPercent: number;
  
  // Actions
  loadGraph: (graph: ProjectGraph) => void;
  selectNode: (nodeId: string | null) => void;
  exploreNode: (nodeId: string) => void;
  revealNode: (nodeId: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  toggleFilter: (filter: string) => void;
  unlockAchievement: (achievement: Achievement) => void;
  clearGraph: () => void;
  reset: () => void;
}

export const useExplorer = create<ExplorerState>((set, get) => ({
  // Initial state
  fullGraph: null,
  revealedNodes: [],
  revealedEdges: [],
  explorationPath: [],
  selectedNodeId: null,
  viewMode: 'explore',
  searchQuery: '',
  activeFilters: new Set(),
  xp: 0,
  achievements: [],
  completionPercent: 0,
  
  // Actions
  loadGraph: (graph: ProjectGraph) => {
    // Reveal all nodes and edges upfront so the full graph is visible immediately
    set({
      fullGraph: graph,
      revealedNodes: graph.nodes,
      revealedEdges: graph.edges,
      explorationPath: [],
      completionPercent: 100,
    });
  },
  
  selectNode: (nodeId: string | null) => {
    const { explorationPath, fullGraph, revealedNodes, revealedEdges } = get();
    
    // If null, just deselect
    if (nodeId === null) {
      set({ selectedNodeId: null });
      return;
    }
    
    if (!fullGraph) return;
    
    // Add to exploration path (avoid consecutive duplicates)
    const newPath = explorationPath[explorationPath.length - 1] === nodeId
      ? explorationPath
      : [...explorationPath, nodeId];
    
    // Find connected nodes
    const connectedNodeIds = fullGraph.edges
      .filter((e) => e.source === nodeId || e.target === nodeId)
      .flatMap((e) => [e.source, e.target])
      .filter((id) => id !== nodeId);
    
    // Get the actual FileNode objects
    const connectedNodes = fullGraph.nodes.filter((n) => connectedNodeIds.includes(n.id));
    
    // Merge with existing revealed nodes (avoid duplicates)
    const revealedIds = new Set(revealedNodes.map((n) => n.id));
    const newNodesToReveal = connectedNodes.filter((n) => !revealedIds.has(n.id));
    const newRevealedNodes = [...revealedNodes, ...newNodesToReveal];
    
    // Update revealed edges (edges between revealed nodes)
    const allRevealedIds = new Set(newRevealedNodes.map((n) => n.id));
    const newRevealedEdges = fullGraph.edges.filter(
      (e) => allRevealedIds.has(e.source) && allRevealedIds.has(e.target)
    );
    
    // Calculate new stats
    const newXp = get().xp + 10;
    const newCompletion = Math.round((newRevealedNodes.length / fullGraph.nodes.length) * 100);
    
    set({
      explorationPath: newPath,
      revealedNodes: newRevealedNodes,
      revealedEdges: newRevealedEdges,
      selectedNodeId: nodeId,
      xp: newXp,
      completionPercent: newCompletion,
    });
    
    // Check for achievements
    checkAchievements(get());
  },
  
  exploreNode: (nodeId: string) => {
    // Same as selectNode but also switches to explore mode
    get().selectNode(nodeId);
    set({ viewMode: 'explore' });
  },
  
  revealNode: (nodeId: string) => {
    const { revealedNodes, fullGraph } = get();
    
    if (!fullGraph) return;
    
    // Check if already revealed
    if (revealedNodes.some((n) => n.id === nodeId)) return;
    
    const nodeToReveal = fullGraph.nodes.find((n) => n.id === nodeId);
    if (!nodeToReveal) return;
    
    const newRevealedNodes = [...revealedNodes, nodeToReveal];
    const newCompletion = Math.round((newRevealedNodes.length / fullGraph.nodes.length) * 100);
    
    set({
      revealedNodes: newRevealedNodes,
      completionPercent: newCompletion,
    });
  },
  
  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode });
    
    // If switching to map mode, reveal all nodes
    if (mode === 'map') {
      const { fullGraph } = get();
      if (fullGraph) {
        set({
          revealedNodes: fullGraph.nodes,
          completionPercent: 100,
        });
      }
    }
  },
  
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },
  
  toggleFilter: (filter: string) => {
    const { activeFilters } = get();
    const newFilters = new Set(activeFilters);
    
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    
    set({ activeFilters: newFilters });
  },
  
  unlockAchievement: (achievement: Achievement) => {
    const { achievements } = get();
    
    // Check if already unlocked
    if (achievements.some((a) => a.id === achievement.id)) return;
    
    set({
      achievements: [...achievements, achievement],
      xp: get().xp + 50,
    });
  },
  
  clearGraph: () => {
    set({
      fullGraph: null,
      revealedNodes: [],
      revealedEdges: [],
      explorationPath: [],
      selectedNodeId: null,
      viewMode: 'explore',
      searchQuery: '',
      activeFilters: new Set(),
      xp: 0,
      achievements: [],
      completionPercent: 0,
    });
  },
  
  reset: () => {
    set({
      fullGraph: null,
      revealedNodes: [],
      revealedEdges: [],
      explorationPath: [],
      selectedNodeId: null,
      viewMode: 'explore',
      searchQuery: '',
      activeFilters: new Set(),
      xp: 0,
      achievements: [],
      completionPercent: 0,
    });
  },
}));

// Helper function to check and unlock achievements
function checkAchievements(state: ExplorerState) {
  const { explorationPath, revealedNodes, fullGraph, unlockAchievement } = state;
  
  if (!fullGraph) return;
  
  // First click
  if (explorationPath.length === 1) {
    unlockAchievement({
      id: 'first-click',
      label: 'Explorer',
      icon: 'map-pin',
      color: 'blue',
    });
  }
  
  // 10 nodes revealed
  if (revealedNodes.length >= 10) {
    unlockAchievement({
      id: 'ten-nodes',
      label: 'Pathfinder',
      icon: 'route',
      color: 'green',
    });
  }
  
  // 25 nodes revealed
  if (revealedNodes.length >= 25) {
    unlockAchievement({
      id: 'twenty-five-nodes',
      label: 'Cartographer',
      icon: 'map',
      color: 'purple',
    });
  }
  
  // 50% completion
  if (state.completionPercent >= 50) {
    unlockAchievement({
      id: 'half-complete',
      label: 'Halfway There',
      icon: 'trophy',
      color: 'gold',
    });
  }
  
  // 100% completion
  if (state.completionPercent >= 100) {
    unlockAchievement({
      id: 'complete',
      label: 'Master Explorer',
      icon: 'crown',
      color: 'gold',
    });
  }
}
