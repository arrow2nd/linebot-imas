'use strict'
const fs = require('fs')
const axios = require('axios').default
const jsdom = require('jsdom')

main()

async function main() {
  const result = {}
  const idolList = await fetchIdolData().catch((err) => {
    throw new Error(err)
  })

  for (const e of idolList) {
    const name = e.name.value
    const url = await fetchOgpImageUrl(e.URL.value).catch((err) => {
      throw new Error(err)
    })

    // URLからファイル名のみを取得
    result[name] = url.match(
      /^https:\/\/idollist\.idolmaster-official\.jp\/images\/character_main\/(.+)/
    )[1]
    console.log(`[OK] ${name} -> ${result[name]}`)

    // 2秒待機
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  fs.writeFileSync(
    './src/data/image-names.json',
    JSON.stringify(result, null, '\t')
  )

  console.log('[success!]')
}

/**
 * アイドル名鑑のURLを持つアイドルを取得
 *
 * @returns 検索結果
 */
async function fetchIdolData() {
  const query = `
  PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  SELECT DISTINCT ?name ?URL
  WHERE {
    ?data rdfs:label ?name;
    imas:IdolListURL ?URL.
  }
  `
  const url = `https://sparql.crssnky.xyz/spql/imas/query?output=json&query=${encodeURIComponent(
    query
  )}`

  try {
    const res = await axios.get(url)
    return res.data.results.bindings
  } catch (err) {
    throw new Error(
      `[Error] ${err.response.statusText} : ${err.response.status}`
    )
  }
}

/**
 * URLからOGP画像のURLを取得
 *
 * @param  {String} url URL
 * @returns {String}     OGP画像のURL
 */
async function fetchOgpImageUrl(url) {
  try {
    const res = await axios.get(url)
    const dom = new jsdom.JSDOM(res.data)

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
