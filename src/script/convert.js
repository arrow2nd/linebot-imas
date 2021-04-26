'use strict'
const moment = require('moment-timezone')
const convertData = require('../data/convert-data.json')

/**
 * プロフィールデータを編集
 *
 * @param  {Object} profile プロフィール
 * @return {Object}         編集後のプロフィール
 */
function convertProfile(profile) {
  // 日本語に変換
  if (profile.性別) {
    const gender = convertData.gender[profile.性別.value]
    profile.性別.value = gender || '不明'
  }

  if (profile.利き手) {
    const handedness = convertData.handedness[profile.利き手.value]
    profile.利き手.value = handedness || '不明'
  }

  if (profile.誕生日) {
    profile.誕生日.value = moment(profile.誕生日.value, '-MM-DD').format(
      'M月D日'
    )
  }

  // 単位が必要なら追加
  for (let data of convertData.addUnit) {
    if (profile[data.key] && /[a-zA-Z0-9?]/.test(profile[data.key].value)) {
      profile[data.key].value += data.unit
    }
  }

  return profile
}

/**
 * ブランド名を取得
 *
 * @param {String} brandName 生のブランド名
 * @returns 読みやすい形式のブランド名
 */
function getBrandName(brandName) {
  if (!brandName) return '不明'

  return convertData.brand[brandName].name
}

/**
 * キャラのイメージカラーを取得
 *
 * @param {Object} profile プロフィールデータ
 * @returns 対応したイメージカラー
 */
function getImageColor(profile) {
  if (profile.カラー) return profile.カラー.value

  // 固有のイメージカラーが無いなら、ブランドカラーを返す
  return convertData.brand[profile.ブランド.value].color || '#FF74B8'
}

module.exports = {
  convertProfile,
  getBrandName,
  getImageColor
}
