import { Client } from '@line/bot-sdk'
import 'dotenv/config'
import { createReadStream } from 'fs'

const client = new Client({
  channelAccessToken: process.env.PRODUCTION_ACCESS_TOKEN
})

const areaSize = {
  width: 625,
  height: 674
}

const richmenu = {
  name: 'birthdaySearchMenu',
  size: { width: 2500, height: 674 },
  chatBarText: '← 名前を入力して検索！',
  selected: true,
  areas: [
    {
      bounds: { x: 0, y: 0, ...areaSize },
      action: { type: 'message', text: '昨日誕生日のアイドル' }
    },
    {
      bounds: { x: 625, y: 0, ...areaSize },
      action: { type: 'message', text: '今日誕生日のアイドル' }
    },
    {
      bounds: { x: 1250, y: 0, ...areaSize },
      action: { type: 'message', text: '明日誕生日のアイドル' }
    },
    {
      bounds: { x: 1875, y: 0, ...areaSize },
      action: {
        type: 'datetimepicker',
        data: 'action=dateSelect',
        mode: 'date'
      }
    }
  ]
}

;(async () => {
  const richMenuId = await client.createRichMenu(richmenu)
  console.log('id: ' + richMenuId)

  // 画像を紐付ける
  await client.setRichMenuImage(
    richMenuId,
    createReadStream('./src/tools/richmenu/image.png')
  )

  // デフォルトに設定
  await client.deleteDefaultRichMenu()
  await client.setDefaultRichMenu(richMenuId)

  console.log('success!!')
})()
