import cors from "@fastify/cors";
import Fastify, { type FastifyServerOptions } from "fastify";

export async function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify(options);

  await app.register(cors, {
    origin: true,
  });

  app.get("/health", async () => ({
    ok: true,
    service: "fleet-transition-planner-api",
  }));

  app.get("/api", async () => ({
    name: "Fleet Transition Planner API",
    status: "starter",
  }));

  return app;
}
