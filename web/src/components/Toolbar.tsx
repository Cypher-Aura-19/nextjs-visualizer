'use client';

import { useExplorer } from '../store/useExplorer';

export default function Toolbar() {
  const { fullGraph, searchQuery, setSearchQuery, viewMode, setViewMode } = useExplorer();

  if (!fullGraph) return null;

  return (
    <div
      style={{
        height: '56px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        flexShrink: 0,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* ── LEFT: Logo / App name ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
          minWidth: '180px',
        }}
      >
        {/* Graph icon */}
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#378ADD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="3" cy="8" r="2" fill="white" />
            <circle cx="13" cy="3" r="2" fill="white" />
            <circle cx="13" cy="13" r="2" fill="white" />
            <line x1="5" y1="8" x2="11" y2="4" stroke="white" strokeWidth="1.5" />
            <line x1="5" y1="8" x2="11" y2="12" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>

        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#111827',
            whiteSpace: 'nowrap',
          }}
        >
          Codebase Visualizer
        </span>
      </div>

      {/* ── CENTER: Search ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '400px',
          }}
        >
          {/* Search icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="text"
            placeholder="Search files, components…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '34px',
              paddingLeft: '32px',
              paddingRight: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#111827',
              backgroundColor: '#f9fafb',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#378ADD';
              e.currentTarget.style.backgroundColor = 'white';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
          />
        </div>
      </div>

      {/* ── RIGHT: Map toggle · Settings · New project ──────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
          minWidth: '180px',
          justifyContent: 'flex-end',
        }}
      >
        {/* Map view toggle */}
        <button
          onClick={() => setViewMode(viewMode === 'map' ? 'explore' : 'map')}
          title={viewMode === 'map' ? 'Switch to Explore' : 'Switch to Map view'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            border: '1px solid',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s',
            ...(viewMode === 'map'
              ? {
                  backgroundColor: '#E6F1FB',
                  borderColor: '#378ADD',
                  color: '#185FA5',
                }
              : {
                  backgroundColor: 'white',
                  borderColor: '#e5e7eb',
                  color: '#374151',
                }),
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
          </svg>
          Map
        </button>

        {/* Settings icon button */}
        <button
          title="Settings"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            backgroundColor: 'white',
            cursor: 'pointer',
            color: '#6b7280',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.color = '#111827';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        {/* + New project button */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 12px',
            backgroundColor: '#378ADD',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2b6cb0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#378ADD';
          }}
          onClick={() => {
            // Reset to upload screen — handled via store if needed
            window.location.reload();
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New project
        </button>
      </div>
    </div>
  );
}
