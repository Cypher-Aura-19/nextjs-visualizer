// Reads each file and extracts all import statements and export declarations

export function extractImports(
  fileContent: string
): Array<{
  rawPath: string;
  importedNames: string[];
  isDynamic: boolean;
}> {
  const imports: Array<{
    rawPath: string;
    importedNames: string[];
    isDynamic: boolean;
  }> = [];

  // Match: import { Name1, Name2 } from 'path'
  // Captures named imports in curly braces and the module path
  const namedImportRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = namedImportRegex.exec(fileContent)) !== null) {
    const rawPath = match[2];
    if (isProjectImport(rawPath)) {
      const importedNames = match[1]
        .split(',')
        .map((name) => name.trim().split(/\s+as\s+/)[0].trim())
        .filter((name) => name.length > 0);
      imports.push({ rawPath, importedNames, isDynamic: false });
    }
  }

  // Match: import DefaultName from 'path'
  // Captures default import name and module path
  const defaultImportRegex = /import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = defaultImportRegex.exec(fileContent)) !== null) {
    const rawPath = match[2];
    if (isProjectImport(rawPath)) {
      imports.push({ rawPath, importedNames: [], isDynamic: false });
    }
  }

  // Match: import * as Namespace from 'path'
  // Captures namespace imports
  const namespaceImportRegex = /import\s+\*\s+as\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = namespaceImportRegex.exec(fileContent)) !== null) {
    const rawPath = match[2];
    if (isProjectImport(rawPath)) {
      imports.push({ rawPath, importedNames: [], isDynamic: false });
    }
  }

  // Match: import 'path' (side effect import)
  // Captures imports with no bindings
  const sideEffectImportRegex = /import\s+['"]([^'"]+)['"]/g;
  while ((match = sideEffectImportRegex.exec(fileContent)) !== null) {
    const rawPath = match[1];
    if (isProjectImport(rawPath)) {
      imports.push({ rawPath, importedNames: [], isDynamic: false });
    }
  }

  // Match: dynamic(() => import('path')) or import('path')
  // Captures dynamic imports used with Next.js dynamic() or standalone
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicImportRegex.exec(fileContent)) !== null) {
    const rawPath = match[1];
    if (isProjectImport(rawPath)) {
      imports.push({ rawPath, importedNames: [], isDynamic: true });
    }
  }

  return imports;
}

export function extractExports(fileContent: string): string[] {
  const exports: string[] = [];

  // Match: export default (any declaration)
  // Captures default exports
  const defaultExportRegex = /export\s+default\s+/g;
  if (defaultExportRegex.test(fileContent)) {
    exports.push('default');
  }

  // Match: export function FunctionName, export const VarName, export class ClassName
  // Captures named function, variable, and class exports
  const namedExportRegex = /export\s+(?:async\s+)?(?:function|const|let|var|class|type|interface|enum)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  let match;
  while ((match = namedExportRegex.exec(fileContent)) !== null) {
    exports.push(match[1]);
  }

  // Match: export { Name1, Name2, Name3 }
  // Captures re-exported names in curly braces
  const exportListRegex = /export\s+{([^}]+)}/g;
  while ((match = exportListRegex.exec(fileContent)) !== null) {
    const names = match[1]
      .split(',')
      .map((name) => name.trim().split(/\s+as\s+/)[0].trim())
      .filter((name) => name.length > 0);
    exports.push(...names);
  }

  // Remove duplicates
  return [...new Set(exports)];
}

// Helper function to check if an import path is from the project (not an npm package)
function isProjectImport(rawPath: string): boolean {
  return (
    rawPath.startsWith('./') ||
    rawPath.startsWith('../') ||
    rawPath.startsWith('@/') ||
    rawPath.startsWith('/')
  );
}
