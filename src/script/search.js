'use strict'
const moment = require('moment-timezone')
const getIdolProfile = require('./get-idol-profile')
const { createMessage, createErrorMessage } = require('./create-flex')

/**
 * プロフィールを検索
 *
 * @param  {String} text メッセージ
 * @return {Object}      flexMessage
 */
async function search(text) {
  const keyword = createSearchKeyword(text)

  try {
    const data = await getIdolProfile(keyword)
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
 * 検索文字列を作成
 *
 * @param  {String} text メッセージ
 * @return {String}      検索文字列
 */
function createSearchKeyword(text) {
  const editedText = text.trim().replace(/[\n\s]/g, '')

  // 誕生日検索かチェック
  if (/誕生日/.test(editedText)) {
    let addNum = 0
    if (/明日/.test(editedText)) {
      addNum = 1
    } else if (/昨日/.test(editedText)) {
      addNum = -1
    }

    const birthDate = moment()
      .add(addNum, 'days')
      .tz('Asia/Tokyo')
      .format('MM-DD')

    return birthDate
  }

  // メッセージが日付かチェック
  for (const format of ['YYYY-MM-DD', 'M月D日']) {
    const date = moment(editedText, format, true)
    if (date.isValid()) {
      return date.format('MM-DD')
    }
  }

  return editedText
}

module.exports = search
