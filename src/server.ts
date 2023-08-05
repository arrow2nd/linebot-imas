import { Context, Hono } from "https://deno.land/x/hono@v3.3.4/mod.ts";

import type { WebhookRequestBody } from "./types/line.ts";
import { reply } from "./reply.ts";

const app = new Hono();

app.post("/hook", async (ctx: Context) => {
  // TODO: リクエストを検証する

  const req = await ctx.req.json<WebhookRequestBody>();

  await Promise.all(req.events.map((event) => {
    return reply(event);
  }));

  return new Response("ok");
});

Deno.serve({ port: 3000 }, app.fetch);
