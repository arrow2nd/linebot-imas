import type { WebhookRequestBody } from "./types/line.ts";

import { Context, Hono } from "hono";

import { reply } from "./reply.ts";
import { hmac } from "./util.ts";
import { config } from "./env.ts";

const app = new Hono();

const staticEntries = [
  "noimage.png",
  "error.png",
  "gradation.png",
];

app.get("/static/:path", async (ctx: Context) => {
  const path = ctx.req.param("path");

  if (!staticEntries.includes(path)) {
    return ctx.notFound();
  }

  const file = await Deno.readFile(`${Deno.cwd()}/static/${path}`);

  return new Response(file, {
    headers: {
      "content-type": "image/png",
    },
  });
});

app.post("/hook", async (ctx: Context) => {
  // リクエストを検証する
  const signature = ctx.req.header("x-line-signature");
  const json = await ctx.req.text();
  const hash = await hmac(config.channelSecret, json);

  if (signature !== hash) {
    return new Response("bad request", { status: 400 });
  }

  // リクエストを処理
  const req: WebhookRequestBody = await JSON.parse(json);
  await Promise.all(req.events.map((event) => {
    return reply(event);
  }));

  return new Response("ok");
});

Deno.serve({ port: 3000 }, app.fetch);
