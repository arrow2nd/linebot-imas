'use strict'
const moment = require('moment-timezone')

const convertData = {
  series: {
    CinderellaGirls: '346Pro (CinderellaGirls)',
    '1st Vision': '765Pro (旧プロフィール)',
    DearlyStars: '876Pro (DearlyStars)',
    '315ProIdols': '315Pro (SideM)',
    MillionStars: '765Pro (MillionLive!)',
    '283Pro': '283Pro (ShinyColors)',
    '765AS': '765Pro (IDOLM@STER)',
    '961ProIdols': '961Pro (IDOLM@STER)',
    '1054Pro': '1054Pro (IDOLM@STER)'
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
  // シリーズ名
  if (profile.所属) {
    const title = convertData.series[profile.所属.value]
    profile.所属.value = title || profile.所属.value
  }

  // 性別
  if (profile.性別) {
    const jp = convertData.gender[profile.性別.value]
    profile.性別.value = jp || '不明'
  }

  // 利き手
  if (profile.利き手) {
    const jp = convertData.handedness[profile.利き手.value]
    profile.利き手.value = jp || '不明'
  }

  // 誕生日のフォーマット
  if (profile.誕生日) {
    profile.誕生日.value = moment(profile.誕生日.value, '-MM-DD').format(
      'M月D日'
    )
  }

  // 単位を追加
  for (let data of convertData.addUnit) {
    if (profile[data.key] && /[a-zA-Z0-9?]/.test(profile[data.key].value)) {
      profile[data.key].value += data.unit
    }
  }

  return profile
}

module.exports = convertProfile
