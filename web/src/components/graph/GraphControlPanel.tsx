'use client';

import { useState } from 'react';

export default function GraphControlPanel() {
  const [levelOfDetail, setLevelOfDetail] = useState(50);
  const [groupBy, setGroupBy] = useState<'type' | 'feature' | 'directory' | 'none'>('type');
  const [showDependencies, setShowDependencies] = useState(true);
  const [showFileNames, setShowFileNames] = useState(true);
  const [showDirections, setShowDirections] = useState(true);
  const [clusterRelated, setClusterRelated] = useState(true);
  const [layoutDirection, setLayoutDirection] = useState<'horizontal' | 'vertical' | 'radial'>('horizontal');

  return (
    <div className="absolute left-6 top-6 w-64 bg-white rounded-xl border border-gray-200 shadow-lg p-4 z-10" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Graph Controls</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Level of Detail */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Level of Detail</label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Simple</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={levelOfDetail}
            onChange={(e) => setLevelOfDetail(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-gray-500">Detailed</span>
        </div>
      </div>

      {/* Group By */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Group By</label>
        <div className="flex gap-2">
          <button
            onClick={() => setGroupBy('type')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${
              groupBy === 'type' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Type
          </button>
          <button
            onClick={() => setGroupBy('feature')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${
              groupBy === 'feature' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Feature
          </button>
          <button
            onClick={() => setGroupBy('directory')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${
              groupBy === 'directory' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Directory
          </button>
          <button
            onClick={() => setGroupBy('none')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${
              groupBy === 'none' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            None
          </button>
        </div>
      </div>

      {/* Toggle Options */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Show Dependencies</span>
          <button
            onClick={() => setShowDependencies(!showDependencies)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showDependencies ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showDependencies ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Show File Names</span>
          <button
            onClick={() => setShowFileNames(!showFileNames)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showFileNames ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showFileNames ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Show Directions</span>
          <button
            onClick={() => setShowDirections(!showDirections)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showDirections ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showDirections ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Cluster Related</span>
          <button
            onClick={() => setClusterRelated(!clusterRelated)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              clusterRelated ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              clusterRelated ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Layout Direction */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Layout Direction</label>
        <div className="grid grid-cols-4 gap-2">
          <button 
            onClick={() => setLayoutDirection('horizontal')}
            className={`p-2 rounded border ${
              layoutDirection === 'horizontal' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
            }`}
          >
            <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 11h18v2H3z"/>
            </svg>
          </button>
          <button 
            onClick={() => setLayoutDirection('vertical')}
            className={`p-2 rounded border ${
              layoutDirection === 'vertical' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
            }`}
          >
            <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 3h2v18h-2z"/>
            </svg>
          </button>
          <button className="p-2 rounded border border-gray-200">
            <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v18M3 12h18"/>
            </svg>
          </button>
          <button className="p-2 rounded border border-gray-200">
            <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3l9 9-9 9-9-9z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-xs font-semibold text-gray-900 mb-3">Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">Page</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Layout</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs text-gray-600">Server Component</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs text-gray-600">Client Component</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span className="text-xs text-gray-600">API Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">Utility</span>
          </div>
        </div>
      </div>
    </div>
  );
}
