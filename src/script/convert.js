'use strict'
const moment = require('moment-timezone')

const convertData = {
  brand: {
    '1stVision': {
      name: 'THE IDOLM@STER (旧)',
      color: '#F34F6D'
    },
    '765AS': {
      name: 'THE IDOLM@STER',
      color: '#F34F6D'
    },
    DearlyStars: {
      name: 'Dearly Stars',
      color: '#FF74B8'
    },
    MillionLive: {
      name: 'MILLION LIVE!',
      color: '#FFC30B'
    },
    SideM: {
      name: 'SideM',
      color: '#0FBE94'
    },
    CinderellaGirls: {
      name: 'CINDERELLA GIRLS',
      color: '#2681C8'
    },
    ShinyColors: {
      name: 'SHINY COLORS',
      color: '#8dBBFF'
    },
    Other: {
      name: 'Other',
      color: '#FF74B8'
    }
  },
  gender: {
    male: '男性',
    female: '女性'
  },
  handedness: {
    right: '右利き',
    left: '左利き',
    both: '両利き'
  },
  addUnit: [
    {
      key: '年齢',
      unit: '歳'
    },
    {
      key: '身長',
      unit: 'cm'
    },
    {
      key: '体重',
      unit: 'kg'
    },
    {
      key: '血液型',
      unit: '型'
    }
  ]
}

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
