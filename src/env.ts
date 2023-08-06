import type { Config } from "./types/line.ts";

import "dotenv/load";

export const baseUrl = Deno.env.get("BASE_URL") ?? "http://localhost:3000/";

export const config: Config = {
  channelAccessToken: Deno.env.get("ACCESS_TOKEN") ?? "",
  channelSecret: Deno.env.get("SECRET_KEY") ?? "",
};
