# Next.js Codebase Visualizer

An interactive graph-based explorer for Next.js projects. Run the CLI against any Next.js app to generate a dependency graph, then load it into the web UI to visually explore components, routes, API endpoints, and their relationships — with AI-powered analysis on demand.

---

## How It Works

This tool has three main phases: **CLI Analysis**, **Web Visualization**, and **AI Analysis**. Here's what happens behind the scenes.

### Phase 1: CLI Analysis (Generating the Graph)

When you run the CLI, it analyzes your Next.js project and creates a complete dependency graph saved as `graph.json`.

**Step-by-step:**

1. **Walk the file tree** (`walker.ts`)
   - Recursively scans your project directory
   - Finds all `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` files
   - Skips `node_modules`, `.next`, and other ignored folders

2. **Classify every file** (`classifier.ts`)
   - Determines the role of each file based on its path and structure
   - Types include: `page`, `layout`, `component`, `api-route`, `hook`, `util`, `config`, `middleware`, etc.
   - Uses file location patterns (e.g., `app/**/page.tsx` → page route)

3. **Extract imports and exports** (`parser.ts`)
   - Reads each file's source code
   - Uses regex to find all `import` and `export` statements
   - Captures both named imports (`import { Button }`) and default imports (`import Button`)
   - Tracks what each file exports (components, functions, types)

4. **Resolve import paths** (`resolver.ts`)
   - Converts relative imports (`../../components/Button`) to absolute file paths
   - Handles Next.js aliases like `@/components` → `src/components`
   - Resolves npm packages and marks them as external dependencies
   - Builds the actual connections between files

5. **Build the graph** (`builder.ts`)
   - Creates a `ProjectGraph` object with:
     - **nodes**: array of every file with metadata (id, path, type, imports, exports)
     - **edges**: array of connections showing which files import which
     - **stats**: total counts by node type
   - Assigns unique IDs to each file

6. **Write to disk** (`writer.ts`)
   - Serializes the graph as `graph.json`
   - This JSON file contains the complete dependency map

**Output:** A single `graph.json` file that captures your entire project structure.

---

### Phase 2: Web Visualization (Rendering the Graph)

When you upload `graph.json` to the web app, it transforms the raw data into an interactive visual graph.

**Step-by-step:**

1. **Upload** (`UploadPanel.tsx`)
   - User drags `graph.json` into the landing screen
   - File is parsed and validated as JSON

2. **Store in global state** (`useExplorer.ts` — Zustand store)
   - Parsed graph is saved in the app's global state
   - All components can now access the graph data
   - State includes: nodes, edges, clusters, filters, selected node, etc.

3. **Cluster the nodes** (`clustering.ts`)
   - Groups files by their directory path
   - Example: all files in `src/components/` become one cluster
   - Each cluster gets a background "bubble" node for visual grouping

4. **Compute the layout** (`elkLayout.ts` + `dagre`)
   - Uses **ELK** (Eclipse Layout Kernel) to position nodes automatically
   - Algorithm: hierarchical top-down layout with clustering
   - Assigns (x, y) coordinates to every node and cluster
   - Routes edges between nodes with smooth curves

5. **Render with ReactFlow** (`GraphCanvas.tsx`)
   - ReactFlow is the rendering engine — handles zoom, pan, drag, selection
   - Custom node components:
     - `CustomNode.tsx` — renders each file as a colored box (color = file type)
     - `ClusterNode.tsx` — renders directory bubbles as transparent backgrounds
   - Custom edge component:
     - `FlowEdge.tsx` — animated lines showing import relationships
   - User can click nodes to select them, drag to reposition, zoom/pan to explore

6. **User interaction**
   - **Click a node** → `SidePanel.tsx` opens on the right
   - **Details tab** — shows file path, type, line count, imports/exports
   - **Dependencies tab** — lists all incoming and outgoing edges
   - **AI Analysis tab** — initially empty, shows "Run Analysis" button

**Rendering Stack:**
- **@xyflow/react** — graph visualization library
- **elkjs** — automatic layout algorithm
- **Zustand** — state management (stores graph + UI state)
- **Tailwind CSS v4** — styling

---

### Phase 3: AI Analysis (Understanding a Node)

When you click "Run Analysis" in the AI tab, the app sends the node's data to an AI model to get a structured description.

**Step-by-step:**

1. **Trigger analysis** (button click in `SidePanel.tsx`)
   - User clicks "Run Analysis" on a selected node
   - Frontend calls `POST /api/describe-node` with the node's data

2. **API route receives request** (`app/api/describe-node/route.ts`)
   - Next.js API route handler processes the request
   - Extracts: file path, type, source code, imports, exports

3. **Construct the prompt**
   - Builds a structured prompt asking the AI to analyze the file
   - Includes the node's actual source code (first 1500 characters if too long)
   - Requests JSON output with specific fields:
     - `responsibilities` — what this file does
     - `dataFlow` — where data comes from and goes to
     - `patterns` — React patterns, architectural patterns used
     - `sideEffects` — mutations, API calls, side effects
     - `recommendations` — improvements, refactors, best practices

4. **Call AI model** (Groq API — primary)
   - Sends prompt to **Groq** with model `llama3-70b-8192`
   - Groq is extremely fast (~1-2 seconds for analysis)
   - **Fallback:** if Groq fails or key is missing, tries **Gemini Flash** (`gemini-1.5-flash-latest`)
   - Temperature set low (0.2) for consistent structured output

5. **Parse the response** (`AI_WORKFLOW.md` details)
   - AI returns JSON wrapped in markdown code fences
   - Parser strips markdown formatting (`'''json` blocks)
   - Handles common errors: trailing commas, missing brackets
   - Validates required fields

6. **Return to frontend**
   - API route sends parsed JSON back to `SidePanel.tsx`
   - Component renders each section:
     - **Responsibilities** — bullet list of main duties
     - **Data Flow** — inputs/outputs diagram
     - **Patterns** — detected patterns with descriptions
     - **Side Effects** — list of mutations/effects
     - **Recommendations** — suggestions for improvement

**AI Stack:**
- **Groq API** (primary) — ultra-fast LLM inference (`llama3-70b-8192`)
- **Gemini API** (fallback) — Google's `gemini-1.5-flash-latest` model
- **Structured JSON prompts** — forces consistent output format
- **Error-tolerant parsing** — handles malformed JSON gracefully

---

### Complete Data Flow

```
CLI Phase:
  Source Code → walker → classifier → parser → resolver → builder → writer → graph.json

Web Phase:
  graph.json → Upload → Zustand store → clusterGraph → elkLayout → ReactFlow → Visual Graph

AI Phase:
  Click node → POST /api/describe-node → Build prompt → Groq API → Parse JSON → Render in SidePanel
```

---

### Tech Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| **CLI** | TypeScript + ts-node | Static analysis and graph generation |
| **Web Framework** | Next.js 16 (App Router) | React server + client components |
| **Graph Rendering** | @xyflow/react v12 | Interactive node graph UI |
| **Layout Engine** | elkjs + dagre | Automatic graph layout algorithm |
| **State Management** | Zustand | Global app state (graph, filters, selection) |
| **AI (Primary)** | Groq API | Fast LLM inference (`llama3-70b-8192`) |
| **AI (Fallback)** | Gemini Flash | Google's lightweight model |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework |
| **Storage** | Supabase (optional) | Database for saving graphs (not fully implemented) |

---

### What Happens When You...

**Upload a graph file:**
1. JSON is parsed and validated
2. Stored in Zustand state
3. Nodes are clustered by directory
4. ELK computes positions
5. ReactFlow renders the graph

**Click a node:**
1. Node is selected in state
2. SidePanel opens on the right
3. Details and Dependencies tabs populate immediately
4. AI Analysis tab shows "Run Analysis" button

**Run AI analysis:**
1. API route receives node data
2. Prompt is constructed with source code
3. Groq API processes the request (~1-2 seconds)
4. Response is parsed and validated
5. Results render in the AI Analysis tab

**Filter by node type:**
1. Toggle filter in LeftSidebar
2. Zustand state updates
3. ReactFlow re-renders with filtered nodes
4. Hidden nodes fade out or disappear

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
