# Personal Health Dashboard

A modern web application that transforms raw pathology reports into a living health record — beautiful dashboard, trends, insights, and comparisons across time.

## Run & Operate

- `pnpm --filter @workspace/health-dashboard run dev` — run the health dashboard (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui
- Charts: Recharts
- Animations: Framer Motion
- Routing: Wouter
- Themes: next-themes (dark/light)
- Data: Static TypeScript data file (no backend)

## Where things live

- `artifacts/health-dashboard/src/` — all frontend source
- `artifacts/health-dashboard/src/data/healthData.ts` — all biomarker data (source of truth)
- `artifacts/health-dashboard/src/data/healthUtils.ts` — helper functions (status, trends, scores)
- `artifacts/health-dashboard/src/index.css` — theme tokens & CSS variables

## Architecture decisions

- Frontend-only: all data is static TypeScript (no backend, no database). Future sync can be added via Supabase.
- Data model: canonical biomarker format independent of lab (Orange Health, Tata 1mg, etc.)
- Health score computed client-side from biomarker reference ranges
- Dark/light theme via next-themes with CSS custom properties

## Product

Personal health dashboard for Nikhil Sati showing 4 pathology reports (2024–2026):
- Dashboard with health score, category summary cards, recent changes, timeline
- Trends page with animated line charts for every biomarker
- Category pages: Heart, Blood, Liver, Kidney, Vitamins, Thyroid, Diabetes, Inflammation, Hormones
- Reports list and detail view
- Insights engine: Improved / Stable / Needs Attention
- Compare two reports side-by-side
- Global search across all parameters

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always use `import.meta.env.BASE_URL` for route prefix (wouter base is set in App.tsx)
- Dark/light theme toggle is required — use next-themes ThemeProvider

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
