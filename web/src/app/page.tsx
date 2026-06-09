'use client';

import { useExplorer } from '../store/useExplorer';
import UploadPanel from '../components/UploadPanel';
import GraphCanvas from '../components/graph/GraphCanvas';
import SidePanel from '../components/SidePanel';
import Toolbar from '../components/Toolbar';
import LeftSidebar from '../components/layout/LeftSidebar';
import ExplorerHUD from '../components/explorer/ExplorerHUD';
import FullMapView from '../components/explorer/FullMapView';

export default function HomePage() {
  const { fullGraph, viewMode } = useExplorer();

  if (!fullGraph) {
    return <UploadPanel />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <Toolbar />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* LEFT SIDEBAR */}
        <LeftSidebar />

        {/* MAIN CANVAS AREA */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {viewMode === 'map' ? (
            <FullMapView />
          ) : (
            <>
              <GraphCanvas />
              <ExplorerHUD />
            </>
          )}
        </div>

        {/* RIGHT PANEL */}
        <SidePanel />
      </div>
    </div>
  );
}
