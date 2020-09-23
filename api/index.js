'use strict';
const express = require('express');
const line = require('@line/bot-sdk');
const idol = require('./idol.js');
const PORT = process.env.PORT || 5000;

// 認証
const config = {
    channelAccessToken: process.env.ACCESS_TOKEN || 'SHIRAGIKU',
    channelSecret: process.env.SECRET_KEY || 'HOTARU'
};
const client = new line.Client(config);

const app = express();
app.get('/', (req, res) => res.send("ζ*'ヮ')ζ＜GETですー！"));
app.post('/hook/', line.middleware(config), async (req, res) => {
    await Promise.all(req.body.events.map(e => bot(e)));
    res.status(200).end();
});

/**
 * botメイン
 * 
 * @param {Object} ev イベント
 */
async function bot(ev){
    // メッセージイベント以外・検証ならreturn
    if (ev.type !== 'message' || ev.replyToken === '00000000000000000000000000000000' || ev.replyToken === 'ffffffffffffffffffffffffffffffff') {
        console.log(`メッセージイベントではありません : ${ev.type}`);
        return;
    };

    // テキスト以外ならエラーを返す
    if (ev.message.type !== 'text') {
        await client.replyMessage(ev.replyToken, {
            type: 'text',
            text: 'テキストでお願いします！'
        });
        return;
    };

    // プロフィールを検索
    const object = await idol.getIdolProfile(ev.message.text);

    // 返信
    await client.replyMessage(ev.replyToken, object);
};

// vercel
(process.env.NOW_REGION) ? module.exports = app : app.listen(PORT, () => {console.log(`Listening on ${PORT}`)});
