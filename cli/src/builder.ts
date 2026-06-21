// Takes all analyzed data and builds the final project graph with nodes and edges

import fs from 'fs/promises';
import path from 'path';
import type { ProjectGraph, FileNode, GraphEdge } from './types';
import { walkProject } from './walker';
import { classifyFile } from './classifier';
import { extractImports, extractExports } from './parser';
import { resolveImportPath } from './resolver';

export async function buildGraph(projectPath: string): Promise<ProjectGraph> {
  // STEP 1 — Get all file paths
  const filePaths = await walkProject(projectPath);

  // STEP 2 — Read and analyze each file
  console.log(`[builder] Analyzing ${filePaths.length} files...`);

  const nodeMap = new Map<string, FileNode>();

  for (const filePath of filePaths) {
    try {
      // Read file content
      const fullPath = path.join(projectPath, filePath);
      
      // Check if it's actually a file (not a directory)
      const stat = await fs.stat(fullPath);
      if (!stat.isFile()) {
        continue;
      }

      const content = await fs.readFile(fullPath, 'utf-8');

      // Classify the file
      const { type, isClientComponent, isServerComponent } = classifyFile(filePath, content);

      // Extract exports
      const exports = extractExports(content);

      // Create FileNode
      const node: FileNode = {
        id: filePath,
        label: path.basename(filePath, path.extname(filePath)),
        type,
        filePath,
        isClientComponent,
        isServerComponent,
        exports,
        description: '', // Will be filled in later
      };

      nodeMap.set(filePath, node);
    } catch (error) {
      // Skip files that can't be read (permissions, encoding issues, etc.)
      console.warn(`[builder] Skipping ${filePath}: ${error instanceof Error ? error.message : 'unknown error'}`);
      continue;
    }
  }

  // STEP 3 — Extract all imports and build edges
  console.log(`[builder] Building edges...`);

  const edges: GraphEdge[] = [];
  const edgeIdSet = new Set<string>();

  for (const filePath of filePaths) {
    try {
      const fullPath = path.join(projectPath, filePath);
      
      // Check if it's actually a file
      const stat = await fs.stat(fullPath);
      if (!stat.isFile()) {
        continue;
      }

      const content = await fs.readFile(fullPath, 'utf-8');

      // Extract imports from this file
      const imports = extractImports(content);

      for (const importStatement of imports) {
        // Resolve the import to find the real target file
        const resolvedPath = await resolveImportPath(
          importStatement.rawPath,
          importStatement.importedNames,
          filePath,
          projectPath
        );

        // Skip if resolution failed
        if (!resolvedPath) {
          continue;
        }

        // Skip if target is not in our node map (points outside project)
        if (!nodeMap.has(resolvedPath)) {
          continue;
        }

        // Determine edge type
        const sourceExt = path.extname(filePath);
        const targetExt = path.extname(resolvedPath);
        const isSourceReact = sourceExt === '.tsx' || sourceExt === '.jsx';
        const isTargetReact = targetExt === '.tsx' || targetExt === '.jsx';
        const targetNode = nodeMap.get(resolvedPath);

        let edgeType: GraphEdge['type'];
        let label: string;

        if (isSourceReact && isTargetReact) {
          // React component rendering another React component
          edgeType = 'render';
          label = 'renders';
        } else if (targetNode?.type === 'server-action') {
          // Calling a server action
          edgeType = 'call';
          label = 'calls';
        } else {
          // Generic import
          edgeType = 'import-only';
          label = 'imports';
        }

        // Create edge with unique ID
        const edgeId = `${filePath}--${resolvedPath}`;

        // Skip if edge already exists (avoid duplicates)
        if (edgeIdSet.has(edgeId)) {
          continue;
        }

        const edge: GraphEdge = {
          id: edgeId,
          source: filePath,
          target: resolvedPath,
          type: edgeType,
          label,
        };

        edges.push(edge);
        edgeIdSet.add(edgeId);
      }
    } catch (error) {
      // Skip files that can't be read
      console.warn(`[builder] Skipping ${filePath} during edge building: ${error instanceof Error ? error.message : 'unknown error'}`);
      continue;
    }
  }

  // STEP 4 — Remove orphan utility nodes
  const connectedNodes = new Set<string>();

  // Collect all nodes that have edges
  for (const edge of edges) {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  }

  // Remove orphan nodes that are utility or unknown types
  for (const [filePath, node] of nodeMap.entries()) {
    if (!connectedNodes.has(filePath)) {
      if (node.type === 'utility' || node.type === 'unknown') {
        nodeMap.delete(filePath);
      }
    }
  }

  // STEP 5 — Build and return the final ProjectGraph object
  const graph: ProjectGraph = {
    nodes: Array.from(nodeMap.values()),
    edges,
    projectName: path.basename(projectPath),
    analyzedAt: new Date().toISOString(),
    totalFiles: nodeMap.size,
  };

  console.log(`[builder] Done. Found ${graph.nodes.length} nodes and ${graph.edges.length} edges.`);

  return graph;
}
