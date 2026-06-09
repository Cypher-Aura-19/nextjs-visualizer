// Entry point for nextjs-visualizer CLI
// Reads command line arguments and orchestrates the analysis process

import fs from 'fs/promises';
import path from 'path';
import { buildGraph } from './builder';
import { writeGraph } from './writer';

async function main() {
  // Read command line arguments
  const projectPath = process.argv[2];
  const outputFlag = process.argv[3];
  const outputFolder = process.argv[4];

  // Check if project path was provided
  if (!projectPath) {
    console.log(`Usage: ts-node src/index.ts <path-to-nextjs-project> [--output <output-folder>]

Example: ts-node src/index.ts ./my-app --output ./output`);
    process.exit(1);
  }

  try {
    // Resolve project path to absolute path
    const absoluteProjectPath = path.resolve(projectPath);

    // Check if project path exists
    try {
      await fs.access(absoluteProjectPath);
    } catch {
      console.error(`❌ Error: Project path does not exist: ${absoluteProjectPath}`);
      process.exit(1);
    }

    // Determine output folder
    let outputDir = './output';
    if (outputFlag === '--output' && outputFolder) {
      outputDir = outputFolder;
    }

    // Create output file path
    const outputFilePath = path.resolve(outputDir, 'graph.json');

    console.log(`\n🔍 Analyzing Next.js project at: ${absoluteProjectPath}\n`);

    // Build the graph
    const graph = await buildGraph(absoluteProjectPath);

    // Write the graph to file
    await writeGraph(graph, outputFilePath);

    // Print success message
    console.log(`\n✅ Analysis complete!`);
    console.log(`📄 Graph saved to: ${outputFilePath}`);
    console.log(`🌐 Now open the web viewer and load this file.\n`);
  } catch (error) {
    console.error('\n❌ Error during analysis:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);
