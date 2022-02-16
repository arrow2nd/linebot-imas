/* eslint-disable no-undef */
import { strictEqual } from 'assert'

import {
  convertBrandName,
  convertProfile,
  getIdolColor
} from '../scripts/convert.js'

describe('convert.js', () => {
  describe('#convertProfile()', () => {
    describe('芹沢あさひ', () => {
      const results = convertProfile({
        性別: {
          value: 'female'
        },
        利き手: {
          value: 'both'
        },
        誕生日: {
          value: '-01-04'
        },
        年齢: {
          value: '14'
        },
        身長: {
          value: '153.0'
        },
        体重: {
          value: '47.0'
        },
        血液型: {
          value: 'AB'
        }
      })

      it('性別を変換', () => {
        strictEqual(results.性別.value, '女性')
      })

      it('利き手を変換', () => {
        strictEqual(results.利き手.value, '両利き')
      })

      it('誕生日を変換', () => {
        strictEqual(results.誕生日.value, '1月4日')
      })

      it('年齢を変換', () => {
        strictEqual(results.年齢.value, '14歳')
      })

      it('身長を変換', () => {
        strictEqual(results.身長.value, '153.0cm')
      })

      it('体重を変換', () => {
        strictEqual(results.体重.value, '47.0kg')
      })

      it('血液型を変換', () => {
        strictEqual(results.血液型.value, 'AB型')
      })
    })

    describe('特殊なプロフィール', () => {
      const results = convertProfile({
        性別: {
          value: 'none'
        },
        利き手: {
          value: 'none'
        },
        年齢: {
          value: '永遠の17'
        },
        体重: {
          value: 'リンゴたくさん'
        }
      })

      it('性別を変換', () => {
        strictEqual(results.性別.value, '不明')
      })

      it('利き手を変換', () => {
        strictEqual(results.利き手.value, '不明')
      })

      it('年齢を変換', () => {
        strictEqual(results.年齢.value, '永遠の17歳')
      })

      it('体重を変換', () => {
        strictEqual(results.体重.value, 'リンゴたくさん')
      })
    })
  })

  describe('#convertBrandName()', () => {
    it('ShinyColors', () => {
      strictEqual(convertBrandName('ShinyColors'), 'SHINY COLORS')
    })

    it('不明', () => {
      strictEqual(convertBrandName('none'), '不明')
    })
  })

  describe('#getIdolColor()', () => {
    it('個人カラーを取得（芹沢あさひ）', () => {
      strictEqual(
        getIdolColor({
          カラー: {
            value: '#F30100'
          }
        }),
        '#F30100'
      )
    })

    it('ブランドカラーを取得（765AS）', () => {
      strictEqual(
        getIdolColor({
          ブランド: {
            value: '765AS'
          }
        }),
        '#F34F6D'
      )
    })

    it('不明', () => {
      strictEqual(
        getIdolColor({
          ブランド: {
            value: 'test'
          }
        }),
        '#FF74B8'
      )
    })
  })
})
