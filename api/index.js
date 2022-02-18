import { Client, middleware } from '@line/bot-sdk'
import 'dotenv/config'
import express from 'express'

import { createErrorMessage } from '../src/libs/create.js'
import { search } from '../src/libs/search.js'

const PORT = process.env.PORT
const config = {
  channelAccessToken: process.env.ACCESS_TOKEN,
  channelSecret: process.env.SECRET_KEY
}

const client = new Client(config)
const app = express()

// ルーティング
app.get('/', (_req, res) => res.send("ζ*'ヮ')ζ＜GETですー"))
app.post('/hook/', middleware(config), async (req, res) => {
  await Promise.all(req.body.events.map((e) => main(e)))
  res.status(200).end()
})

// Botメイン
async function main(ev) {
  // メッセージイベント
  if (ev.type === 'message') {
    const isText = ev.message.type === 'text'
    await client.replyMessage(
      ev.replyToken,
      isText
        ? await search(ev.message.text)
        : createErrorMessage('エラー', 'テキストを送信してください...！')
    )
    return
  }

  // ポストバックイベント（日付情報）
  if (ev.type === 'postback') {
    await client.replyMessage(
      ev.replyToken,
      await search(ev.postback.params.date)
    )
  }
}

// ローカル環境
if (!process.env.NOW_REGION) {
  app.listen(PORT, () => console.log(`Listening on ${PORT}`))
}

export default app
