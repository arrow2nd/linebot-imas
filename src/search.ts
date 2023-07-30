import { createTextMessage } from "./message.ts";
import { createBirthdaySearchQuery, createSearchQuery } from "./query.ts";

import type { ImasparqlResponse } from "./types/imasparql.ts";
import type { FlexMessage } from "./types/message.ts";
import { fetchFromImasparql } from "./util.ts";

export async function searchByKeyword(keyword: string): Promise<FlexMessage> {
  const query = createSearchQuery(keyword);
  const result = await fetchFromImasparql<ImasparqlResponse>(query);
}

export async function searchByBirthday(date: string): Promise<FlexMessage> {
  const query = createBirthdaySearchQuery(date);
  const result = await fetchFromImasparql<ImasparqlResponse>(query);

  return createTextMessage("test", "birthday");
}
