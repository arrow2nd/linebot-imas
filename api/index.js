'use strict';
const express = require('express');
const line = require('@line/bot-sdk');
const idol = require('./idol.js');
require('dotenv').config();

const PORT = process.env.PORT;
const config = {
    channelAccessToken: process.env.ACCESS_TOKEN,
    channelSecret: process.env.SECRET_KEY
};
const client = new line.Client(config);

// ルーティング
const app = express();
app.get('/', (_req, res) => res.send('ζ*\'ヮ\')ζ＜GETですー！'));
app.post('/hook/', line.middleware(config), async (req, res) => {
    await Promise.all(req.body.events.map(e => bot(e)));
    res.status(200).end();
});

/**
 * botメイン
 *
 * @param {Object} ev イベント
 */
async function bot(ev) {
    const tokenForVerification = [
        '00000000000000000000000000000000',
        'ffffffffffffffffffffffffffffffff'
    ]

    // 検証なら処理しない
    if (tokenForVerification.includes(ev.replyToken)) {
        console.log('success!');
        return;
    }

    // 検索文字列
    let keyword = '';

    switch (ev.type) {
        case 'message':
            // テキスト以外なら処理しない
            if (ev.message.type != "text") {
                console.log(`テキストではありません : ${ev.message.type}`);
                await client.replyMessage(ev.replyToken, {
                    type: 'text',
                    text: '検索したいアイドルのお名前を教えてください…！'
                });
                return;
            }
            keyword = ev.message.text;
            break;

        case 'postback':
            keyword = ev.postback.params.date;
            break;

        default:
            console.log(`メッセージイベントではありません : ${ev.type}`);
            return;
    }

    // 返信
    const object = await idol.getIdolProfile(keyword);
    await client.replyMessage(ev.replyToken, object);
}

// vercel
(process.env.NOW_REGION) ? module.exports = app : app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});
