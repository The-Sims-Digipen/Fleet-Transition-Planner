# Fleet Transition Planner

A web application for planning the transition of a vehicle fleet from diesel to electric. It includes an interactive 3D depot, vehicle transition scheduling, editable cost and energy assumptions, fleet cost and emissions calculations, power-capacity feedback, charts, and a year-by-year timeline.

## Demo

[Fleet Transition Planner](https://fleet-transition-planner-client.vercel.app)

## Prerequisites

Required:

- [Node.js 22 or newer](https://nodejs.org/en/download) (install an LTS release).
- pnpm. After installing Node.js, install pnpm with:

  ```bash
  npx get-pnpm
  ```

- [Git](https://git-scm.com/downloads), if you need to clone the repository.
- A browser with WebGL enabled to use the interactive 3D depot.

Verify the required tools from a new terminal:

```bash
node --version
pnpm --version
```

The Node.js version should be 22 or newer and the pnpm version should be 11.24.0 or newer. Also ensure ports `5173` and `3001` are available for the development servers.

## Development

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
