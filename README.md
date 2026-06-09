# Next.js Codebase Visualizer

An interactive graph-based explorer for Next.js projects. Run the CLI against any Next.js app to generate a dependency graph, then load it into the web UI to visually explore components, routes, API endpoints, and their relationships — with AI-powered analysis on demand.

---

## Requirements

- **Node.js** v18 or higher
- **npm** v9 or higher
- API keys for AI analysis (Groq or Gemini — optional but recommended)

---

## Installation & Setup

### 1. Clone the repo

```bash
git clone https://github.com/Cypher-Aura-19/nextjs-visualizer.git
cd nextjs-visualizer
```

---

### 2. Install — Web App

```bash
cd web
npm install
```

#### Create environment file

Create `web/.env.local` with the following keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GITHUB_TOKEN=your_github_token
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

> **Note:** `GROQ_API_KEY` or `GEMINI_API_KEY` is required for AI node analysis. The app works without them — AI features will just show an error when triggered.

#### Run the web app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run build    # production build
npm run start    # run production build
npm run lint     # lint check
```

---

### 3. Install — CLI

```bash
cd cli
npm install
```

#### Run the CLI

```bash
npx ts-node src/index.ts <path-to-nextjs-project> --output <output-folder>
```

**Example:**

```bash
npx ts-node src/index.ts ../my-next-app --output ./output
```

This will:
1. Walk the file tree of the target Next.js project
2. Classify every file (page, layout, component, API route, hook, utility, etc.)
3. Resolve all imports and build a dependency graph
4. Write `graph.json` to the output folder

```
✅ Analysis complete!
📄 Graph saved to: ./output/graph.json
```

Then drag `output/graph.json` into the web app at [http://localhost:3000](http://localhost:3000).

---

## Quick Start (both together)

```bash
# Terminal 1 — start the web app
cd web
npm install
npm run dev

# Terminal 2 — analyze a Next.js project
cd cli
npm install
npx ts-node src/index.ts /path/to/your/nextjs-app --output ./output
```

Then open [http://localhost:3000](http://localhost:3000) and drag in `cli/output/graph.json`.

---

## Demo

A sample graph JSON is included at `demo-output/graph.json`. Drag it straight into the web app to see the visualizer in action without running the CLI.

---

## Project Structure

```
nextjs-visualizer/
│
├── cli/                          — Node.js CLI tool
│   ├── src/
│   │   ├── index.ts              — Entry point (reads CLI args)
│   │   ├── walker.ts             — File system traversal
│   │   ├── classifier.ts         — Node type classification
│   │   ├── parser.ts             — Import/export extraction
│   │   ├── resolver.ts           — Import path resolution
│   │   ├── builder.ts            — Assembles the ProjectGraph
│   │   └── writer.ts             — Writes graph.json
│   ├── package.json
│   └── tsconfig.json
│
├── web/                          — Next.js 16 web app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          — Main layout shell
│   │   │   ├── globals.css       — Tailwind + ReactFlow theme
│   │   │   └── api/
│   │   │       └── describe-node/ — AI analysis API route
│   │   ├── components/
│   │   │   ├── SidePanel.tsx     — Right panel (Details/Deps/AI tabs)
│   │   │   ├── Toolbar.tsx       — Top bar (search, view toggle)
│   │   │   ├── UploadPanel.tsx   — Drag-and-drop landing screen
│   │   │   ├── graph/
│   │   │   │   ├── GraphCanvas.tsx   — Main ReactFlow canvas
│   │   │   │   ├── CustomNode.tsx    — File node renderer
│   │   │   │   ├── ClusterNode.tsx   — Cluster bubble renderer
│   │   │   │   └── FlowEdge.tsx      — Animated edge renderer
│   │   │   ├── explorer/
│   │   │   │   ├── ExplorerHUD.tsx   — Floating stats overlay
│   │   │   │   └── FullMapView.tsx   — Map mode view
│   │   │   └── layout/
│   │   │       └── LeftSidebar.tsx   — Filters + nav sidebar
│   │   ├── store/
│   │   │   └── useExplorer.ts    — Zustand global state
│   │   ├── types/
│   │   │   └── graph.ts          — FileNode, GraphEdge, ProjectGraph types
│   │   └── lib/
│   │       ├── clustering.ts     — Directory-based cluster grouping
│   │       └── layout.ts         — ELK / dagre layout computation
│   ├── .env.local                — ⚠️ Not committed — create this yourself
│   ├── package.json
│   └── tsconfig.json
│
├── demo-output/
│   └── graph.json                — Sample graph for testing
│
├── README.md
└── AI_WORKFLOW.md                — AI design decisions and workflow writeup
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Graph rendering | `@xyflow/react` v12 |
| Layout engine | `elkjs` + dagre |
| State management | Zustand |
| AI (primary) | Groq — `llama3-70b-8192` |
| AI (fallback) | Gemini Flash |
| Storage | Supabase (optional) |
| Styling | Tailwind CSS v4 + inline styles |
| CLI runtime | TypeScript + `ts-node` |

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `web`
4. Add all 5 environment variables from `.env.local`
5. Deploy — framework auto-detected as Next.js

---

## Form Factor & Design Decisions

### Architecture

The app is split into two packages — a CLI that generates a static `graph.json` snapshot, and a web app that renders it. This keeps the web app filesystem-free and lets you share/save analysis snapshots.

### UI Layout

- **Top bar** — search, explore/map view toggle, new project
- **Left sidebar** (236px) — project name, node type filters, summary stats
- **Center canvas** — ReactFlow graph with cluster bubbles, draggable nodes, animated edges
- **Right panel** (336px) — opens on node click: Details / Deps / AI Analysis tabs

Two view modes:
- **Explore mode** — full interactive graph with cluster grouping
- **Map mode** — full-screen minimap overview

### Key Design Choices

**Reveal-all by default** — All nodes are shown immediately on load. An earlier design revealed nodes progressively as you explored (with XP/achievements). That mechanic is still in the store but bypassed — it added friction for first-time users who just want to see the full picture.

**ReactFlow over D3** — ReactFlow handles node dragging, zooming, selection, and edge routing out of the box. Fine for graphs under ~500 nodes.

**Cluster bubbles** — Nodes are grouped into clusters by directory using a custom `clusterGraph` function. Each cluster renders as a background bubble node, giving the graph spatial meaning without manual layout tuning.

**AI on-demand** — Analysis only runs when explicitly triggered per node. Auto-running on every selection would burn API quota and break interaction flow. Results are cached in component state.

**Inline styles in SidePanel** — Dynamic colors are derived from node type at runtime. Co-locating style with logic (inline objects) is cleaner than scattered Tailwind classes for this pattern.

---

## Tradeoffs

**CLI uses heuristics, not full TS compiler API** — Fast and covers ~95% of real projects. Can misclassify unusual patterns (re-exported pages, non-standard file locations).

**Single-file upload only** — Accepts one `graph.json` drop. No GitHub URL input or directory picker — those add CORS, auth, and rate-limit complexity.

**No real-time updates** — Graph is a snapshot. No file watcher. Fine for exploratory sessions.

**In-memory state only** — Refreshing the page resets everything. Supabase is wired in but persistence isn't fully implemented.

---

## Deferred Features

- GitHub URL input (clone + analyze in one step)
- Live file watching with hot-reload
- Multi-project comparison (diff two graphs)
- Export to PNG/SVG
- Opt-in exploration gamification mode
- Monorepo / Turborepo support
