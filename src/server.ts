import type { WebhookRequestBody } from "./types/line.ts";

import { Context, Hono } from "hono";
import { Status } from "http_status";

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
