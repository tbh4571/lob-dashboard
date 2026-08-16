# LOB Dashboard

Frontend for the Line of Business applications & components dashboard.

This app previously talked to an Express + tRPC BFF for its data (applications,
components, pipeline runs, schedules, Rebase/Repave actions, and role-based
auth). **The BFF has been removed for now** — the UI still renders, but every
page shows a "No backend connected" placeholder where data used to load. The
domain types the UI expects are kept in `apps/web/src/types.ts` as the shape
a future backend should serve.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite + TypeScript + MUI + Tailwind |
| Backend | *(removed — see above)* |

## Project structure

```
lob-dashboard/
├── apps/
│   └── web/                 # Vite React frontend
│       └── src/
│           ├── components/  # Layout, NoDataNotice
│           ├── lib/         # theme provider, status color helpers
│           ├── pages/       # Dashboard, Applications, Runs, detail pages
│           └── types.ts     # domain types (Application, Component, PipelineRun, ...)
├── vitest.config.ts
├── package.json
└── README.md
```

## Getting started

### Prerequisites

- Node.js 20+
- npm 10+ (bundled with Node)

### Install

```bash
npm install
```

### Run the app

```bash
npm run dev:web
# or: npx vite --config apps/web/vite.config.ts
```

Open **http://localhost:5173**.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:web` | Start the Vite frontend |
| `npm test` | Vitest unit tests (once) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Vitest with coverage |

There are currently no unit or e2e tests, since the only tests in this repo
previously covered the removed BFF routers.

## Reconnecting a backend

1. Stand up a server that implements the domain model in `apps/web/src/types.ts`.
2. Wire up data-fetching in each page (`DashboardPage`, `ApplicationsPage`,
   `ApplicationDetailPage`, `ComponentDetailPage`, `RunsPage`, `RunDetailPage`) —
   they currently render a static `NoDataNotice` where fetched data used to go.
3. Re-add auth/role handling if role-gated actions (Rebase / Repave) are needed
   again.
