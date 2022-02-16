/* eslint-disable no-undef */
import { match, strictEqual } from 'assert'

import { search } from '../scripts/search.js'

/**
 * メッセージオブジェクトのテスト
 * @param {String} title テストのタイトル
 * @param {String} keyword 検索キーワード
 * @param {String} cName 期待されるアイドル名
 * @param {String} cKana 期待されるアイドル読みがな
 */
const messageObjectTest = (title, keyword, cName, cKana) =>
  describe(title, () => {
    let data = {}
    before(async () => {
      data = await search(keyword)
    })

    it('正しく名前を取得できているか', () => {
      const name = data.contents.contents[0].body.contents[2].contents[0].text
      strictEqual(name, cName)
    })

    it('サブテキストが正しく生成されているか', () => {
      const subText =
        data.contents.contents[0].body.contents[2].contents[1].text
      match(subText, RegExp(`^${cKana}`))
    })

    it('画像URLが正しく取得できているか', () => {
      const url = data.contents.contents[0].body.contents[0].url
      match(url, /^https:/)
    })
  })

describe('search.js', () => {
  messageObjectTest(
    '本名と活動名が異なるアイドル（伴田路子）',
    '伴田路子',
    'ロコ',
    'はんだろこ'
  )

  messageObjectTest(
    '本名が一部分かっているアイドル（詩花）',
    'しいか',
    '詩花',
    'しいか'
  )

  messageObjectTest(
    '本名が分かっていないアイドル（ジュリア）',
    'ジュリア',
    'ジュリア',
    'じゅりあ'
  )

  messageObjectTest(
    'スタッフ（七草はづき）',
    '七草はづき',
    '七草はづき',
    'ななくさはづき'
  )

  messageObjectTest(
    '日付指定での誕生日検索（4/19）',
    '4/19',
    '白菊ほたる',
    'しらぎくほたる'
  )

  describe('複数アイドルの同時検索', () => {
    it('正しい件数が返ってきているか', async () => {
      const data = await search('芹沢あさひ　黛冬優子')
      strictEqual(data.contents.contents.length, 2)
    })
  })

  describe('見つからなかったときのエラーメッセージ', () => {
    it('正しいメッセージオブジェクトが返せているか', async () => {
      const data = await search('test')
      strictEqual(data.altText, 'みつかりませんでした')
    })
  })
})
