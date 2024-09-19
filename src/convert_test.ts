import { assertEquals } from "@std/assert";

import {
  convert2ReadableBrandName,
  convert2ReadableProfile,
  getBrandColor,
  getImageUrl,
} from "./convert.ts";

Deno.test("convert2ReadableProfile", async (t) => {
  await t.step("通常のプロフィール", () => {
    const result = convert2ReadableProfile({
      名前: {
        value: "",
      },
      性別: {
        value: "female",
      },
      利き手: {
        value: "both",
      },
      誕生日: {
        value: "-01-04",
      },
      年齢: {
        value: "14",
      },
      身長: {
        value: "153.0",
      },
      体重: {
        value: "47.0",
      },
      血液型: {
        value: "AB",
      },
    });

    assertEquals(result.性別?.value, "女性");
    assertEquals(result.利き手?.value, "両利き");
    assertEquals(result.誕生日?.value, "1月4日");
    assertEquals(result.年齢?.value, "14歳");
    assertEquals(result.身長?.value, "153.0cm");
    assertEquals(result.体重?.value, "47.0kg");
    assertEquals(result.血液型?.value, "AB型");
  });

  await t.step("特殊なプロフィール", () => {
    const result = convert2ReadableProfile({
      名前: {
        value: "",
      },
      性別: {
        value: "none",
      },
      利き手: {
        value: "none",
      },
      年齢: {
        value: "永遠の17",
      },
      体重: {
        value: "リンゴたくさん",
      },
    });

    assertEquals(result.性別?.value, "不明");
    assertEquals(result.利き手?.value, "不明");
    assertEquals(result.年齢?.value, "永遠の17歳");
    assertEquals(result.体重?.value, "リンゴたくさん");
  });
});

Deno.test("convert2ReadableBrandName", async (t) => {
  await t.step("変換できる", () => {
    const brand = "ShinyColors";
    const expected = "SHINY COLORS";
    assertEquals(convert2ReadableBrandName(brand), expected);
  });

  await t.step("リストに無い場合「不明」が返る", () => {
    const brand = "none";
    const expected = "不明";
    assertEquals(convert2ReadableBrandName(brand), expected);
  });
});

Deno.test("getBrandColor", async (t) => {
  await t.step("取得できる", () => {
    const brand = "ShinyColors";
    const expected = "#8dBBFF";
    assertEquals(getBrandColor(brand), expected);
  });

  await t.step("リストに無い場合、アイマス全体のイメージカラーが返る", () => {
    const brand = "none";
    const expected = "#FF74B8";
    assertEquals(getBrandColor(brand), expected);
  });
});

Deno.test("getImageUrl", async (t) => {
  await t.step("取得できる", () => {
    const name = "白菊ほたる";
    const expected =
      "https://idollist.idolmaster-official.jp/images/character_main/shiragiku_hotaru_01.jpg";
    assertEquals(getImageUrl(name), expected);
  });

  await t.step("リストに無い場合、noimage が返る", () => {
    const name = "none";
    const expected = "http://localhost:3000/static/noimage.png";
    assertEquals(getImageUrl(name), expected);
  });
});
