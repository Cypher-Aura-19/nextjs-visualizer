// Walks the file system and collects all file paths in the Next.js project

import { glob } from 'glob';
import path from 'path';

export async function walkProject(projectPath: string): Promise<string[]> {
  // Define folders to skip (generated or third-party code)
  const ignoredFolders = [
    '**/node_modules/**',
    '**/.next/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/.turbo/**',
  ];

  // Find all TypeScript and JavaScript files using glob
  const files = await glob('**/*.{ts,tsx,js,jsx}', {
    cwd: projectPath,
    ignore: ignoredFolders,
    nodir: true,
    absolute: false,
  });

  // Filter out config files and test files
  const relevantFiles = files.filter((file) => {
    const fileName = path.basename(file);
    
    // Skip Next.js config files
    if (fileName === 'next.config.ts' || fileName === 'next.config.js') {
      return false;
    }
    
    // Skip Tailwind config files
    if (fileName === 'tailwind.config.ts' || fileName === 'tailwind.config.js') {
      return false;
    }
    
    // Skip PostCSS config
    if (fileName === 'postcss.config.js') {
      return false;
    }
    
    // Skip ESLint config files
    if (fileName === 'eslint.config.js' || fileName === '.eslintrc.js') {
      return false;
    }
    
    // Skip Jest config files
    if (fileName === 'jest.config.ts' || fileName === 'jest.config.js') {
      return false;
    }
    
    // Skip test files
    if (fileName.endsWith('.test.ts') || fileName.endsWith('.test.tsx') ||
        fileName.endsWith('.spec.ts') || fileName.endsWith('.spec.tsx')) {
      return false;
    }
    
    // Skip TypeScript declaration files
    if (fileName.endsWith('.d.ts')) {
      return false;
    }
    
    return true;
  });

  // Normalize paths to use forward slashes
  const normalizedPaths = relevantFiles.map((file) => file.replace(/\\/g, '/'));

  // Log how many files were found
  console.log(`[walker] Found ${normalizedPaths.length} files to analyze`);

  return normalizedPaths;
}
