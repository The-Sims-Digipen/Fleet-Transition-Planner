# Fleet Transition Planner — Starter

A starter monorepo for the browser-based **Fleet Transition Planner**.

## What is already included

- React + Vite + TypeScript
- React Three Fiber + Drei
- Zustand
- TanStack Query
- ECharts
- Tailwind CSS 4 (Vite plugin)
- Fastify backend
- PostgreSQL + Drizzle scaffold
- Shared TypeScript calculation engine
- Basic 3D depot
- Vehicle transition-year controls
- Editable assumptions
- Timeline/year scrubber
- Cost / emissions / EV count / peak power KPIs
- Cost chart
- Site-capacity warning

> The formulas are intentionally simple starter formulas. Replace them with the
> partner's real fleet, cost, emissions and charging rules once the full brief is provided.

## Architecture

```text
apps/
  web/        React application and 3D scene
  server/     Fastify API + database scaffold

packages/
  core/       Domain types and calculation engine
```

The important dependency direction is:

```text
Scenario + Assumptions
        |
        v
Calculation Engine
        |
        +------> Dashboard / Charts
        |
        +------> 3D Depot
        |
        +------> Timeline
```

The calculation engine does not import React, Three.js, Fastify or database code.

## Requirements

- Node.js 22+
- pnpm 10+
- PostgreSQL only when you start using persistence

## Start

```bash
pnpm install
pnpm dev
```

Then open:

```text
http://localhost:5173
```

The API starts at:

```text
http://localhost:3001
```

Test it with:

```text
http://localhost:3001/health
```

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

The starter does not require the database to render the demo.

## Recommended next steps

1. Replace sample vehicles with partner data.
2. Define exact financial and emissions formulas with the industry mentor.
3. Persist scenarios and fleets in PostgreSQL.
4. Add Scenario A / Scenario B comparison.
5. Replace primitive boxes with GLB vehicle/charger/depot assets.
6. Move the calculation engine to a Web Worker if real datasets become expensive.
7. Add authentication and organisation/depot ownership only when required.

## Dependency policy

The starter tracks the current stable npm `latest` release for its direct third-party dependencies as of 1 September 2026. Pre-release tags such as `next`, `beta`, `rc`, `canary`, and `experimental` are intentionally excluded.
