// Writes the final graph JSON to an output file

import fs from 'fs/promises';
import path from 'path';
import type { ProjectGraph } from './types';

export async function writeGraph(
  graph: ProjectGraph,
  outputPath: string
): Promise<void> {
  // Create output directory if it doesn't exist
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  // Write graph as pretty-printed JSON
  const jsonContent = JSON.stringify(graph, null, 2);
  await fs.writeFile(outputPath, jsonContent, 'utf-8');

  // Log success message
  console.log(`[writer] Graph saved to: ${outputPath}`);
  console.log(
    `[writer] ${graph.nodes.length} nodes, ${graph.edges.length} edges, project: ${graph.projectName}`
  );
}
