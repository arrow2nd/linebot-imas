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

// webhook受け付け
express()
    .post('/hook/', line.middleware(config), (req, res) => lineBot(req, res))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));


/**
 * Botメイン
 * @param {Object} req リクエスト
 * @param {Object} res レスポンス
 */
async function lineBot(req, res){
    // 200番を返しておく
    res.status(200).end();
    const events = req.body.events;
    for (let ev of events){
        // メッセージイベント以外、webhook検証の場合はreturn
        if (ev.type !== 'message' || ev.replyToken === '00000000000000000000000000000000' || ev.replyToken === 'ffffffffffffffffffffffffffffffff') {
            console.log(`メッセージイベントではありません : ${ev.type}`);
            continue;
        };
        await reply(ev);
    };
};

/**
 * 返信
 * @param {Object} ev イベント
 */
async function reply(ev){
    // テキスト以外の場合はretrun
    if (ev.message.type !== 'text') {
        client.replyMessage(ev.replyToken, {
          type: 'text',
          text: 'テキストでお願いします…（·□·；）'
        });
        return;
    };
    // メッセージテキストを取得
    const text = ev.message.text;
    const object = await idol.getIdolProfile(text);
    client.replyMessage(ev.replyToken, object);
};
