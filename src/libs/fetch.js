import axios from 'axios'

/**
 * imasparqlからデータを取得
 * @param  {String} query クエリ
 * @returns 検索結果
 */
export async function fetchDataFromDB(query) {
  const url = new URL('https://sparql.crssnky.xyz/spql/imas/query?output=json')
  url.searchParams.append('query', query)

  try {
    // 5000msでタイムアウト
    const res = await axios.get(url.toString(), { timeout: 5000 })

    if (!res?.data?.results?.bindings) {
      throw new Error('[Error] データがありません')
    }

    return res.data.results.bindings
  } catch (err) {
    console.error(err)

    throw new Error(
      `[Error] im@sparqlにアクセスできません (${err.response?.status})`
    )
  }
}
