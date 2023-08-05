import type { WebhookEvent } from "./types/line.ts";
import type { FlexMessage } from "./types/message.ts";

import { config } from "./env.ts";
import { searchByBirthday, searchByKeyword } from "./search.ts";
import { createTextMessage } from "./message.ts";

export async function reply(event: WebhookEvent): Promise<void> {
  let message: FlexMessage;

  switch (event.type) {
    // キーワード検索
    case "message":
      message = (event.message.type === "text")
        ? await searchByKeyword(event.message.text)
        : createTextMessage("⚠ エラー", "テキストを送信してください！");
      break;

    // 日付指定の誕生日検索
    case "postback":
      message = await searchByBirthday(event.postback.params.date);
      break;

    // それ以外のイベントでは何もしない
    default:
      return;
  }

  // 送信
  const res = await send(event.replyToken, message);
  console.log(res);
}

/**
 * 送信
 * @param replyToken リプライトークン
 * @param flex FlexMessage
 * @returns レスポンス
 */
async function send(replyToken: string, flex: FlexMessage): Promise<Response> {
  return await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.channelAccessToken}`,
    },
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [flex],
    }),
  });
}
