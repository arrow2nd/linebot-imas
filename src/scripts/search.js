'use strict'
const dayjs = require('dayjs')
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.tz.setDefault('Asia/Tokyo')

const { fetchIdolProfile } = require('./fetch-idol-profile')
const { createMessage, createErrorMessage } = require('./create-flex')

/**
 * プロフィールを検索
 *
 * @param {String} text メッセージテキスト
 * @returns FlexMessageオブジェクト
 */
async function search(text) {
  const keyword = createSearchKeyword(text)

  try {
    const data = await fetchIdolProfile(keyword)
    return createMessage(data)
  } catch (err) {
    console.error(err)
    return createErrorMessage(
      '検索できませんでした',
      'im@sparqlにアクセスできません'
    )
  }
}

/**
 * 検索キーワードを作成
 *
 * @param {String} text メッセージテキスト
 * @returns 検索キーワード
 */
function createSearchKeyword(text) {
  const trimedText = text.trim()

  // 誕生日検索かチェック
  if (/誕生日/.test(trimedText)) {
    let addNum = 0

    if (/明日/.test(trimedText)) {
      addNum = 1
    } else if (/昨日/.test(trimedText)) {
      addNum = -1
    }

    // 日付を返す
    return dayjs.tz().add(addNum, 'd').format('MM-DD')
  }

  // メッセージが日付かチェック
  for (const format of ['YYYY-MM-DD', 'M-D']) {
    const day = dayjs(trimedText, format).tz()
    if (day.isValid()) {
      return day.format('MM-DD')
    }
  }

  return trimedText
}

module.exports = { search }
