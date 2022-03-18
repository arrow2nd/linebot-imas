import {
  getBrandColor,
  getImageUrl,
  isWhitishColor,
  removeSymbol
} from './util.js'

describe('getImageUrl', () => {
  test('アイドル名から画像URLを取得できるか', () => {
    expect(getImageUrl('高槻やよい')).toBe(
      'https://idollist.idolmaster-official.jp/images/character_main/yayoi_takatsuki_01.jpg'
    )
  })

  test('該当画像が無い場合にNoImageのURLを返すか', () => {
    expect(getImageUrl('七草はづき')).toBe(
      'https://linebot-imas.vercel.app/noimage.png'
    )
  })
})

describe('getBrandColor', () => {
  test.each`
    brandName    | expected
    ${'765AS'}   | ${'#F34F6D'}
    ${'test'}    | ${'#FF74B8'}
    ${undefined} | ${'#FF74B8'}
  `('ブランドのイメージカラーを取得できるか $#', ({ brandName, expected }) => {
    expect(getBrandColor(brandName)).toBe(expected)
  })
})

describe('isWhitishColor', () => {
  test('白っぽい色の判定ができるか', () => {
    expect(isWhitishColor('#fbfafa')).toBe(true)
  })

  test('黒っぽい色の判定ができるか', () => {
    expect(isWhitishColor('#144384')).toBe(false)
  })
})

describe('removeSymbol', () => {
  test.each`
    text                                      | expected
    ${'!"#$%&\'()-^\\@[;:],./\\=~|`{+*}<>?_'} | ${''}
    ${'^双海[亜真]美$'}                       | ${'双海亜真美'}
  `('記号を除去できるか（$text）', ({ text, expected }) => {
    expect(removeSymbol(text)).toBe(expected)
  })

  test.each(['春香 千早', '雪歩　真'])('スペースを残せるか（%s）', (text) => {
    expect(removeSymbol(text)).toBe(text)
  })

  test.each(['春香\n千早', '雪歩\r\n真'])('改行を残せるか（%o）', (text) => {
    expect(removeSymbol(text)).toBe(text)
  })
})
