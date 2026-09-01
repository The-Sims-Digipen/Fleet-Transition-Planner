import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";

const app = Fastify({
  logger: true,
});

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

const port = Number(process.env.PORT ?? 3001);

await app.listen({
  host: "0.0.0.0",
  port,
});
