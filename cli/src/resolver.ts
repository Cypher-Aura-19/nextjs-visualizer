// Resolves barrel re-exports through index.ts files to find actual source files

import fs from 'fs';
import path from 'path';

export async function resolveImportPath(
  rawImportPath: string,
  importedNames: string[],
  currentFilePath: string,
  projectRoot: string
): Promise<string | null> {
  // Step 1 — Convert raw import path to absolute path
  let absolutePath: string;

  if (rawImportPath.startsWith('@/')) {
    // Handle Next.js path alias @/
    // Try src/ directory first, then root
    const withoutAlias = rawImportPath.slice(2);
    const srcPath = path.join(projectRoot, 'src', withoutAlias);
    const rootPath = path.join(projectRoot, withoutAlias);

    if (fs.existsSync(srcPath) || fs.existsSync(srcPath + '.ts') || fs.existsSync(srcPath + '.tsx')) {
      absolutePath = srcPath;
    } else {
      absolutePath = rootPath;
    }
  } else if (rawImportPath.startsWith('./') || rawImportPath.startsWith('../')) {
    // Handle relative imports - resolve relative to the importing file's directory
    const currentFileDir = path.dirname(path.join(projectRoot, currentFilePath));
    absolutePath = path.resolve(currentFileDir, rawImportPath);
  } else if (rawImportPath.startsWith('/')) {
    // Handle absolute imports from project root
    absolutePath = path.join(projectRoot, rawImportPath);
  } else {
    // Not a project import (probably npm package)
    return null;
  }

  // Step 2 — Try to find the actual file with various extensions
  const extensionsToTry = [
    '', // Try exact path first
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '/index.ts',
    '/index.tsx',
    '/index.js',
    '/index.jsx',
  ];

  let foundPath: string | null = null;

  for (const ext of extensionsToTry) {
    const testPath = absolutePath + ext;
    if (fs.existsSync(testPath)) {
      foundPath = testPath;
      break;
    }
  }

  // If no file found, return null
  if (!foundPath) {
    return null;
  }

  // Step 3 — Check if the found file is a barrel file
  const fileContent = fs.readFileSync(foundPath, 'utf-8');
  const fileName = path.basename(foundPath);

  if (isBarrelFile(fileName, fileContent)) {
    // Step 4 — If it's a barrel file and we have specific imports to resolve
    if (importedNames.length > 0) {
      // Try to resolve each imported name through the barrel
      for (const importedName of importedNames) {
        const resolvedPath = resolveFromBarrel(
          foundPath,
          importedName,
          fileContent,
          projectRoot
        );

        if (resolvedPath) {
          // Recursively resolve in case the target is also a barrel
          const finalPath = await resolveImportPath(
            resolvedPath,
            [], // No specific names to look for in the final file
            path.relative(projectRoot, foundPath),
            projectRoot
          );

          if (finalPath) {
            return finalPath;
          }
        }
      }
    }

    // If we couldn't resolve through barrel, return the barrel itself
    return path.relative(projectRoot, foundPath).replace(/\\/g, '/');
  }

  // Step 5 — Not a barrel file, return the found file path relative to project root
  return path.relative(projectRoot, foundPath).replace(/\\/g, '/');
}

export function isBarrelFile(fileName: string, fileContent: string): boolean {
  // Check if filename is an index file
  const isIndexFile = fileName === 'index.ts' || 
                      fileName === 'index.tsx' || 
                      fileName === 'index.js' || 
                      fileName === 'index.jsx';

  if (!isIndexFile) {
    return false;
  }

  // Count total non-empty lines and export lines
  const lines = fileContent.split('\n');
  const nonEmptyLines = lines.filter(
    (line) => line.trim().length > 0 && !line.trim().startsWith('//')
  );

  if (nonEmptyLines.length === 0) {
    return false;
  }

  // Count lines that are re-export statements
  const exportLines = nonEmptyLines.filter((line) => {
    const trimmed = line.trim();
    return (
      trimmed.startsWith('export {') ||
      trimmed.startsWith('export *') ||
      trimmed.startsWith('export type {')
    );
  });

  // If more than 60% of lines are exports, it's a barrel file
  return exportLines.length / nonEmptyLines.length > 0.6;
}

// Helper function to resolve a specific import name from a barrel file
function resolveFromBarrel(
  barrelFilePath: string,
  importedName: string,
  barrelContent: string,
  projectRoot: string
): string | null {
  const lines = barrelContent.split('\n');

  for (const line of lines) {
    // Match: export { Name } from 'path'
    // Match: export { Name as Alias } from 'path'
    // Match: export type { Name } from 'path'
    const namedExportMatch = line.match(
      /export\s+(?:type\s+)?{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/
    );

    if (namedExportMatch) {
      const exportedNames = namedExportMatch[1]
        .split(',')
        .map((name) => {
          // Handle 'Name as Alias' - we want the original name
          const parts = name.trim().split(/\s+as\s+/);
          return parts[0].trim();
        });

      if (exportedNames.includes(importedName)) {
        // Found the export, return the path it exports from
        return namedExportMatch[2];
      }
    }

    // Match: export * from 'path'
    const wildcardMatch = line.match(/export\s+\*\s+from\s+['"]([^'"]+)['"]/);
    if (wildcardMatch) {
      // For wildcard exports, we'd need to recursively check that file
      // For now, return the path and let the recursive call handle it
      return wildcardMatch[1];
    }
  }

  return null;
}
