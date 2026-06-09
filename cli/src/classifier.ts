// Looks at each file and decides what type it is (page, component, API route, etc.)

import path from 'path';
import type { FileNode } from './types';

export function classifyFile(
  filePath: string,
  fileContent: string
): {
  type: FileNode['type'];
  isClientComponent: boolean;
  isServerComponent: boolean;
} {
  const fileName = path.basename(filePath, path.extname(filePath));
  const fileExt = path.extname(filePath);
  const normalizedPath = filePath.replace(/\\/g, '/');

  // 1. Check if file is middleware at root level
  if (filePath === 'middleware.ts' || filePath === 'middleware.js') {
    return {
      type: 'middleware',
      isClientComponent: false,
      isServerComponent: false,
    };
  }

  // 2. Check if file is a layout in app/ directory
  if (normalizedPath.includes('/app/') && fileName === 'layout') {
    return {
      type: 'layout',
      isClientComponent: false,
      isServerComponent: true,
    };
  }

  // 3. Check if file is a page in app/ directory
  if (normalizedPath.includes('/app/') && fileName === 'page') {
    return {
      type: 'page',
      isClientComponent: false,
      isServerComponent: true,
    };
  }

  // 4. Check if file is an API route in app/ directory
  if (normalizedPath.includes('/app/') && fileName === 'route') {
    return {
      type: 'api-route',
      isClientComponent: false,
      isServerComponent: false,
    };
  }

  // 5. Check if file is a React hook (starts with 'use' followed by uppercase)
  if (fileName.startsWith('use') && fileName.length > 3 && fileName[3] === fileName[3].toUpperCase()) {
    return {
      type: 'hook',
      isClientComponent: false,
      isServerComponent: false,
    };
  }

  // 6. Check if file is in utility/helper directories
  if (
    normalizedPath.includes('/utils/') ||
    normalizedPath.includes('/lib/') ||
    normalizedPath.includes('/helpers/') ||
    normalizedPath.includes('/services/')
  ) {
    return {
      type: 'utility',
      isClientComponent: false,
      isServerComponent: false,
    };
  }

  // 7. Check file content for directives
  const firstFiveLines = fileContent.split('\n').slice(0, 5);
  const hasUseClient = firstFiveLines.some((line) => line.includes("'use client'") || line.includes('"use client"'));
  const hasUseServer = firstFiveLines.some((line) => line.includes("'use server'") || line.includes('"use server"'));

  // If 'use client' directive found
  if (hasUseClient) {
    return {
      type: 'client-component',
      isClientComponent: true,
      isServerComponent: false,
    };
  }

  // If 'use server' directive found
  if (hasUseServer) {
    // Check if it's a server action file
    if (
      normalizedPath.includes('/app/') &&
      (fileName === 'actions' || fileName === 'action')
    ) {
      return {
        type: 'server-action',
        isClientComponent: false,
        isServerComponent: false,
      };
    }
    // Otherwise treat as server component
    return {
      type: 'server-component',
      isClientComponent: false,
      isServerComponent: true,
    };
  }

  // Check file extension to determine component vs utility
  const isReactFile = fileExt === '.tsx' || fileExt === '.jsx';
  const isScriptFile = fileExt === '.ts' || fileExt === '.js';

  if (isReactFile) {
    // React files without directives are server components by default in App Router
    return {
      type: 'server-component',
      isClientComponent: false,
      isServerComponent: true,
    };
  }

  if (isScriptFile) {
    // Non-React files are utilities
    return {
      type: 'utility',
      isClientComponent: false,
      isServerComponent: false,
    };
  }

  // 8. Fallback to unknown
  return {
    type: 'unknown',
    isClientComponent: false,
    isServerComponent: false,
  };
}
