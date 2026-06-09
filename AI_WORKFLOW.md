# AI Workflow — Next.js Codebase Visualizer

How AI is used in this project, what it does, how the prompts are structured, and what was learned building it.

---

## Overview

AI is used for one specific feature: **on-demand code analysis of individual nodes** in the graph. When you select a file node in the UI and click "Run Analysis" (or "Analyse with AI" from the Details tab), the app sends a POST request to `/api/describe-node`. That endpoint calls an LLM, structured-parses the response, and returns a typed analysis object that the UI renders across several sections.

Everything else in the app — graph building, node classification, import resolution, layout — is deterministic code. AI is not used in the CLI, not used for search, not used for clustering.

---

## What the AI returns

The endpoint returns a structured JSON object with these fields:

```ts
interface AIAnalysis {
  summary: string;           // 2-3 sentence plain English description
  role: string;              // Short label: "UI Component", "Data Layer", etc.
  complexity: 'low' | 'medium' | 'high';
  complexityReason: string;  // One sentence explaining the rating
  responsibilities: string[];// Bullet list of what this file does
  patterns: string[];        // "Pattern name: description" pairs
  dataFlow: string;          // How data enters and leaves this file
  sideEffects: string[];     // External effects (API calls, mutations, etc.)
  recommendations: string[]; // Concrete refactor / improvement suggestions
  couplingScore: number;     // 1–10, how tightly coupled to other files
  couplingReason: string;    // One sentence explaining the score
}
```

The UI maps each field to a dedicated section in the AI Analysis tab of the side panel.

---

## The Prompt

The prompt is constructed in `/api/describe-node/route.ts`. It sends the LLM:

1. **The file path** — gives context about where it lives in the project
2. **The node type** — `page`, `server-component`, `client-component`, `api-route`, etc.
3. **Exported symbols** — what the file exports (from the CLI-parsed graph)
4. **Outgoing connections** — the names of files this file imports
5. **Incoming connections** — the names of files that import this file

The prompt instructs the model to respond **only with a JSON object** matching the schema above, with no markdown fences, no preamble. A strict JSON-only response format was chosen over asking for prose because the UI renders each field separately — if the model wraps the JSON in explanation text, the parse fails.

Example of what gets sent:

```
You are a senior software engineer analysing a Next.js codebase.

Analyse this file and respond with ONLY a valid JSON object — no markdown, no explanation.

File: src/components/post/PostHeader.tsx
Type: server-component
Exports: PostHeader, PostHeaderSkeleton
Imports: Avatar, formatDate, PostMeta, AuthorCard
Used by: PostPage

Return this exact shape:
{
  "summary": "...",
  "role": "...",
  "complexity": "low|medium|high",
  "complexityReason": "...",
  "responsibilities": ["..."],
  "patterns": ["PatternName: description"],
  "dataFlow": "...",
  "sideEffects": ["..."],
  "recommendations": ["..."],
  "couplingScore": 1-10,
  "couplingReason": "..."
}
```

---

## Model Selection

**Primary: Groq (llama3-70b-8192)**
Groq was chosen because it is extremely fast (sub-2s for most responses) and the Llama 3 70B model produces structured JSON reliably. For a dev tool where you're clicking through many nodes, slow AI responses break the flow completely.

**Fallback: Gemini (gemini-1.5-flash)**
If the Groq API key is missing or the request fails, the endpoint falls back to Gemini Flash. Flash is lighter and cheaper than Pro while still handling structured JSON extraction well.

The fallback logic is:
```
if (GROQ_API_KEY) → try Groq first
if Groq fails or no key → try Gemini
if both fail → return error to client
```

---

## Parsing & Error Handling

LLMs don't always return clean JSON even when instructed to. The endpoint handles:

- **Markdown fences** — strips ` ```json ` / ` ``` ` wrappers if present
- **Trailing commas** — some models emit them; stripped with a regex before `JSON.parse`
- **Wrong schema shape** — if required fields are missing, the endpoint throws and the client shows a retry prompt rather than rendering a broken UI

The client (`SidePanel.tsx`) also validates the parsed response:
```ts
if (!data.description || typeof data.description === 'string') {
  throw new Error('Invalid response');
}
```
This catches cases where the model returns a prose string instead of a JSON object.

---

## What Worked Well

**Structured output with explicit schema in the prompt**
Giving the model the exact JSON key names and types in the prompt produces dramatically more consistent output than asking for "a structured analysis". When the schema is spelled out, the model rarely invents extra keys or omits required ones.

**Short, focused context window**
Rather than sending the full file source code (which can be thousands of lines), the prompt sends only metadata: path, type, imports, exports, and what uses it. This is:
- Faster (fewer tokens = lower latency)
- Cheaper (fewer input tokens)
- More reliable (the model focuses on architecture rather than getting distracted by implementation details)

The tradeoff is that the AI cannot see the actual code, so it can't catch implementation bugs — but that's not the goal. The goal is architectural understanding.

**Groq's speed changes the UX**
At sub-2 seconds, the analysis feels almost instant. With a slower model (GPT-4 at 8-15 seconds), users would abandon the feature after the first wait. Speed here is a product requirement, not just a nice-to-have.

---

## What Didn't Work / Learned the Hard Way

**Asking for prose first, then JSON**
Early prompt versions said "Explain this component, then return your analysis as JSON." The model would write 3 paragraphs then a JSON block. The client had to strip the prose. Moving to "respond ONLY with JSON" eliminated this entirely.

**Using `complexity` as a 0-100 score**
An early version returned `complexityScore: 0-100`. The model was inconsistent — sometimes it returned 75 for a trivial utility file, 60 for a deeply nested component. Constraining to `'low' | 'medium' | 'high'` with a required reason sentence produced far more consistent and useful results.

**Trying to analyse file contents client-side**
A proof-of-concept tried to read file contents via a GitHub API call and include them in the prompt. This was slow (extra API call), fragile (private repos, rate limits), and the context size ballooned for large files. The metadata-only approach is more robust and just as useful for architectural analysis.

**Per-node caching**
Results are cached in React state for the lifetime of the panel. If you close the side panel and reopen it, the analysis re-runs. A future improvement would be persisting results to localStorage or Supabase keyed by `nodeId + filePath hash` so repeated sessions don't re-burn API calls for the same files.

---

## AI Feature Map

| Feature | AI used? | How |
|---|---|---|
| Graph generation (CLI) | ❌ No | Deterministic AST/regex parsing |
| Node type classification | ❌ No | Rule-based classifier |
| Import resolution | ❌ No | Path resolution algorithm |
| Search & filter | ❌ No | Client-side string matching |
| Cluster grouping | ❌ No | Directory-based heuristic |
| Node analysis (Summary, Role) | ✅ Yes | Groq/Gemini structured prompt |
| Complexity & coupling scores | ✅ Yes | Groq/Gemini structured prompt |
| Responsibilities & patterns | ✅ Yes | Groq/Gemini structured prompt |
| Refactor recommendations | ✅ Yes | Groq/Gemini structured prompt |

---

## Future AI Directions

- **Batch analysis** — analyse all nodes in a project at once, store results, surface a project-level health report
- **Cross-node insights** — "these 4 components have high coupling, consider extracting a shared context"
- **Natural language graph queries** — "show me all server components that call an external API"
- **Change impact prediction** — given a git diff, highlight which downstream nodes are likely affected
