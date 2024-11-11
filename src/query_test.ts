import { assertMatch, assertNotMatch, assertStringIncludes } from "@std/assert";
import { createBirthdaySearchQuery, createSearchQuery } from "./query.ts";

Deno.test("createBirthdaySearchQuery", () => {
  const date = "4-19";
  const query = createBirthdaySearchQuery(date);

  const expected = new RegExp(`FILTER CONTAINS\\(STR\\(\\?BD\\), "${date}"\\)`);
  assertMatch(query, expected, "誕生日のフィルターが含まれる");
  assertNotMatch(query, /LIMIT 5/, "LIMITが含まれない");
});

Deno.test("createSearchQuery (通常検索)", () => {
  const keyword = "水谷絵理";
  const query = createSearchQuery(keyword);

  const expected = new RegExp(
    `FILTER\\(CONTAINS\\(\\?名前, "${keyword}"\\) || CONTAINS\\(\\?本名, "${keyword}"\\) || CONTAINS\\(\\?名前ルビ, "${keyword}"\\)\\)`,
  );
  assertMatch(query, expected);
});

Deno.test("createSearchQuery (複数検索)", async (t) => {
  const test = (keyword: string, expectedRegex: string) => {
    const query = createSearchQuery(keyword);

    const expected = new RegExp(
      `FILTER\\(REGEX\\(\\?名前, "${expectedRegex}"\\) || REGEX\\(\\?本名, "${expectedRegex}"\\) || REGEX\\(\\?名前ルビ, "${expectedRegex}"\\)\\)`,
    );

    assertMatch(query, expected);
  };

  await t.step("スペース区切りで検索できる", () => {
    const keyword = "白菊ほたる 鷹富士茄子";
    const expectedRegex = "白菊ほたる|鷹富士茄子";
    test(keyword, expectedRegex);
  });

  await t.step("改行区切りで検索できる", () => {
    const keyword = `ひなな
こいと`;
    const expectedRegex = "ひなな|こいと";
    test(keyword, expectedRegex);
  });

  await t.step("最大5件までに制限される", () => {
    const keyword = "あ い う え お か き く け こ";
    const expectedRegex = "あ|い|う|え|お";
    test(keyword, expectedRegex);
  });

  await t.step("ダブルクォートがエスケープされている", () => {
    const query = createSearchQuery('"');
    const expected =
      'FILTER(CONTAINS(?名前, "\\"") || CONTAINS(?本名, "\\"") || CONTAINS(?名前ルビ, "\\""))';
    assertStringIncludes(query, expected);
  });
});
