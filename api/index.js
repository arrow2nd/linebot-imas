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
    // 検証なら処理しない
    if (['00000000000000000000000000000000', 'ffffffffffffffffffffffffffffffff'].includes(ev.replyToken)) {
        console.log('success!');
        return;
    };
    
    let object = {};
    switch (ev.type) {
        case 'message':
            // テキスト以外は処理しない
            if (ev.message.type != "text") {
                console.log(`テキストではありません : ${ev.message.type}`);
                await replyText(ev.replyToken, '検索したいアイドルのお名前を教えてください…！')
                return;
            };
            object = await idol.getIdolProfile(ev.message.text);
            break;
        case 'postback':
            const date = ev.postback.params.date;
            object = await idol.getIdolProfile(date);
            break;
        default:
            console.log(`メッセージイベントではありません : ${ev.type}`);
            return;
    };
    
    // 返信
    await client.replyMessage(ev.replyToken, object);
};

/**
 * テキストメッセージを送信
 * 
 * @param {String} replyToken リプライトークン 
 * @param {String} text       送信するテキスト
 */
async function replyText(replyToken, text) {
    await client.replyMessage(replyToken, {
        type: 'text',
        text: text
    });
};

// vercel
(process.env.NOW_REGION) ? module.exports = app : app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});
