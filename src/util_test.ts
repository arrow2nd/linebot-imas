import { assert, assertFalse } from "asserts";
import { hmac, isWhitishColor } from "./util.ts";

Deno.test("isWhitishColor", async (t) => {
  const whitishColors = [
    "#FFFFFF",
    "#FFBAD6",
    "#A5CFB6",
    "#D9F2FF",
    "#FFC639",
    "#50D0D0",
  ];

  for (const color of whitishColors) {
    await t.step(`白っぽい色 (${color})`, () => {
      assert(isWhitishColor(color));
    });
  }

  const blackishColors = [
    "#24130D",
    "#760E10",
    "#833696",
    "#144384",
    "#006047",
    "#3B91C4",
  ];

  for (const color of blackishColors) {
    await t.step(`黒っぽい色 (${color})`, () => {
      assertFalse(isWhitishColor(color));
    });
  }
});

Deno.test("hmac", async () => {
  const key = "芹沢あさひっす！";
  const body = "わくわく～！";

  const hash = await hmac(key, body);
  const want = "PxpZh6/N/G5v0QISA9F8JVG6x+R//G2qHU81rlAYW5s=";

  assert(hash === want);
});
