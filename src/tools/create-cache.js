'use strict'
const fs = require('fs')
const imageNames = require('../data/image-names.json')
const { fetchIdolData, fetchOgpImageUrl } = require('./fetch')

async function main() {
  const result = imageNames
  const idolList = await fetchIdolData().catch((err) => {
    throw new Error(err)
  })

  for (const e of idolList) {
    const name = e.name.value

    // 取得済みならスキップ
    if (result[name]) continue

    const url = await fetchOgpImageUrl(e.URL.value).catch((err) => {
      throw new Error(err)
    })

    // URLからファイル名を取得
    result[name] = url.match(/images\/character_main\/(.+)$/)[1]
    console.log(`[GET] ${name} -> ${result[name]}`)

    // 2秒待機
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  fs.writeFileSync(
    './src/data/image-names.json',
    JSON.stringify(result, null, '\t')
  )

  console.log('[success!]')
}

main()
