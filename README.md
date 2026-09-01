# Fleet Transition Planner — Starter

A deliberately separated React/Fastify web application for the Fleet Transition Planner.

## Architecture

```text
Browser / client                     Server
────────────────────────────────────────────────────
React + Vite                         Fastify
React Three Fiber                    Zod / API validation
Zustand                              Drizzle
TanStack Query                       PostgreSQL
ECharts
        │
        │ HTTP / JSON
        └──────────────────────────►
```

Fleet calculations are plain TypeScript modules inside the client application:

```text
apps/client/src/domain/fleet/
├── types.ts
├── calculateTransitionPlan.ts
├── calculateTransitionPlan.test.ts
└── index.ts
```

They are separated from React components so the business logic stays easy to understand and test, but they are not a separate package or service.

## Project structure

```text
fleet-transition-planner/
├── apps/
│   ├── client/
│   │   └── src/
│   │       ├── components/
│   │       ├── domain/
│   │       │   └── fleet/
│   │       ├── store/
│   │       └── main.tsx
│   │
│   └── server/
│       └── src/
│           ├── db/
│           ├── app.ts
│           └── index.ts
│
├── package.json
└── pnpm-workspace.yaml
```

Responsibilities are intentionally straightforward:

- **Client:** interactive simulation, 3D rendering, charts, UI state, and scenario editing.
- **Server:** persistence, database access, API validation, and future external integrations.
- **`client/src/domain/fleet`:** pure fleet calculation/domain logic used by the client. No React, Three.js, HTTP, or database code.

## Included

- React + Vite + TypeScript
- Fastify backend
- React Three Fiber + Drei + Three.js
- Zustand and TanStack Query
- ECharts
- Tailwind CSS
- PostgreSQL + Drizzle scaffold
- Pure TypeScript fleet calculation modules
- Basic 3D depot and transition timeline
- Real calculation, client-component, and Fastify tests

The starter formulas are intentionally placeholders. Replace them with the partner's actual fleet, cost, emissions, charger, and power rules when the full specification is available.

## Requirements

- Node.js 22+
- pnpm 11+
- PostgreSQL only once persistence is used

## Install

```bash
pnpm install
```

If pnpm reports ignored dependency build scripts, review them with:

```bash
pnpm approve-builds
```

Approve only scripts you understand and intend to trust.

## Development

Run client and server together:

```bash
pnpm dev
```

Or separately:

```bash
pnpm dev:client
pnpm dev:server
```

- Client: http://localhost:5173
- API: http://localhost:3001
- Health: http://localhost:3001/health

## Verification

Run:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Or all checks together:

```bash
pnpm verify
```

The tests are real rather than being hidden with a no-tests-success flag:

- Client domain test: transition calculation behavior
- Client component test: vehicle transition-year editing
- Server test: Fastify health route through `app.inject()` without opening a port

## Why calculation code is still its own folder

The calculation code is separated logically, not operationally.

This is useful:

```ts
const result = calculateTransitionPlan(scenario);
```

because React components should not contain cost, emissions, charging, and payback formulas.

But a separate workspace package would add build and dependency complexity without a concrete benefit for this single web application.

## Why the server is split into `app.ts` and `index.ts`

`app.ts` constructs the Fastify application. `index.ts` is only the process entry point that opens the network port.

This allows tests to exercise the server using Fastify's in-process `app.inject()` API without starting a real server.

## Database

Copy:

```bash
cp apps/server/.env.example apps/server/.env
```

Set `DATABASE_URL`, then:

```bash
pnpm --filter @fleet/server db:generate
pnpm --filter @fleet/server db:migrate
```

The demo UI does not require the database yet.

## Recommended next steps

1. Replace sample vehicles with partner data.
2. Define exact financial, emissions, and charging formulas with the industry mentor.
3. Persist fleets, depots, and scenarios in PostgreSQL.
4. Model scenario-specific transition years separately from base vehicle records.
5. Add Scenario A / Scenario B comparison.
6. Replace primitive boxes with GLB vehicle, charger, and depot assets.
7. Add Web Workers only if profiling proves the simulation is expensive enough to justify them.

## Responsive layout policy

The UI is designed so panels are never hidden, clipped, or collapsed because of viewport width:

- narrow screens stack panels vertically;
- medium screens can place the two sidebar panels side by side;
- wide screens use the client/server-dashboard style two-column layout;
- grid children use `min-width: 0` so charts and 3D canvases cannot force horizontal overflow;
- vehicle rows and timeline headers wrap instead of overflowing;
- form controls become full-width when space is tight;
- the 3D viewport and chart use `clamp()` rather than fixed pixel heights;
- ECharts uses a scrollable legend and confined tooltips on narrow layouts.

On a small screen the page may scroll vertically; content is not squeezed to unreadable sizes just to force the entire application into one viewport.
