import axios from 'axios'
import { JSDOM } from 'jsdom'

import { fetchDataFromDB } from '../../libs/fetch.js'

/**
 * アイドル名鑑のURLを持つアイドルを取得
 * @return 検索結果
 */
export async function fetchIdolData() {
  const query = `
  PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  SELECT DISTINCT ?name ?URL
  WHERE {
    ?data rdfs:label ?name;
    imas:IdolListURL ?URL.
  }
  `

  return fetchDataFromDB(query)
}

/**
 * URLからOGP画像のURLを取得
 * @param {String} url URL
 * @return OGP画像のURL
 */
export async function fetchOgpImageUrl(url) {
  try {
    const res = await axios.get(url)
    const dom = new JSDOM(res.data)

    const meta = dom.window.document.querySelectorAll('head > meta')
    const img = Array.from(meta)
      .filter((e) => e.hasAttribute('property'))
      .find((v) => v.getAttribute('property').trim().includes('og:image'))
      .getAttribute('content')

    return img
  } catch (err) {
    throw new Error(
      `[Error] ${err.response.statusText} : ${err.response.status}`
    )
  }
}
