'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useExplorer } from '../store/useExplorer';
import { NODE_COLORS, NODE_LABELS } from '../types/graph';

type TabType = 'details' | 'dependencies' | 'ai-insights';

interface AIAnalysis {
  summary: string;
  role: string;
  complexity: 'low' | 'medium' | 'high';
  complexityReason: string;
  responsibilities: string[];
  patterns: string[];
  dataFlow: string;
  sideEffects: string[];
  recommendations: string[];
  couplingScore: number;
  couplingReason: string;
}

// ── Inline SVG icons (all 16×16, stroke-based) ─────────────────────────────

const Icon = {
  File: () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L9 1z"/>
      <path d="M9 1v4h4"/>
      <path d="M6 8h4M6 11h2"/>
    </svg>
  ),
  Close: () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 3l10 10M13 3L3 13"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 8H3M7 4L3 8l4 4"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3l5 5-5 5"/>
    </svg>
  ),
  Focus: () => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="5"/>
      <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2"/>
    </svg>
  ),
  Sparkle: () => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1v3M8 12v3M1 8h3M12 8h3M3.5 3.5l2 2M10.5 10.5l2 2M3.5 12.5l2-2M10.5 5.5l2-2"/>
    </svg>
  ),
  Refresh: () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 2.5A7 7 0 1 0 14 9"/>
      <path d="M14 2.5V6h-3.5"/>
    </svg>
  ),
  Warning: () => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L1 14h14L8 2z"/>
      <path d="M8 7v3M8 12v.5"/>
    </svg>
  ),
  Zap: () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1L3 9h5l-1 6 7-8H9l1-6z"/>
    </svg>
  ),
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8l4 4 8-8"/>
    </svg>
  ),
  Code: () => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4L1 8l4 4M11 4l4 4-4 4M9 2l-2 12"/>
    </svg>
  ),
  GitBranch: () => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="3" r="1.5"/>
      <circle cx="5" cy="13" r="1.5"/>
      <circle cx="12" cy="6" r="1.5"/>
      <path d="M5 4.5v7M5 4.5C5 7 12 7.5 12 7.5"/>
    </svg>
  ),
  Flow: () => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2" width="4" height="3" rx="1"/>
      <rect x="11" y="11" width="4" height="3" rx="1"/>
      <rect x="6" y="6" width="4" height="3" rx="1"/>
      <path d="M5 3.5h1.5a1 1 0 0 1 1 1v1.5M10 8h1.5a1 1 0 0 1 1 1v1.5"/>
    </svg>
  ),
  Lightbulb: () => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 12h4M6.5 14h3"/>
      <path d="M8 2a4 4 0 0 1 2.83 6.83L10 10H6l-.83-1.17A4 4 0 0 1 8 2z"/>
    </svg>
  ),
} as const;

// ── Design tokens ────────────────────────────────────────────────────────────

const C = {
  border: '#f1f3f5',
  borderHover: '#d1d5db',
  text: '#0f172a',
  textSub: '#64748b',
  textMuted: '#94a3b8',
  bg: '#ffffff',
  bgSub: '#f8fafc',
  bgHover: '#f4f6f8',
};

// ── Primitives ───────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
      {children}
    </div>
  );
}

function Chip({ children, color = C.textSub, bg = C.bgSub }: { children: React.ReactNode; color?: string; bg?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, backgroundColor: bg, color, border: `1px solid ${color}22`, whiteSpace: 'nowrap', lineHeight: 1.6 }}>
      {children}
    </span>
  );
}

function NodeRow({ item, onClick }: { item: any; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, border: `1px solid ${hov ? C.borderHover : C.border}`, cursor: 'pointer', backgroundColor: C.bg, transition: 'border-color 0.12s', opacity: item.isRevealed === false ? 0.45 : 1 }}
    >
      <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: NODE_COLORS[item.node.type as keyof typeof NODE_COLORS] ?? C.textMuted, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.text, lineHeight: 1.3 }}>{item.node.label}</div>
        <div style={{ fontSize: 10, color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'DM Mono, monospace', marginTop: 1 }}>{item.node.filePath}</div>
      </div>
      <span style={{ color: C.textMuted, flexShrink: 0 }}><Icon.ChevronRight /></span>
    </div>
  );
}

function BulletItem({ text, color = C.textSub }: { text: string; color?: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, fontSize: 12, color, lineHeight: 1.55 }}>
      <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: color, flexShrink: 0, marginTop: 6 }} />
      <span>{text}</span>
    </div>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 5, borderRadius: 3, backgroundColor: C.border, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
    </div>
  );
}

function CouplingDots({ score }: { score: number }) {
  const s = Math.max(1, Math.min(10, score));
  const color = s <= 3 ? '#22c55e' : s <= 6 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: i < s ? color : C.border, transition: 'background 0.2s' }} />
        ))}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color }}>{s}/10</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
      <style>{`@keyframes shimmer{0%{opacity:1}50%{opacity:0.35}100%{opacity:1}}`}</style>
      {[72, 55, 85, 40, 65, 50].map((w, i) => (
        <div key={i} style={{ height: 12, width: `${w}%`, backgroundColor: C.bgSub, borderRadius: 4, animation: `shimmer 1.6s ease-in-out ${i * 0.08}s infinite` }} />
      ))}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', backgroundColor: C.bgSub, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ color: C.textMuted, display: 'flex', alignItems: 'center' }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.textSub }}>{title}</span>
      </div>
      <div style={{ padding: '14px 12px', backgroundColor: C.bg }}>
        {children}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function SidePanel() {
  const { fullGraph, revealedNodes, selectedNodeId, selectNode, exploreNode } = useExplorer();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [trackedNodeId, setTrackedNodeId] = useState<string | null>(selectedNodeId);

  useEffect(() => {
    if (selectedNodeId !== trackedNodeId) {
      setTrackedNodeId(selectedNodeId);
      setAiAnalysis(null);
      setAiError(null);
      setIsLoadingAI(false);
    }
  }, [selectedNodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedNode = useMemo(() => {
    if (!selectedNodeId || !fullGraph) return null;
    return fullGraph.nodes.find((n) => n.id === selectedNodeId) ?? null;
  }, [selectedNodeId, fullGraph]);

  const { usedByNodes, importsNodes } = useMemo(() => {
    if (!selectedNode || !fullGraph) return { usedByNodes: [], importsNodes: [] };
    const revealedIds = new Set(revealedNodes.map((n) => n.id));
    const usedBy = fullGraph.edges
      .filter((e) => e.target === selectedNode.id)
      .map((e) => { const n = fullGraph.nodes.find((x) => x.id === e.source); return n ? { node: n, edge: e, isRevealed: revealedIds.has(n.id) } : null; })
      .filter(Boolean) as any[];
    const imports = fullGraph.edges
      .filter((e) => e.source === selectedNode.id)
      .map((e) => { const n = fullGraph.nodes.find((x) => x.id === e.target); return n ? { node: n, edge: e, isRevealed: revealedIds.has(n.id) } : null; })
      .filter(Boolean) as any[];
    return { usedByNodes: usedBy, importsNodes: imports };
  }, [selectedNode, fullGraph, revealedNodes]);

  const runAI = async () => {
    if (!selectedNode || isLoadingAI) return;
    setIsLoadingAI(true);
    setAiError(null);
    setAiAnalysis(null);
    try {
      const res = await fetch('/api/describe-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: selectedNode.filePath,
          nodeType: selectedNode.type,
          exports: selectedNode.exports,
          connections: importsNodes.map((i: any) => i.node.label),
          usedBy: usedByNodes.map((i: any) => i.node.label),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.description || typeof data.description === 'string') throw new Error('Invalid response');
      setAiAnalysis(data.description as AIAnalysis);
    } catch (e: any) {
      setAiError(e.message ?? 'Analysis failed');
    } finally {
      setIsLoadingAI(false);
    }
  };

  if (!selectedNode) return null;

  const nc = NODE_COLORS[selectedNode.type] ?? '#94a3b8';
  const ext = selectedNode.filePath.split('.').pop()?.toUpperCase() ?? 'FILE';
  const TABS: { id: TabType; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'dependencies', label: 'Deps' },
    { id: 'ai-insights', label: 'AI Analysis' },
  ];

  return (
    <div
      style={{
        width: 336,
        height: '100%',
        backgroundColor: C.bg,
        borderLeft: `1px solid ${C.border}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        fontFamily: 'Inter, -apple-system, sans-serif',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ padding: '14px 14px 12px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: `${nc}12`, border: `1px solid ${nc}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: nc, flexShrink: 0 }}>
            <Icon.File />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.3, marginBottom: 2 }}>{selectedNode.label}</div>
            <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'DM Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 7 }} title={selectedNode.filePath}>{selectedNode.filePath}</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <Chip color={nc} bg={`${nc}12`}>{NODE_LABELS[selectedNode.type]}</Chip>
              <Chip>{ext}</Chip>
              {selectedNode.isClientComponent && <Chip color="#db2777" bg="#fdf2f8">Client</Chip>}
              {selectedNode.isServerComponent && <Chip color="#16a34a" bg="#f0fdf4">Server</Chip>}
            </div>
          </div>
          <button
            onClick={() => { selectNode(null); setAiAnalysis(null); setAiError(null); }}
            style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, flexShrink: 0 }}
          >
            <Icon.Close />
          </button>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, backgroundColor: C.bg, flexShrink: 0 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1,
              padding: '9px 4px',
              fontSize: 12,
              fontWeight: activeTab === t.id ? 600 : 400,
              color: activeTab === t.id ? C.text : C.textMuted,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === t.id ? `2px solid ${nc}` : '2px solid transparent',
              transition: 'all 0.12s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Scrollable Body ────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '14px',
          paddingBottom: 32,
          minHeight: 0,
        }}
      >
        {/* ── DETAILS ─────────────────────────────────────────────── */}
        {activeTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* File Info */}
            <Section icon={<Icon.File />} title="File Info">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  ['Type', ext],
                  ['Category', NODE_LABELS[selectedNode.type]],
                  ['Render', selectedNode.isClientComponent ? 'Client' : selectedNode.isServerComponent ? 'Server' : '—'],
                  ['Exports', selectedNode.exports.length ? String(selectedNode.exports.length) : 'None'],
                  ['Outgoing deps', String(importsNodes.length)],
                  ['Incoming deps', String(usedByNodes.length)],
                ].map(([k, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 5 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ fontSize: 12, color: C.textSub }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{v}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Exports */}
            {selectedNode.exports.length > 0 && (
              <Section icon={<Icon.Code />} title="Exported Symbols">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {selectedNode.exports.map((exp, i) => (
                    <div key={i} style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', padding: '3px 8px', borderRadius: 4, backgroundColor: `${nc}0d`, color: nc, border: `1px solid ${nc}22` }}>
                      {exp}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Used by */}
            {usedByNodes.length > 0 && (
              <Section icon={<Icon.ArrowLeft />} title={`Used By (${usedByNodes.length})`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {usedByNodes.slice(0, 6).map((item: any, i: number) => (
                    <NodeRow key={i} item={item} onClick={() => selectNode(item.node.id)} />
                  ))}
                  {usedByNodes.length > 6 && (
                    <div style={{ fontSize: 11, color: nc, paddingTop: 4, cursor: 'pointer' }}>
                      +{usedByNodes.length - 6} more
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => exploreNode(selectedNode.id)}
                style={{ width: '100%', padding: '9px 14px', fontSize: 12, fontWeight: 500, color: 'white', backgroundColor: nc, border: 'none', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}><Icon.Focus /></span>
                Focus Node
              </button>
              <button
                onClick={() => { setActiveTab('ai-insights'); if (!aiAnalysis && !isLoadingAI) runAI(); }}
                style={{ width: '100%', padding: '9px 14px', fontSize: 12, fontWeight: 500, color: '#4f46e5', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}><Icon.Sparkle /></span>
                Analyse with AI
              </button>
            </div>
          </div>
        )}

        {/* ── DEPENDENCIES ────────────────────────────────────────── */}
        {activeTab === 'dependencies' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { label: 'Out', value: importsNodes.length, color: '#6366f1' },
                { label: 'In', value: usedByNodes.length, color: '#10b981' },
                { label: 'Renders', value: importsNodes.filter((i: any) => i.edge.type === 'render').length, color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: 7, border: `1px solid ${C.border}`, backgroundColor: C.bg }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Imports */}
            <Section icon={<Icon.ArrowRight />} title={`Imports (${importsNodes.length})`}>
              {importsNodes.length === 0
                ? <span style={{ fontSize: 12, color: C.textMuted }}>No outgoing dependencies</span>
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {importsNodes.map((item: any, i: number) => (
                      <div
                        key={i}
                        onClick={() => selectNode(item.node.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7, border: `1px solid ${C.border}`, cursor: 'pointer', backgroundColor: C.bg, opacity: item.isRevealed ? 1 : 0.45 }}
                      >
                        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: NODE_COLORS[item.node.type as keyof typeof NODE_COLORS] ?? C.textMuted, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{item.node.label}</div>
                          <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
                            <Chip>{NODE_LABELS[item.node.type as keyof typeof NODE_LABELS]}</Chip>
                            <Chip
                              color={item.edge.type === 'render' ? '#16a34a' : item.edge.type === 'call' ? '#dc2626' : '#6366f1'}
                              bg={item.edge.type === 'render' ? '#f0fdf4' : item.edge.type === 'call' ? '#fef2f2' : '#eef2ff'}
                            >
                              {item.edge.type}
                            </Chip>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </Section>

            {/* Imported by */}
            <Section icon={<Icon.ArrowLeft />} title={`Imported By (${usedByNodes.length})`}>
              {usedByNodes.length === 0
                ? <span style={{ fontSize: 12, color: C.textMuted }}>Not used by any file</span>
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {usedByNodes.map((item: any, i: number) => (
                      <NodeRow key={i} item={item} onClick={() => selectNode(item.node.id)} />
                    ))}
                  </div>
                )
              }
            </Section>
          </div>
        )}

        {/* ── AI ANALYSIS ─────────────────────────────────────────── */}
        {activeTab === 'ai-insights' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Empty state */}
            {!aiAnalysis && !isLoadingAI && !aiError && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '40px 16px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                  <Icon.Sparkle />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>AI Code Analysis</div>
                  <div style={{ fontSize: 12, color: C.textSub, lineHeight: 1.6, maxWidth: 240 }}>
                    Deep technical breakdown — complexity, patterns, data flow, coupling, and recommendations.
                  </div>
                </div>
                <button
                  onClick={runAI}
                  style={{ padding: '10px 22px', fontSize: 13, fontWeight: 500, color: 'white', backgroundColor: '#4f46e5', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                >
                  Run Analysis
                </button>
              </div>
            )}

            {/* Loading */}
            {isLoadingAI && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <style>{`@keyframes ai-spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, backgroundColor: '#f8f9ff', border: `1px solid ${C.border}` }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #c7d2fe', borderTopColor: '#4f46e5', animation: 'ai-spin 0.7s linear infinite', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#4f46e5' }}>Analysing {selectedNode.label}…</span>
                </div>
                <Skeleton />
              </div>
            )}

            {/* Error */}
            {aiError && (
              <div style={{ padding: '12px', borderRadius: 8, backgroundColor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 500, color: '#b91c1c' }}>
                  <span style={{ display: 'flex', alignItems: 'center', color: '#b91c1c' }}><Icon.Warning /></span>
                  Analysis failed
                </div>
                <div style={{ fontSize: 11, color: '#991b1b' }}>{aiError}</div>
                <button
                  onClick={runAI}
                  style={{ alignSelf: 'flex-start', padding: '5px 12px', fontSize: 11, fontWeight: 500, color: '#b91c1c', background: 'white', border: '1px solid #fecaca', borderRadius: 5, cursor: 'pointer' }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Results */}
            {aiAnalysis && !isLoadingAI && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Summary */}
                <div style={{ padding: '12px', borderRadius: 8, backgroundColor: C.bgSub, border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Chip color="#4f46e5" bg="#eef2ff">{aiAnalysis.role}</Chip>
                    <button
                      onClick={runAI}
                      title="Re-analyse"
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.textMuted, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4 }}
                    >
                      <Icon.Refresh />
                      Refresh
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: C.textSub, lineHeight: 1.65, margin: 0 }}>{aiAnalysis.summary}</p>
                </div>

                {/* Metrics */}
                <Section icon={<Icon.GitBranch />} title="Metrics">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Complexity */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: C.textSub }}>Complexity</span>
                        <Chip
                          color={aiAnalysis.complexity === 'low' ? '#16a34a' : aiAnalysis.complexity === 'medium' ? '#d97706' : '#dc2626'}
                          bg={aiAnalysis.complexity === 'low' ? '#f0fdf4' : aiAnalysis.complexity === 'medium' ? '#fffbeb' : '#fef2f2'}
                        >
                          {aiAnalysis.complexity}
                        </Chip>
                      </div>
                      <ProgressBar
                        pct={aiAnalysis.complexity === 'low' ? 22 : aiAnalysis.complexity === 'medium' ? 58 : 90}
                        color={aiAnalysis.complexity === 'low' ? '#22c55e' : aiAnalysis.complexity === 'medium' ? '#f59e0b' : '#ef4444'}
                      />
                      {aiAnalysis.complexityReason && (
                        <p style={{ fontSize: 11, color: C.textMuted, marginTop: 6, margin: '6px 0 0', lineHeight: 1.5 }}>{aiAnalysis.complexityReason}</p>
                      )}
                    </div>

                    <div style={{ height: 1, backgroundColor: C.border }} />

                    {/* Coupling */}
                    <div>
                      <div style={{ fontSize: 11, color: C.textSub, marginBottom: 8 }}>Coupling</div>
                      <CouplingDots score={aiAnalysis.couplingScore} />
                      {aiAnalysis.couplingReason && (
                        <p style={{ fontSize: 11, color: C.textMuted, margin: '6px 0 0', lineHeight: 1.5 }}>{aiAnalysis.couplingReason}</p>
                      )}
                    </div>
                  </div>
                </Section>

                {/* Responsibilities */}
                {aiAnalysis.responsibilities?.length > 0 && (
                  <Section icon={<Icon.Check />} title="Responsibilities">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {aiAnalysis.responsibilities.map((r, i) => <BulletItem key={i} text={r} />)}
                    </div>
                  </Section>
                )}

                {/* Data flow */}
                {aiAnalysis.dataFlow && (
                  <Section icon={<Icon.Flow />} title="Data Flow">
                    <p style={{ fontSize: 12, color: C.textSub, lineHeight: 1.65, margin: 0 }}>{aiAnalysis.dataFlow}</p>
                  </Section>
                )}

                {/* Patterns */}
                {aiAnalysis.patterns?.length > 0 && (
                  <Section icon={<Icon.Code />} title="Patterns">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {aiAnalysis.patterns.map((p, i) => {
                        const [name, ...rest] = p.split(':');
                        return (
                          <div key={i} style={{ fontSize: 12, lineHeight: 1.5 }}>
                            <span style={{ fontWeight: 600, color: '#4f46e5' }}>{name.trim()}</span>
                            {rest.length > 0 && <span style={{ color: C.textSub }}> — {rest.join(':').trim()}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </Section>
                )}

                {/* Side effects */}
                {aiAnalysis.sideEffects?.length > 0 && (
                  <Section icon={<Icon.Zap />} title="Side Effects">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {aiAnalysis.sideEffects.map((s, i) => <BulletItem key={i} text={s} color="#92400e" />)}
                    </div>
                  </Section>
                )}

                {/* Recommendations */}
                {aiAnalysis.recommendations?.length > 0 && (
                  <Section icon={<Icon.Lightbulb />} title="Recommendations">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {aiAnalysis.recommendations.map((r, i) => <BulletItem key={i} text={r} color="#14532d" />)}
                    </div>
                  </Section>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
