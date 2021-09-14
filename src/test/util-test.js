/* eslint-disable no-undef */
'use strict'
const assert = require('assert')
const {
  getImageUrl,
  isWhitishColor,
  sanitizeRegexp
} = require('../scripts/util')

describe('util.js', () => {
  describe('getImageUrl', () => {
    it('画像URLを取得（高槻やよい）', () => {
      assert.strictEqual(
        getImageUrl('高槻やよい'),
        'https://idollist.idolmaster-official.jp/images/character_main/yayoi_takatsuki_01.jpg'
      )
    })

    it('NoImageのURLを返す', () => {
      assert.strictEqual(
        getImageUrl('七草はづき'),
        'https://arrow2nd.github.io/images/linebot-imas/noimage.png'
      )
    })
  })

  describe('isWhitishColor', () => {
    it('白っぽい色（桑山千雪）', () => {
      assert.strictEqual(isWhitishColor('#fbfafa'), true)
    })

    it('黒っぽい色（風野灯織）', () => {
      assert.strictEqual(isWhitishColor('#144384'), false)
    })
  })

  describe('sanitizeRegexp', () => {
    it('正規表現文字列を削除（A）', () => {
      assert.strictEqual(
        sanitizeRegexp('七草(にちか|はづき)'),
        '七草にちかはづき'
      )
    })

    it('正規表現文字列を削除（B）', () => {
      assert.strictEqual(sanitizeRegexp('双海[亜|真]美'), '双海亜真美')
    })
  })
})
