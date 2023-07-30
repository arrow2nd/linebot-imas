import dayjs from "https://esm.sh/dayjs@v1.11.9";

import type { Binding, BindingKey } from "./types/imasparql.ts";

import { idolImages } from "../data/images.ts";
import { getTypedEntries } from "./util.ts";

export type Brand = {
  name: string;
  color: string;
};

/** ブランド名 EN->JP 変換リスト */
const brandList = new Map<string, Brand>([
  ["1stVision", { name: "THE IDOLM@STER (旧)", color: "#F34F6D" }],
  ["765AS", { name: "THE IDOLM@STER", color: "#F34F6D" }],
  ["DearlyStars", { name: "Dearly Stars", color: "#FF74B8" }],
  ["MillionLive", { name: "MILLION LIVE!", color: "#FFC30B" }],
  ["SideM", { name: "SideM", color: "#0FBE94" }],
  ["CinderellaGirls", { name: "CINDERELLA GIRLS", color: "#2681C8" }],
  ["ShinyColors", { name: "SHINY COLORS", color: "#8dBBFF" }],
  ["Other", { name: "Other", color: "#FF74B8" }],
]);

/** 性別 EN->JP 変換リスト */
const genderList = new Map([
  ["male", "男性"],
  ["female", "女性"],
]);

/** 利き手 EN->JP 変換リスト */
const handednessList = new Map([
  ["right", "右利き"],
  ["left", "左利き"],
  ["both", "両利き"],
]);

/** 単位名変換リスト */
const unitList = new Map<BindingKey, string>([
  ["年齢", "歳"],
  ["身長", "cm"],
  ["体重", "kg"],
  ["血液型", "型"],
]);

/**
 * プロフィールの値を読みやすい表記に変換
 * @param profile プロフィールデータ
 * @returns 変換後
 */
export function convert2ReadableProfile(profile: Binding): Binding {
  // 日本語に変換
  if (profile.性別?.value) {
    profile.性別.value = genderList.get(profile.性別.value) || "不明";
  }

  if (profile.利き手?.value) {
    profile.利き手.value = handednessList.get(profile.利き手.value) || "不明";
  }

  // 誕生日の形式を変換
  if (profile.誕生日?.value) {
    const birthDay = dayjs(profile.誕生日.value, "-MM-DD");
    profile.誕生日.value = birthDay.format("M月D日");
  }

  // 単位を追加
  for (const [key, value] of getTypedEntries(profile)) {
    const originValue = value?.value;
    const unit = unitList.get(key);

    if (!originValue || !unit) {
      continue;
    }

    // 末尾が英数字なら追加
    if (/[a-zA-Z0-9?]+$/.test(originValue)) {
      profile[key] = {
        value: originValue + unit,
      };
    }
  }

  return profile;
}

export function convert2ReadableBrandName(
  brandName: string | undefined,
): string {
  return (brandName && brandList.get(brandName)?.name) || "不明";
}

export function getBrandColor(brandName: string | undefined) {
  // ブランドカラーが存在しない場合、アイマス全体のイメージカラーを返す
  return (brandName && brandList.get(brandName)?.color) || "#FF74B8";
}

export function getImageUrl(idolName: string): string {
  const noImage = "https://linebot-imas.vercel.app/noimage.png";
  return idolImages.get(idolName) || noImage;
}
