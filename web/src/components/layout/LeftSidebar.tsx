'use client';

import { useMemo } from 'react';
import { useExplorer } from '../../store/useExplorer';
import { NODE_COLORS, NODE_LABELS, NodeType } from '../../types/graph';
import { clusterGraph } from '../../lib/clustering';
import {
  RiBarChart2Line,
  RiShareLine,
  RiFileLine,
  RiRouteLine,
  RiPlugLine,
  RiSparklingLine,
  RiGitBranchLine,
  RiSettings3Line,
} from 'react-icons/ri';

const NAV_ITEMS = [
  { icon: RiBarChart2Line,  label: 'Overview',     id: 'overview' },
  { icon: RiShareLine,      label: 'Graph',         id: 'graph' },
  { icon: RiFileLine,       label: 'Files',         id: 'files' },
  { icon: RiRouteLine,      label: 'Routes',        id: 'routes' },
  { icon: RiPlugLine,       label: 'Dependencies',  id: 'dependencies' },
  { icon: RiSparklingLine,  label: 'AI Insights',   id: 'ai-insights' },
  { icon: RiGitBranchLine,  label: 'Compare',       id: 'compare' },
  { icon: RiSettings3Line,  label: 'Settings',      id: 'settings' },
];

const FILTER_TYPES: NodeType[] = [
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

function LeftSidebar() {
  const { fullGraph, activeFilters, toggleFilter } = useExplorer();

  const clusteredGraph = useMemo(() => {
    if (!fullGraph) return null;
    return clusterGraph(fullGraph);
  }, [fullGraph]);

  const projectName = fullGraph?.projectName || 'Project';
  const firstLetter = projectName.charAt(0).toUpperCase();
  const projectColor = clusteredGraph?.clusters[0]?.color || '#378ADD';

  const stats = useMemo(() => {
    if (!fullGraph) return { totalFiles: 0, relationships: 0, components: 0, routes: 0, apiEndpoints: 0 };
    return {
      totalFiles: fullGraph.totalFiles || fullGraph.nodes.length,
      relationships: fullGraph.edges.length,
      components: fullGraph.nodes.filter(n => n.type === 'client-component' || n.type === 'server-component').length,
      routes: fullGraph.nodes.filter(n => n.type === 'page').length,
      apiEndpoints: fullGraph.nodes.filter(n => n.type === 'api-route').length,
    };
  }, [fullGraph]);

  return (
    <div style={{ width: 236, height: '100%', backgroundColor: '#fff', borderRight: '1px solid #e9ecef', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', overflow: 'hidden', flexShrink: 0 }}>

      {/* Project header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f3f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, backgroundColor: projectColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
            {firstLetter}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{projectName}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3 }}>Next.js · {stats.totalFiles} files</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ padding: '8px 8px', borderBottom: '1px solid #f1f3f5' }}>
        {NAV_ITEMS.map(({ icon: IconComp, label, id }) => {
          const isActive = id === 'graph';
          return (
            <div
              key={id}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6, cursor: 'pointer', marginBottom: 1, backgroundColor: isActive ? '#eff6ff' : 'transparent', color: isActive ? '#2563eb' : '#64748b', fontWeight: isActive ? 500 : 400, fontSize: 13, transition: 'background 0.12s' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <IconComp size={15} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ padding: '12px 10px', borderBottom: '1px solid #f1f3f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Filters</span>
          {activeFilters.size > 0 && (
            <button onClick={() => { FILTER_TYPES.forEach(t => { if (activeFilters.has(t)) toggleFilter(t); }); }} style={{ fontSize: 11, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}>
              Reset
            </button>
          )}
        </div>

        {FILTER_TYPES.map(type => {
          const count = fullGraph?.nodes.filter(n => n.type === type).length ?? 0;
          if (count === 0) return null;
          const isActive = activeFilters.has(type);
          const isVisible = activeFilters.size === 0 || isActive;
          return (
            <div
              key={type}
              onClick={() => toggleFilter(type)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 5, cursor: 'pointer', marginBottom: 1, backgroundColor: isActive ? `${NODE_COLORS[type]}10` : 'transparent', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = isActive ? `${NODE_COLORS[type]}18` : '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = isActive ? `${NODE_COLORS[type]}10` : 'transparent'}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: NODE_COLORS[type], opacity: isVisible ? 1 : 0.25, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: isVisible ? '#0f172a' : '#94a3b8', flex: 1 }}>{NODE_LABELS[type]}</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 8, backgroundColor: isVisible ? `${NODE_COLORS[type]}14` : '#f3f4f6', color: isVisible ? NODE_COLORS[type] : '#94a3b8', minWidth: 18, textAlign: 'center' }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Analysis summary */}
      <div style={{ padding: '12px 10px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Summary</div>
        {[
          { label: 'Total Files', value: stats.totalFiles },
          { label: 'Relationships', value: stats.relationships },
          { label: 'Components', value: stats.components },
          { label: 'Pages', value: stats.routes },
          { label: 'API Routes', value: stats.apiEndpoints },
        ].map(({ label, value }, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 8px' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{value}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default LeftSidebar;
