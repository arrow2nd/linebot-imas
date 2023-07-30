import { createReplyMessage } from "./message.ts";
import { createBirthdaySearchQuery, createSearchQuery } from "./query.ts";

import type { ImasparqlResponse } from "./types/imasparql.ts";
import type { FlexMessage } from "./types/message.ts";
import { fetchFromImasparql } from "./util.ts";

export async function searchByKeyword(keyword: string): Promise<FlexMessage> {
  const query = createSearchQuery(keyword);
  const res = await fetchFromImasparql<ImasparqlResponse>(query);

  return createReplyMessage(res.results.bindings);
}

export async function searchByBirthday(date: string): Promise<FlexMessage> {
  const query = createBirthdaySearchQuery(date);
  const res = await fetchFromImasparql<ImasparqlResponse>(query);

  return createReplyMessage(res.results.bindings);
}
