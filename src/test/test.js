/* eslint-disable no-undef */
'use strict'
const assert = require('assert')
const { search } = require('../scripts/search')

/**
 * メッセージオブジェクトのテスト
 *
 * @param {String} keyword 検索キーワード
 * @param {String} cName 期待されるアイドル名
 * @param {String} cKana 期待されるアイドル読みがな
 */
function messageTest(keyword, cName, cKana) {
  let data = {}
  before(async () => {
    data = await search(keyword)
  })

  it('正しく名前を取得できているか', () => {
    const name = data.contents.contents[0].body.contents[2].contents[0].text
    assert.strictEqual(name, cName)
  })

  it('サブテキストが正しく生成されているか', () => {
    const subText = data.contents.contents[0].body.contents[2].contents[1].text
    assert.match(subText, RegExp(`^${cKana}`))
  })

  it('画像URLが正しく取得できているか', () => {
    const url = data.contents.contents[0].body.contents[0].url
    assert.match(url, /^https:/)
  })
}

describe('#getIdolProfile()', () => {
  describe('本名と活動名が異なるアイドル（伴田路子）', () => {
    messageTest('伴田路子', 'ロコ', 'はんだろこ')
  })

  describe('本名が一部分かっているアイドル（詩花）', () => {
    messageTest('しいか', '詩花', 'しいか')
  })

  describe('本名が分かっていないアイドル（ジュリア）', () => {
    messageTest('ジュリア', 'ジュリア', 'じゅりあ')
  })

  describe('スタッフ（七草はづき）', () => {
    messageTest('七草はづき', '七草はづき', 'ななくさはづき')
  })

  describe('日付指定での誕生日検索（4/19）', () => {
    messageTest('4/19', '白菊ほたる', 'しらぎくほたる')
  })

  describe('複数アイドルの同時検索', () => {
    it('正しい件数が返ってきているか', async () => {
      const data = await search('芹沢あさひ　黛冬優子')
      assert.strictEqual(data.contents.contents.length, 2)
    })
  })

  describe('見つからなかったときのエラーメッセージ', () => {
    it('正しいメッセージオブジェクトが返せているか', async () => {
      const data = await search('test')
      assert.strictEqual(data.altText, 'みつかりませんでした')
    })
  })
})
