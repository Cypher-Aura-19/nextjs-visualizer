'use client';

import React, { createContext, useState, useCallback, ReactNode } from 'react';
import type { ProjectGraph, FileNode, NodeType } from '../types/graph';

interface GraphState {
  graph: ProjectGraph | null;
  selectedNode: FileNode | null;
  activeFilters: Set<NodeType>;
  searchQuery: string;
}

interface GraphActions {
  loadGraph: (graph: ProjectGraph) => void;
  selectNode: (node: FileNode | null) => void;
  toggleFilter: (type: NodeType) => void;
  setSearchQuery: (query: string) => void;
  clearGraph: () => void;
}

type GraphContextType = GraphState & GraphActions;

const GraphContext = createContext<GraphContextType | undefined>(undefined);

const allNodeTypes: NodeType[] = [
  'page',
  'layout',
  'server-component',
  'client-component',
  'api-route',
  'server-action',
  'middleware',
  'hook',
  'utility',
  'unknown',
];

const initialState: GraphState = {
  graph: null,
  selectedNode: null,
  activeFilters: new Set(allNodeTypes),
  searchQuery: '',
};

export function GraphProvider({ children }: { children: ReactNode }) {
  const [graph, setGraph] = useState<ProjectGraph | null>(initialState.graph);
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(initialState.selectedNode);
  const [activeFilters, setActiveFilters] = useState<Set<NodeType>>(initialState.activeFilters);
  const [searchQuery, setSearchQueryState] = useState<string>(initialState.searchQuery);

  const loadGraph = useCallback((newGraph: ProjectGraph) => {
    setGraph(newGraph);
  }, []);

  const selectNode = useCallback((node: FileNode | null) => {
    setSelectedNode(node);
  }, []);

  const toggleFilter = useCallback((type: NodeType) => {
    setActiveFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(type)) {
        newFilters.delete(type);
      } else {
        newFilters.add(type);
      }
      return newFilters;
    });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const clearGraph = useCallback(() => {
    setGraph(initialState.graph);
    setSelectedNode(initialState.selectedNode);
    setActiveFilters(new Set(allNodeTypes));
    setSearchQueryState(initialState.searchQuery);
  }, []);

  const value: GraphContextType = {
    graph,
    selectedNode,
    activeFilters,
    searchQuery,
    loadGraph,
    selectNode,
    toggleFilter,
    setSearchQuery,
    clearGraph,
  };

  return <GraphContext.Provider value={value}>{children}</GraphContext.Provider>;
}

export { GraphContext };
