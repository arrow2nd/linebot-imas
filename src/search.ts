import dayjs from "https://esm.sh/dayjs@v1.11.9";
import timezone from "https://esm.sh/dayjs@v1.11.9/plugin/timezone.js";
import utc from "https://esm.sh/dayjs@v1.11.9/plugin/utc.js";

import { createReplyMessage, createTextMessage } from "./message.ts";
import { createBirthdaySearchQuery, createSearchQuery } from "./query.ts";
import { fetchFromImasparql } from "./util.ts";

import type { ImasparqlResponse } from "./types/imasparql.ts";
import type { FlexMessage } from "./types/message.ts";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

/**
 * キーワードから検索
 * @param keyword キーワード
 * @returns FlexMessage
 */
export async function searchByKeyword(keyword: string): Promise<FlexMessage> {
  const trimed = keyword.trim();
  let query = "";

  if (trimed.includes("誕生日")) {
    let addDay = 0;

    if (trimed.includes("明日")) {
      addDay = 1;
    } else if (trimed.includes("昨日")) {
      addDay = -1;
    }

    const date = dayjs.tz().add(addDay, "d").format("MM-DD");

    // 誕生日検索
    query = createBirthdaySearchQuery(date);
  } else {
    // キーワード検索
    query = createSearchQuery(keyword);
  }

  const res = await fetchFromImasparql<ImasparqlResponse>(query);

  return createReplyMessage(res.results.bindings);
}

/**
 * 日付から誕生日検索
 * @param input 入力
 * @returns FlexMessage
 */
export async function searchByBirthday(input: string): Promise<FlexMessage> {
  const trimed = input.trim();
  const day = dayjs(trimed, "YYYY-MM-DD").tz();

  if (!day.isValid()) {
    return createTextMessage("エラー", `日付が未対応の形式です (${day})`);
  }

  const query = createBirthdaySearchQuery(day.format("MM-DD"));
  const res = await fetchFromImasparql<ImasparqlResponse>(query);

  return createReplyMessage(res.results.bindings);
}
