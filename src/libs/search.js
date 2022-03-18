import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'

import { fetchDataFromDB } from './fetch.js'
import { createErrorMessage, createReplyMessage } from './message.js'
import { createQuery } from './query.js'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

/**
 * プロフィールを検索
 * @param {string} text メッセージテキスト
 * @returns FlexMessageオブジェクト
 */
export async function search(text) {
  const keyword = createSearchKeyword(text)

  try {
    const query = createQuery(keyword)
    const data = await fetchDataFromDB(query)

    return createReplyMessage(data)
  } catch (_err) {
    return createErrorMessage(
      '検索に失敗しました',
      'im@sparqlにアクセスできません'
    )
  }
}

/**
 * 検索キーワードを作成
 * @param {string} text メッセージテキスト
 * @returns 検索キーワード
 */
function createSearchKeyword(text) {
  const trimedText = text.trim()

  // 誕生日検索かチェック
  if (trimedText.includes('誕生日')) {
    let addNum = 0

    if (trimedText.includes('明日')) {
      addNum = 1
    } else if (trimedText.includes('昨日')) {
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
