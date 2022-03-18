import { createErrorMessage, createReplyMessage } from './create.js'

const hotaru = {
  名前: { type: 'literal', value: '白菊ほたる' },
  名前ルビ: { type: 'literal', 'xml:lang': 'ja', value: 'しらぎくほたる' },
  ブランド: { type: 'literal', 'xml:lang': 'en', value: 'CinderellaGirls' },
  性別: { type: 'literal', value: 'female' },
  年齢: {
    type: 'literal',
    datatype: 'http://www.w3.org/2001/XMLSchema#integer',
    value: '13'
  },
  身長: {
    type: 'literal',
    datatype: 'http://www.w3.org/2001/XMLSchema#float',
    value: '156.0'
  },
  体重: {
    type: 'literal',
    datatype: 'http://www.w3.org/2001/XMLSchema#float',
    value: '42.0'
  },
  BWH: { type: 'literal', value: '77.0 / 53.0 / 79.0' },
  誕生日: {
    type: 'literal',
    datatype: 'http://www.w3.org/2001/XMLSchema#gMonthDay',
    value: '--04-19'
  },
  星座: { type: 'literal', 'xml:lang': 'ja', value: '牡羊座' },
  血液型: { type: 'literal', value: 'AB' },
  利き手: { type: 'literal', value: 'left' },
  出身地: { type: 'literal', 'xml:lang': 'ja', value: '鳥取' },
  趣味: { type: 'literal', value: '笑顔の練習 / アイドルレッスン' },
  CV: { type: 'literal', 'xml:lang': 'ja', value: '天野聡美' },
  カラー: { type: 'literal', value: '#D162CB' },
  URL: {
    type: 'uri',
    value: 'https://idollist.idolmaster-official.jp/detail/20088'
  }
}

describe('createReplyMessage', () => {
  test('作成できるか', () => {
    expect(createReplyMessage([hotaru])).toHaveProperty(
      'altText',
      '1人 みつかりました！'
    )
  })

  test('エラーメッセージが返るか', () => {
    expect(createReplyMessage([])).toHaveProperty(
      'altText',
      'みつかりませんでした'
    )
  })
})

describe('createErrorMessage', () => {
  test('作成できるか', () => {
    const result = createErrorMessage('テスト', 'test')

    expect(result).toHaveProperty('altText', 'テスト')
    expect(result).toHaveProperty('contents.body.contents[0].text', 'テスト')
    expect(result).toHaveProperty('contents.body.contents[1].text', 'test')
  })
})
