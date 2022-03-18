import dayjs from 'dayjs'

import {
  brandList,
  genderList,
  handednessList,
  unitList
} from '../data/convert-list.js'

/**
 * プロフィールデータを読みやすい形式に変換
 * @param {any} profile プロフィールデータ
 * @returns 変換後のプロフィールデータ
 */
export function convert2ReadableProfile(profile) {
  // 日本語に変換
  if (profile.性別?.value) {
    profile.性別.value = genderList.get(profile.性別.value) || '不明'
  }

  if (profile.利き手?.value) {
    profile.利き手.value = handednessList.get(profile.利き手.value) || '不明'
  }

  // 誕生日を日本語形式に変換
  if (profile.誕生日?.value) {
    const birthDay = dayjs(profile.誕生日.value, '-MM-DD')
    profile.誕生日.value = birthDay.format('M月D日')
  }

  // 単位を追加
  for (const [key, unit] of unitList.entries()) {
    if (!profile[key]?.value) continue

    // 末尾が英数字なら追加
    if (/[a-zA-Z0-9?]+$/.test(profile[key].value)) {
      profile[key].value += unit
    }
  }

  return profile
}

/**
 * ブランド名を読みやすい形式に変換
 * @param {string | undefined} brandName ブランド名
 * @returns 変換後のブランド名
 */
export function convert2ReadableBrandName(brandName) {
  return (brandName && brandList.get(brandName)?.name) || '不明'
}
