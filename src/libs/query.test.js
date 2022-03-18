import { createQuery } from './query.js'

describe('createQuery', () => {
  test.each`
    title       | keyword            | expected
    ${'通常'}   | ${'ほたる'}        | ${'FILTER(CONTAINS(?名前, "ほたる") || CONTAINS(?本名, "ほたる") || CONTAINS(?名前ルビ, "ほたる"))'}
    ${'複数'}   | ${'あさひ 冬優子'} | ${'FILTER(REGEX(?名前, "あさひ|冬優子") || REGEX(?本名, "あさひ|冬優子") || REGEX(?名前ルビ, "あさひ|冬優子"))'}
    ${'誕生日'} | ${'04-19'}         | ${'FILTER CONTAINS(STR(?BD), "04-19")'}
  `('$titleのクエリを作成できるか', ({ keyword, expected }) => {
    expect(createQuery(keyword)).toContain(expected)
  })
})
