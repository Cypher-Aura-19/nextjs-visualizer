# Next.js Codebase Visualizer

An interactive graph-based explorer for Next.js projects. Point it at any Next.js app, generate a dependency graph with the CLI, then load it into the web UI to visually explore components, routes, API endpoints, and their relationships — with AI-powered analysis on demand.

---

## What it does

You run the CLI against a Next.js project. It walks the file tree, classifies every file by type (page, layout, server component, client component, API route, hook, utility, etc.), resolves imports, and writes a `graph.json`. You drag that file into the web app and get an interactive force-directed graph.

Click a node → see its deps, what uses it, its exports. Run AI analysis → get complexity rating, coupling score, responsibilities, data flow, patterns, side effects, and refactor recommendations.

---

## Form Factor

The app is split into two packages:

```
nextjs_visualizer/
├── cli/          — Node.js CLI: walks & analyzes a Next.js project, outputs graph.json
└── web/          — Next.js 16 web app: loads graph.json and renders the interactive UI
```

**Web UI layout:**
- **Top bar** — search, map/explore toggle, new project
- **Left sidebar** (236px) — project name, nav, node type filters, summary stats
- **Center canvas** — ReactFlow graph with cluster bubbles, custom nodes, animated edges
- **Right panel** (336px) — slides open on node click: Details / Deps / AI Analysis tabs

Two view modes:
- **Explore mode** — default; shows the full graph with cluster grouping
- **Map mode** — full-screen minimap overview of the entire graph

---

## Design Decisions

### Static graph, not live parsing
The CLI generates a snapshot (`graph.json`) rather than parsing the project in-browser. This keeps the web app dependency-free from the filesystem and lets you share/save analysis snapshots. Tradeoff: the graph goes stale when code changes — you re-run the CLI.

### Reveal-all by default
`loadGraph` immediately reveals all nodes and edges. An earlier design only revealed nodes as you clicked ("exploration mode" with XP/achievements). That mechanic is still in the store but currently bypassed — it added friction without enough value for first-time users who just want to see the whole picture.

### ReactFlow over D3
ReactFlow handles node dragging, zooming, selection, and edge routing out of the box at the cost of being more opinionated. D3 would give more layout flexibility but require building all interactivity from scratch. For a graph with < 500 nodes, ReactFlow's performance is fine.

### Cluster bubbles
Nodes are grouped into clusters (by directory/feature area) using a custom `clusterGraph` function. Each cluster renders as a background `clusterBubble` node in ReactFlow, giving the graph spatial meaning without requiring manual layout tuning.

### AI on-demand, not automatic
AI analysis (Groq/Gemini) only runs when you explicitly click "Run Analysis" on a node. Auto-running it on every node select would burn API quota and add latency to every interaction. The result is cached per node in component state until you close the panel.

### Inline styles over Tailwind in SidePanel
SidePanel uses inline style objects throughout rather than Tailwind classes. This was a deliberate choice to keep all visual state (hover, selected, colors derived from node type) co-located with the logic rather than scattered across className strings. The rest of the app uses Tailwind.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | API routes for AI + static export for UI |
| Graph rendering | `@xyflow/react` v12 | Handles interaction, layout, zoom out of the box |
| Layout engine | `elkjs` + custom dagre | ELK for precise layered layouts, dagre for quick clustering |
| State | Zustand | Minimal boilerplate, no provider wrapping needed |
| AI | Groq (primary) + Gemini (fallback) | Groq is fast and cheap; Gemini as backup |
| Storage | Supabase | Graph persistence / sharing (optional) |
| Styling | Tailwind v4 + inline styles | Tailwind for layout, inline for dynamic node-color theming |
| CLI | TypeScript + ts-node | No build step for local usage |

---

## Tradeoffs

**Speed vs. accuracy in the CLI parser**
The CLI uses regex + AST heuristics to classify files rather than a full TypeScript compiler API. This is fast and works for ~95% of real Next.js projects, but can misclassify files that use unusual patterns (e.g. re-exporting a page from a non-`page.tsx` file).

**Single-file upload vs. directory scanning**
The web app accepts a single `graph.json` drag-and-drop. A directory picker or GitHub URL input would be more ergonomic but adds significant surface area (CORS, auth, rate limits, large-repo timeouts).

**No real-time updates**
The graph is a snapshot. There's no file watcher or WebSocket to push updates when code changes. For a dev tool used in exploratory sessions this is acceptable; for a persistent dashboard it would need a polling or watch mechanism.

**Client-side only state**
Graph state lives in Zustand (in-memory). Refreshing the page resets everything. Supabase integration exists in the codebase but graph persistence is not fully wired up in the current version.

---

## Consciously Deferred Scope

These were considered but intentionally left out of v1:

- **GitHub URL input** — paste a repo URL, auto-clone and analyze. Deferred because it needs a server-side sandbox and raises rate-limit / private-repo auth complexity.
- **Live file watching** — re-run CLI and hot-reload graph in the browser. Useful but requires a WebSocket server or polling endpoint.
- **Multi-project comparison** — load two graphs side by side to diff an architecture refactor. The store structure supports it (`fullGraph` could become an array) but the UI work is substantial.
- **Export to PNG/SVG** — ReactFlow supports this via `toSvg()` but needs careful handling of custom node renders.
- **Exploration gamification** — XP, achievements, and a "completion %" are fully implemented in the store but the reveal-all default bypasses them. Could be surfaced as an opt-in "challenge mode".
- **Monorepo support** — currently assumes a single Next.js app. Turborepo / Nx workspace graphs would need multi-root traversal in the CLI.

---

## Getting Started

### 1. Analyze your project (CLI)

```bash
cd cli
npm install
npx ts-node src/index.ts /path/to/your/nextjs-app --output ./output
```

This writes `output/graph.json`.

### 2. Run the web app

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), drag in your `graph.json`.

### Environment variables (`web/.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GITHUB_TOKEN=...
GROQ_API_KEY=...
GEMINI_API_KEY=...
```

### Deploy to Vercel

- Root directory: `web`
- Add all 5 env vars above in Vercel project settings
- Framework auto-detected as Next.js

---

## Project Structure

```
web/src/
├── app/
│   ├── page.tsx              — Main layout shell
│   ├── globals.css           — Tailwind + ReactFlow theme overrides
│   └── api/describe-node/    — AI analysis endpoint
├── components/
│   ├── SidePanel.tsx         — Right panel (Details / Deps / AI tabs)
│   ├── Toolbar.tsx           — Top bar
│   ├── UploadPanel.tsx       — Drag-and-drop landing screen
│   ├── graph/
│   │   ├── GraphCanvas.tsx   — Main ReactFlow canvas
│   │   ├── CustomNode.tsx    — File node renderer
│   │   ├── ClusterNode.tsx   — Cluster bubble renderer
│   │   └── FlowEdge.tsx      — Animated edge renderer
│   ├── explorer/
│   │   ├── ExplorerHUD.tsx   — Floating stats overlay
│   │   └── FullMapView.tsx   — Map mode view
│   └── layout/
│       └── LeftSidebar.tsx   — Filters + nav sidebar
├── store/
│   └── useExplorer.ts        — Zustand store (all graph state)
├── types/
│   └── graph.ts              — FileNode, GraphEdge, ProjectGraph types
└── lib/
    ├── clustering.ts         — Group nodes into clusters
    └── layout.ts             — ELK / dagre layout computation

cli/src/
├── index.ts      — CLI entry point
├── walker.ts     — File system traversal
├── classifier.ts — Node type classification
├── parser.ts     — Import/export extraction
├── resolver.ts   — Import path resolution
├── builder.ts    — Assembles the ProjectGraph
└── writer.ts     — Writes graph.json
```
