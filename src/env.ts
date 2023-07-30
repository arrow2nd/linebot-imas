import "https://deno.land/x/dotenv@v3.2.2/load.ts";
import type { Config } from "./types/api.ts";

export const config: Config = {
  channelAccessToken: Deno.env.get("ACCESS_TOKEN") ?? "",
  channelSecret: Deno.env.get("SECRET_KEY") ?? "",
};
