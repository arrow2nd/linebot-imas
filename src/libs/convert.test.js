import { convertBrandName, convertProfile, getIdolColor } from './convert.js'

describe('convertProfile', () => {
  describe('一般的なプロフィール', () => {
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

    test('性別を変換できるか', () => {
      expect(results.性別.value).toBe('女性')
    })

    test('利き手を変換できるか', () => {
      expect(results.利き手.value).toBe('両利き')
    })

    test('誕生日を変換できるか', () => {
      expect(results.誕生日.value).toBe('1月4日')
    })

    test('年齢を変換できるか', () => {
      expect(results.年齢.value).toBe('14歳')
    })

    test('身長を変換できるか', () => {
      expect(results.身長.value).toBe('153.0cm')
    })

    test('体重を変換できるか', () => {
      expect(results.体重.value).toBe('47.0kg')
    })

    test('血液型を変換できるか', () => {
      expect(results.血液型.value).toBe('AB型')
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

    test('性別を変換できるか', () => {
      expect(results.性別.value).toBe('不明')
    })

    test('利き手を変換できるか', () => {
      expect(results.利き手.value).toBe('不明')
    })

    test('年齢を変換できるか', () => {
      expect(results.年齢.value).toBe('永遠の17歳')
    })

    test('体重を変換できるか', () => {
      expect(results.体重.value).toBe('リンゴたくさん')
    })
  })
})

describe('convertBrandName', () => {
  test.each`
    brand            | expected
    ${'ShinyColors'} | ${'SHINY COLORS'}
    ${'none'}        | ${'不明'}
  `('ブランド名を変換できるか（$brand）', ({ brand, expected }) => {
    expect(convertBrandName(brand)).toBe(expected)
  })
})

describe('getIdolColor', () => {
  test.each`
    data                                | expected
    ${{ カラー: { value: '#F30100' } }} | ${'#F30100'}
    ${{ ブランド: { value: '765AS' } }} | ${'#F34F6D'}
    ${{ ブランド: { value: 'test' } }}  | ${'#FF74B8'}
  `(
    'プロフィールデータからイメージカラーを取得できるか $#',
    ({ data, expected }) => {
      expect(getIdolColor(data)).toBe(expected)
    }
  )
})
