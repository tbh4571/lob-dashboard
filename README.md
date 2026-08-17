# LOB Dashboard

Frontend for the Line of Business applications & components dashboard — tracks
CI (Rebase) and CD (Repave) pipeline runs, deployment schedules, and
environment health across a portfolio of applications and components.

**This is a fully mock-data-driven build.** There is no backend: all data
lives in `apps/web/src/lib/mockData.ts` and is served through a client-side
store (`apps/web/src/lib/store.tsx`) that simulates async pipeline-run
progression, schedule CRUD, and Rebase/Repave triggers in memory. The domain
types the UI expects — and that a real backend should eventually serve — are
defined in `apps/web/src/types.ts`.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite + TypeScript + MUI |
| Backend | *(none — mock data + in-memory store, see above)* |

## Features

- **Persona-based dashboards** — Executive, Developer, and Operations views
  (`apps/web/src/pages/dashboard/`), switchable from the header avatar menu.
  Role switching is a client-only convenience with no real auth.
- **Attention Queue** — a persona-agnostic, paginated table of failed CI/CD
  runs across all applications and components.
- **Applications & Components** — portfolio browsing with component/schedule
  counts, environment status, and per-component Rebase/Repave actions.
- **Rebases & Repaves** — full CI run history (`/rebases`) and a CD-only
  deployment view (`/repaves`), each with environment/status filters.
- **Schedules** — weekly/biweekly recurrence with automated (rebase + repave)
  or manual (rebase only) mode, pause/resume, and human-readable next-run
  calculation (`apps/web/src/lib/scheduleFormat.ts`).

## Project structure

```
lob-dashboard/
├── apps/
│   └── web/                    # Vite React frontend
│       └── src/
│           ├── components/     # Layout, AttentionQueue, charts, schedule dialog, ...
│           ├── lib/            # mock data, in-memory store, persona/theme providers
│           ├── pages/          # Dashboard, Applications, Runs, Deployments, detail pages
│           │   └── dashboard/  # Executive / Developer / Operations overview panels
│           └── types.ts        # domain types (Application, Component, PipelineRun, Schedule, ...)
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

## Running in a container (Podman)

The app builds to static assets and serves them from an unprivileged nginx
image (`nginxinc/nginx-unprivileged`) — no root user, listens on 8080, works
under rootless Podman and OpenShift-style restricted SCCs without changes.

```bash
podman build -t lob-dashboard -f Containerfile .
podman run --rm -p 8080:8080 lob-dashboard
```

Open **http://localhost:8080**. `nginx.conf` includes an SPA fallback
(`try_files ... /index.html`) so deep links (e.g. `/rebases/some-run-id`)
survive a hard refresh instead of 404ing at the web server.

## Wiring up a real backend

1. Stand up a server that implements the domain model in `apps/web/src/types.ts`.
2. Replace the mock reads/writes in `apps/web/src/lib/store.tsx` (`createSchedule`,
   `updateSchedule`, `toggleSchedule`, `triggerRebase`, `triggerRepave`, `listRuns`)
   with real API calls — the store's public interface is the integration seam;
   pages consume it via `useDataStore()` and shouldn't need to change.
3. Add polling (or swap in websockets/SSE) for live run/status updates in place
   of the simulated `setTimeout`-based progression.
4. Re-add real auth/role handling if role-gated actions (Rebase / Repave,
   production targeting) are needed beyond the current no-auth persona switcher.
