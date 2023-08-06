import { Context, Hono } from "https://deno.land/x/hono@v3.3.4/mod.ts";
import { Status } from "https://deno.land/std@0.197.0/http/http_status.ts";

import type { WebhookRequestBody } from "./types/line.ts";
import { reply } from "./reply.ts";
import { hmac } from "./util.ts";
import { config } from "./env.ts";

const app = new Hono();

app.post("/hook", async (ctx: Context) => {
  // リクエストを検証する
  const signature = ctx.req.headers.get("x-line-signature");
  const json = await ctx.req.text();
  const hash = await hmac(config.channelSecret, json);

  if (signature !== hash) {
    return new Response("bad request", { status: Status.BadRequest });
  }

  // リクエストを処理
  const req: WebhookRequestBody = await JSON.parse(json);
  await Promise.all(req.events.map((event) => {
    return reply(event);
  }));

  return new Response("ok");
});

Deno.serve({ port: 3000 }, app.fetch);
