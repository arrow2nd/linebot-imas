import axios from 'axios'

/**
 * imasparqlからデータを取得
 * @param  {string} query クエリ
 * @returns 検索結果
 */
export async function fetchDataFromDB(query) {
  const url = new URL('https://sparql.crssnky.xyz/spql/imas/query?output=json')
  url.searchParams.append('query', query)

  // 5000msでタイムアウト
  const res = await axios
    .get(url.toString(), { timeout: 5000 })
    .catch((err) => {
      throw new Error(
        `[Error] im@sparqlにアクセスできません (status: ${err?.response?.status})`
      )
    })

  if (!res?.data?.results?.bindings) {
    throw new Error('[Error] データがありません')
  }

  return res.data.results.bindings
}
