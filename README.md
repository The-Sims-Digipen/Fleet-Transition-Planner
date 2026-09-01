# Fleet Transition Planner

A web application for planning the transition of a vehicle fleet from diesel to electric. It includes an interactive 3D depot, vehicle transition scheduling, editable cost and energy assumptions, fleet cost and emissions calculations, power-capacity feedback, charts, and a year-by-year timeline.

## Development

Requirements:

- Node.js 22+
- pnpm 11+

Install dependencies:

```bash
pnpm install
```

Start the client and server:

```bash
pnpm dev
```

- Client: http://localhost:5173
- API: http://localhost:3001
- Health check: http://localhost:3001/health

Run verification:

```bash
pnpm verify
```

## Database

PostgreSQL is only required once persistence is used.

Copy the server environment file and set `DATABASE_URL`:

```bash
cp apps/server/.env.example apps/server/.env
```

Then run:

```bash
pnpm --filter @fleet/server db:generate
pnpm --filter @fleet/server db:migrate
```

## Production

Build both applications:

```bash
pnpm build
```

Start the Fastify server:

```bash
pnpm --filter @fleet/server start
```

Serve the generated client files from `apps/client/dist` using your production web server or hosting platform.
