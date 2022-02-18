/* eslint-disable no-undef */
import { strictEqual } from 'assert'

import { getImageUrl, isWhitishColor, sanitizeRegexp } from '../libs/util.js'

describe('util.js', () => {
  describe('#getImageUrl()', () => {
    it('画像URLを取得（高槻やよい）', () => {
      strictEqual(
        getImageUrl('高槻やよい'),
        'https://idollist.idolmaster-official.jp/images/character_main/yayoi_takatsuki_01.jpg'
      )
    })

    it('NoImageのURLを返す', () => {
      strictEqual(
        getImageUrl('七草はづき'),
        'https://linebot-imas.vercel.app/noimage.png'
      )
    })
  })

  describe('#isWhitishColor()', () => {
    it('白っぽい色（桑山千雪）', () => {
      strictEqual(isWhitishColor('#fbfafa'), true)
    })

    it('黒っぽい色（風野灯織）', () => {
      strictEqual(isWhitishColor('#144384'), false)
    })
  })

  describe('#sanitizeRegexp()', () => {
    it('正規表現文字列を削除（A）', () => {
      strictEqual(sanitizeRegexp('七草(にちか|はづき)$'), '七草にちかはづき')
    })

    it('正規表現文字列を削除（B）', () => {
      strictEqual(sanitizeRegexp('^双海[亜|真]美'), '双海亜真美')
    })
  })
})
