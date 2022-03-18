import { writeFileSync } from 'fs'

import { idolImages } from '../../data/idol-images.js'
import { fetchIdolData, fetchOgpImageUrl } from './fetch.js'

;(async () => {
  const result = idolImages
  const idolList = await fetchIdolData().catch((err) => {
    throw new Error(err)
  })

  for (const e of idolList) {
    const name = e.name.value

    // 取得済みならスキップ
    if (result.find((e) => e.name === name)) continue

    const url = await fetchOgpImageUrl(e.URL.value).catch((err) => {
      throw new Error(err)
    })

    // URLからファイル名を取得
    const image = url.match(/images\/character_main\/(.+)$/)[1]

    result.push({ name, image })

    console.log(`[GET] ${name} -> ${image}`)

    // 2秒待機
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  const json = JSON.stringify(
    result.sort((a, b) => a.name.localeCompare(b.name)),
    null,
    '\t'
  )

  writeFileSync(
    './src/data/idol-images.js',
    `/** アイドルの画像リスト */\nexport const idolImages = ${json}`
  )

  console.log('[SUCCESS!]')
})()
