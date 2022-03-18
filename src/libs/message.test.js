import { hazuki, hotaru, julia, shika } from '../data/sample.js'
import { createErrorMessage, createReplyMessage } from './message.js'

describe('createReplyMessage', () => {
  test.each([hotaru, shika, julia, hazuki])(
    'メッセージを作成できるか $#',
    (data) => {
      expect(createReplyMessage([data])).toHaveProperty(
        'altText',
        '1人 みつかりました！'
      )
    }
  )

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
