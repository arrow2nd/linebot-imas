import { search } from './search.js'

describe('search', () => {
  describe.each`
    title                     | keyword       | expectedName    | expectedNameKana
    ${'本名と活動名が異なる'} | ${'伴田路子'} | ${'ロコ'}       | ${'はんだろこ'}
    ${'誕生日'}               | ${'4-19'}     | ${'白菊ほたる'} | ${'しらぎくほたる'}
  `('検索できるか（$title）', ({ keyword, expectedName, expectedNameKana }) => {
    let body

    beforeAll(async () => {
      const result = await search(keyword)
      body = result.contents.contents[0].body
    })

    test('名前が正しいか', () => {
      const name = body.contents[2].contents[0].text
      expect(name).toBe(expectedName)
    })

    test('読み仮名が正しいか', () => {
      const subText = body.contents[2].contents[1].text
      expect(subText).toContain(expectedNameKana)
    })

    test('画像URLが存在するか', () => {
      const url = body.contents[0].url
      expect(url).toBeTruthy()
    })
  })

  test('複数検索ができるか', async () => {
    const result = await search('芹沢あさひ　黛冬優子')

    expect(result.contents.contents).toHaveLength(2)
  })
})
