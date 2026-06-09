'use client';

import { useState } from 'react';
import { useGraph } from '../store/useGraph';
import type { NodeType } from '../types/graph';

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
];

type ViewMode = 'overview' | 'graph' | 'files' | 'components' | 'routes' | 'dependencies' | 'insights' | 'compare' | 'settings';

export default function Sidebar() {
  const { graph, activeFilters, toggleFilter } = useGraph();
  const [activeView, setActiveView] = useState<ViewMode>('graph');

  if (!graph) return null;

  const getCount = (type: NodeType) => {
    return graph.nodes.filter((n) => n.type === type).length;
  };

  const resetFilters = () => {
    allNodeTypes.forEach(type => {
      if (!activeFilters.has(type)) {
        toggleFilter(type);
      }
    });
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Project Header */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>Codebase Visualizer</h2>
        </div>

        {/* Project Dropdown */}
        <button className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group border border-gray-200">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <svg className="w-5 h-5 shrink-0" style={{ color: '#667EEA' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>Blog Starter</p>
              <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Next.js 14 · {graph.totalFiles} files</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-3 py-3 space-y-0.5">
          <button 
            onClick={() => setActiveView('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'overview' 
                ? 'bg-indigo-50' 
                : 'hover:bg-gray-50'
            }`}
            style={{ 
              color: activeView === 'overview' ? '#667EEA' : '#6B7280',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Overview</span>
          </button>
          
          <button 
            onClick={() => setActiveView('graph')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'graph' 
                ? 'bg-indigo-50' 
                : 'hover:bg-gray-50'
            }`}
            style={{ 
              color: activeView === 'graph' ? '#667EEA' : '#6B7280',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Graph</span>
          </button>
          
          <button 
            onClick={() => setActiveView('files')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'files' 
                ? 'bg-indigo-50' 
                : 'hover:bg-gray-50'
            }`}
            style={{ 
              color: activeView === 'files' ? '#667EEA' : '#6B7280',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Files</span>
          </button>

          <button 
            onClick={() => setActiveView('components')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'components' 
                ? 'bg-indigo-50' 
                : 'hover:bg-gray-50'
            }`}
            style={{ 
              color: activeView === 'components' ? '#667EEA' : '#6B7280',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
            <span>Components</span>
          </button>

          <button 
            onClick={() => setActiveView('routes')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'routes' 
                ? 'bg-indigo-50' 
                : 'hover:bg-gray-50'
            }`}
            style={{ 
              color: activeView === 'routes' ? '#667EEA' : '#6B7280',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>Routes</span>
          </button>

          <button 
            onClick={() => setActiveView('dependencies')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'dependencies' 
                ? 'bg-indigo-50' 
                : 'hover:bg-gray-50'
            }`}
            style={{ 
              color: activeView === 'dependencies' ? '#667EEA' : '#6B7280',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Dependencies</span>
          </button>

          <button 
            onClick={() => setActiveView('insights')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'insights' 
                ? 'bg-indigo-50' 
                : 'hover:bg-gray-50'
            }`}
            style={{ 
              color: activeView === 'insights' ? '#667EEA' : '#6B7280',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>AI Insights</span>
          </button>

          <button 
            onClick={() => setActiveView('compare')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'compare' 
                ? 'bg-indigo-50' 
                : 'hover:bg-gray-50'
            }`}
            style={{ 
              color: activeView === 'compare' ? '#667EEA' : '#6B7280',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Compare</span>
          </button>

          <button 
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'settings' 
                ? 'bg-indigo-50' 
                : 'hover:bg-gray-50'
            }`}
            style={{ 
              color: activeView === 'settings' ? '#667EEA' : '#6B7280',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </button>
        </nav>


        {/* Filters Section */}
        <div className="px-3 py-4 border-t border-gray-100 mt-2">
          <div className="flex items-center justify-between mb-3 px-3">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
              Filters
            </h3>
            <button 
              onClick={resetFilters}
              className="text-xs font-medium transition-colors"
              style={{ color: '#667EEA', fontFamily: 'Inter, sans-serif' }}
            >
              Reset
            </button>
          </div>
          <div className="space-y-1">
            {getCount('page') > 0 && (
              <button
                onClick={() => toggleFilter('page')}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${activeFilters.has('page') ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <span className={`font-medium ${activeFilters.has('page') ? 'text-gray-900' : 'text-gray-500'}`}>Pages</span>
                </div>
                <span className="text-xs font-semibold text-gray-500">{getCount('page')}</span>
              </button>
            )}

            {getCount('layout') > 0 && (
              <button
                onClick={() => toggleFilter('layout')}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${activeFilters.has('layout') ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className={`font-medium ${activeFilters.has('layout') ? 'text-gray-900' : 'text-gray-500'}`}>Layouts</span>
                </div>
                <span className="text-xs font-semibold text-gray-500">{getCount('layout')}</span>
              </button>
            )}

            {getCount('server-component') > 0 && (
              <button
                onClick={() => toggleFilter('server-component')}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${activeFilters.has('server-component') ? 'bg-orange-500' : 'bg-gray-300'}`} />
                  <span className={`font-medium ${activeFilters.has('server-component') ? 'text-gray-900' : 'text-gray-500'}`}>Server Components</span>
                </div>
                <span className="text-xs font-semibold text-gray-500">{getCount('server-component')}</span>
              </button>
            )}


            {getCount('client-component') > 0 && (
              <button
                onClick={() => toggleFilter('client-component')}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${activeFilters.has('client-component') ? 'bg-purple-500' : 'bg-gray-300'}`} />
                  <span className={`font-medium ${activeFilters.has('client-component') ? 'text-gray-900' : 'text-gray-500'}`}>Client Components</span>
                </div>
                <span className="text-xs font-semibold text-gray-500">{getCount('client-component')}</span>
              </button>
            )}

            {getCount('api-route') > 0 && (
              <button
                onClick={() => toggleFilter('api-route')}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${activeFilters.has('api-route') ? 'bg-cyan-500' : 'bg-gray-300'}`} />
                  <span className={`font-medium ${activeFilters.has('api-route') ? 'text-gray-900' : 'text-gray-500'}`}>API Routes</span>
                </div>
                <span className="text-xs font-semibold text-gray-500">{getCount('api-route')}</span>
              </button>
            )}

            {getCount('utility') > 0 && (
              <button
                onClick={() => toggleFilter('utility')}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${activeFilters.has('utility') ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                  <span className={`font-medium ${activeFilters.has('utility') ? 'text-gray-900' : 'text-gray-500'}`}>Utilities</span>
                </div>
                <span className="text-xs font-semibold text-gray-500">{getCount('utility')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Analysis Summary Section */}
        <div className="px-3 py-4 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3 px-3" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
            Analysis Summary
          </h3>
          <div className="space-y-2.5 text-sm px-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Files</span>
              <span className="font-semibold text-gray-900">{graph.totalFiles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Relationships</span>
              <span className="font-semibold text-gray-900">{graph.edges.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Components</span>
              <span className="font-semibold text-gray-900">
                {getCount('server-component') + getCount('client-component')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Routes</span>
              <span className="font-semibold text-gray-900">{getCount('page')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">API Endpoints</span>
              <span className="font-semibold text-gray-900">{getCount('api-route')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Section (Bottom) */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors group">
          <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 relative">
            <span className="text-white text-sm font-bold">N</span>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-gray-900">Noman</p>
            <p className="text-xs text-gray-500">Pro Plan</p>
          </div>
          <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
