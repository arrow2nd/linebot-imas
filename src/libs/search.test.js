import { search } from './search.js'

describe('search', () => {
  describe.each`
    title                       | keyword         | expectedName    | expectedNameKana
    ${'本名と活動名が異なる'}   | ${'伴田路子'}   | ${'ロコ'}       | ${'はんだろこ'}
    ${'本名が一部分かっている'} | ${'しいか'}     | ${'詩花'}       | ${'しいか'}
    ${'本名が分かっていない'}   | ${'ジュリア'}   | ${'ジュリア'}   | ${'じゅりあ'}
    ${'スタッフ'}               | ${'七草はづき'} | ${'七草はづき'} | ${'ななくさはづき'}
    ${'誕生日検索'}             | ${'4-19'}       | ${'白菊ほたる'} | ${'しらぎくほたる'}
  `(
    'アイドルを検索できるか（$title）',
    ({ keyword, expectedName, expectedNameKana }) => {
      let result

      beforeAll(async () => {
        result = await search(keyword)
      })

      test('名前が正しいか', () => {
        const name =
          result.contents.contents[0].body.contents[2].contents[0].text
        expect(name).toBe(expectedName)
      })

      test('読み仮名が正しいか', () => {
        const subText =
          result.contents.contents[0].body.contents[2].contents[1].text
        expect(subText).toContain(expectedNameKana)
      })

      test('画像URLが存在するか', () => {
        const url = result.contents.contents[0].body.contents[0].url
        expect(url).toBeTruthy()
      })
    }
  )

  test('アイドルの複数検索ができるか', async () => {
    const result = await search('芹沢あさひ　黛冬優子')

    expect(result.contents.contents).toHaveLength(2)
  })

  test('エラーメッセージが返ってくるか', async () => {
    const result = await search('test')

    expect(result.altText).toBe('みつかりませんでした')
  })
})
