import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'

import { createErrorMessage, createReplyMessage } from './create.js'
import { fetchIdolProfile } from './fetch.js'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

/**
 * プロフィールを検索
 * @param {String} text メッセージテキスト
 * @returns FlexMessageオブジェクト
 */
export async function search(text) {
  const keyword = createSearchKeyword(text)

  try {
    const data = await fetchIdolProfile(keyword)
    return createReplyMessage(data)
  } catch (err) {
    console.error(err)
    return createErrorMessage(
      '検索に失敗しました',
      'im@sparqlにアクセスできません'
    )
  }
}

/**
 * 検索キーワードを作成
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
