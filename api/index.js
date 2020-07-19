'use strict';
const express = require('express');
const line = require('@line/bot-sdk');
const idol = require('./idol.js');
const PORT = process.env.PORT || 5000;


// 認証
const config = {
    channelAccessToken: process.env.ACCESS_TOKEN || 'shiragiku',
    channelSecret: process.env.SECRET_KEY || 'hotaru'
};
const client = new line.Client(config);


const app = express();
app.get('/', (req, res) => res.send("It's working fine! (GET)"));
app.post('/hook/', line.middleware(config), async (req, res) => {
    await Promise.all(req.body.events.map(reply));
    res.status(200).end();
});


/**
 * 返信
 * @param {Object} ev イベント
 */
async function reply(ev){
    // メッセージイベント以外・検証の場合
    if (ev.type !== 'message' || ev.replyToken === '00000000000000000000000000000000' || ev.replyToken === 'ffffffffffffffffffffffffffffffff') {
        console.log(`メッセージイベントではありません : ${ev.type}`);
        return;
    };

    // テキスト以外の場合
    if (ev.message.type !== 'text') {
        await client.replyMessage(ev.replyToken, {
          type: 'text',
          text: 'テキストでお願いします…。'
        });
        return;
    };

    // プロフィールを検索
    const text = ev.message.text;
    const object = await idol.getIdolProfile(text);

    // 返信
    await client.replyMessage(ev.replyToken, object);
};

// vercel
(process.env.NOW_REGION) ? module.exports = app : app.listen(PORT);
