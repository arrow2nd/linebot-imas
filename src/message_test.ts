import { assertObjectMatch } from "@std/assert";

import { hazuki, hotaru, julia, shika } from "../data/mock.ts";
import { createProfileMessage, createTextMessage } from "./message.ts";

Deno.test("createProfileMessage", async (t) => {
  for (const idol of [hazuki, hotaru, julia, shika]) {
    await t.step(`作成できるか (${idol.名前})`, () => {
      const message = createProfileMessage([hotaru]);

      assertObjectMatch(message, {
        "altText": "1人 みつかりました！",
      });
    });
  }

  await t.step("エラーメッセージが返る", () => {
    const message = createProfileMessage([]);

    assertObjectMatch(message, {
      "altText": "みつかりませんでした",
    });
  });
});

Deno.test("createTextMessage", () => {
  const message = createTextMessage("テスト", "test");

  assertObjectMatch(message, { "altText": "テスト" });
  assertObjectMatch(message, {
    contents: {
      body: {
        contents: [
          { text: "テスト" },
          { text: "test" },
        ],
      },
    },
  });
});
