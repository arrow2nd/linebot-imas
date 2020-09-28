'use strict';
const request = require('request');
require('dotenv').config();

/**
 * Slackへテキストを送信
 * 
 * @param {String} text テキスト
 */
function send(text) {
    const payload = {
        "username": "linebot-imas",
        "icon_url": "https://arrow2nd.github.io/images/img/linebot-imas.png",
        "text": `${text}\n<${process.env.LOG_URL}|くわしく>`
    };
    const options = {
        url: process.env.SLACK_WEBHOOK_URL,
        form: `payload=${JSON.stringify(payload)}`,
    };
    request.post(options, (err, res) => {
        if (!err && res.statusCode != 200) {
            console.error(err);
        };
    });
};

module.exports = { send };
