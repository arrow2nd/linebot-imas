import dayjs from 'dayjs'

import { enConvert } from '../data/en-convert.js'

/**
 * プロフィールデータを編集
 * @param {any} profile プロフィールデータ
 * @returns 編集したプロフィールデータ
 */
export function convertProfile(profile) {
  const { gender, handedness, addUnit } = enConvert

  // 日本語に変換
  if (profile?.性別) {
    profile.性別.value = gender[profile.性別.value] || '不明'
  }

  if (profile?.利き手) {
    profile.利き手.value = handedness[profile.利き手.value] || '不明'
  }

  if (profile?.誕生日) {
    profile.誕生日.value = dayjs(profile.誕生日.value, '-MM-DD').format(
      'M月D日'
    )
  }

  // 単位が必要なら追加
  for (let data of addUnit) {
    if (profile[data.key] && /[a-zA-Z0-9?]/.test(profile[data.key].value)) {
      profile[data.key].value += data.unit
    }
  }

  return profile
}

/**
 * ブランド名を変換
 * @param {string} brandName ブランド名（データそのまま）
 * @returns 読みやすい形式に変換したブランド名
 */
export function convertBrandName(brandName) {
  const { brand } = enConvert

  if (!brandName) {
    return '不明'
  }

  const converted = brand[brandName]
  if (!converted) {
    return '不明'
  }

  return converted.name
}

/**
 * アイドルのイメージカラーを取得
 * @param {any} profile プロフィールデータ
 * @returns アイドルのイメージカラー
 */
export function getIdolColor(profile) {
  const { brand } = enConvert

  // 固有のイメージカラーを返す
  if (profile.カラー) {
    return profile.カラー.value
  }

  // ブランドカラーが存在しない場合、アイマス全体のイメージカラーを返す
  return brand[profile.ブランド.value]?.color || '#FF74B8'
}
