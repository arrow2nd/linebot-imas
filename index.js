'use strict';
const express = require('express');
const request = require('request');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 5000;
const config = {
  channelAccessToken: process.env.ACCESS_TOKEN || 'xxx',
  channelSecret: process.env.SECRET_KEY || 'xxx'
};
const client = new line.Client(config);

express()
  .post('/hook/', line.middleware(config), (req, res) => lineBot(req, res))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

/**
 * LINEBotメイン
 * @param {Object} req requestオブジェクト
 * @param {Object} res responseオブジェクト
 */
function lineBot(req, res) {
  res.status(200).end();
  const events = req.body.events;
  for (let i = 0, l = events.length; i < l; i++) {
    const ev = events[i];
    // メッセージイベント以外、webhook検証ならreturn
    if (ev.type !== 'message' || ev.replyToken === '00000000000000000000000000000000' || ev.replyToken === 'ffffffffffffffffffffffffffffffff') {
      console.log(`メッセージイベントではありません : ${ev.type}`);
      continue;
    }; 
    searchIdol(ev);
  };
};

/**
 * プロフィールを検索して返信
 * @param {Object} ev イベントオブジェクト
 */
function searchIdol(ev) {
  // テキスト以外ならreturn
  if (ev.message.type !== 'text') {
    client.replyMessage(ev.replyToken, {
      type: 'text',
      text: 'テキストでお願いします…！'
    });
    return;
  };

  const text = ev.message.text;

  // 検索条件指定
  let mode = 0;
  if (text.match(/誕生日/)) {
    mode = text.match(/明日/) ? 3 : text.match(/昨日/) ? 1 : 2;
  };

  // 検索して結果を返信
  searchIdolProfile(mode, text)
    .then((json) => createSendMessage(json))
    .then((flexMesseage) => {
      console.log('ok!');
      client.replyMessage(ev.replyToken, flexMesseage);
    })
    .catch((errorFlexMesseage) => {
      console.log('NotFound');
      client.replyMessage(ev.replyToken, errorFlexMesseage);
    });
};

/**
 * imasparqlからプロフィールを取得
 * @param  {Number} mode     検索モード(0:名前検索/1:昨日が誕生日/2:今日が誕生日/3:明日が誕生日)
 * @param  {String} idolName アイドル名
 * @return {Object}          オブジェクトに変換したJSON
 */
function searchIdolProfile (mode, idolName) {
  return new Promise((resolve, reject) => {
    // 検索条件を指定
    let searchCriteria = '';
    if (mode === 0){
      searchCriteria = `?data rdfs:label ?名前;rdf:type ?type.FILTER(?type IN (imas:Idol,imas:Staff)).OPTIONAL{?data imas:nameKana ?名前ルビ.}OPTIONAL{?data imas:alternateNameKana ?名前ルビ.}OPTIONAL{?data imas:givenNameKana ?名前ルビ.}FILTER(CONTAINS(?名前,"${idolName}")||CONTAINS(?名前ルビ,"${idolName}")).`;
    } else {
      const date = new Date();
      mode = mode - 2;
      const mon = ('00' + (date.getMonth() + 1)).slice(-2);
      const day = ('00' + (date.getDate() + mode)).slice(-2);
      const nowDate = `${mon}-${day}`;
      searchCriteria = `?data rdfs:label ?名前;schema:birthDate ?BD.FILTER(regex(str(?BD),"${nowDate}")).OPTIONAL{?data imas:nameKana ?名前ルビ.}OPTIONAL{?data imas:alternateNameKana ?名前ルビ.}OPTIONAL{?data imas:givenNameKana ?名前ルビ.}`;
    };

    // クエリを作成
    const query = `
    PREFIX schema: <http://schema.org/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
    SELECT DISTINCT ?名前 ?名前ルビ ?ニックネーム ?ニックネームルビ ?テーマカラー ?所属 ?性別 ?年齢 ?身長 ?体重 ?B ?W ?H ?誕生日 ?星座 ?血液型 ?利き手 ?出身地 (GROUP_CONCAT(distinct ?Favorite;separator=',') as ?好きなもの) (GROUP_CONCAT(distinct ?Hobby;separator=',') as ?趣味) ?説明 ?CV 
    WHERE {
      {${searchCriteria}}
      OPTIONAL { ?data imas:Color ?テーマカラー. }
      OPTIONAL { ?data imas:Title ?所属. }
      OPTIONAL { ?data schema:gender ?性別. }
      OPTIONAL { ?data foaf:age ?年齢. }
      OPTIONAL { ?data schema:height ?身長. }
      OPTIONAL { ?data schema:weight ?体重. }
      OPTIONAL { ?data imas:Bust ?B. }
      OPTIONAL { ?data imas:Waist ?W. }
      OPTIONAL { ?data imas:Hip ?H. }
      OPTIONAL { ?data schema:birthDate ?誕生日. }
      OPTIONAL { ?data imas:Constellation ?星座. }
      OPTIONAL { ?data imas:BloodType ?血液型. }
      OPTIONAL { ?data imas:Handedness ?利き手. }
      OPTIONAL { ?data schema:birthPlace ?出身地. }
      OPTIONAL { ?data imas:Hobby ?Hobby. }
      OPTIONAL { ?data imas:Favorite ?Favorite. }
      OPTIONAL { ?data schema:description ?説明. }
      OPTIONAL { ?data imas:cv ?CV. FILTER( lang(?CV) = 'ja' ). }
    }GROUP BY ?名前 ?名前ルビ ?ニックネーム ?ニックネームルビ ?テーマカラー ?所属 ?性別 ?年齢 ?身長 ?体重 ?B ?W ?H ?誕生日 ?星座 ?血液型 ?利き手 ?出身地 ?説明 ?CV LIMIT 5
    `;
    const url = `https://sparql.crssnky.xyz/spql/imas/query?output=json&query=${encodeURIComponent(query)}`;

    // im@sparqlにアクセス
    request.get(url, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        const json = JSON.parse(body)['results']['bindings'];
        resolve(json);
      } else {
        console.error(`im@sparqlにアクセスできませんでした : ${res.statusCode}`);
        reject(errorMsg('検索できませんでした', 'im@sparqlにアクセスできません…(ﾟﾛﾟ;)'));
      };
    });
  });
};

/**
 * FlexMesseageのオブジェクトを作成
 * @param  {Object} data オブジェクトに変換したJSON
 * @return {Object}      FlexMesseageのオブジェクト
 */
function createSendMessage(data) {
  return new Promise((resolve, reject) => {
    const contents = [];

    // データがあるか確認
    if (!data.length){
      reject(errorMsg('みつかりませんでした', 'ごめんなさい…(´+ω+｀)'));
    };

    // プロフィール情報を整形
    data.forEach((i) => {
      const profile = [];
      const keys = Object.keys(i);
      const name = i[keys[0]]['value'];
      const imageColor = (keys[2] === 'テーマカラー') ? `#${i[keys[2]]['value']}` : '#ff73cc';

      // 性別を日本語に変換
      if (i['性別']) {
        i['性別']['value'] = (i['性別']['value'] === 'female') ? '女性' : '男性';
      };

      // 利き手を日本語に変換
      if (i['利き手']) {
        i['利き手']['value'] = (
            (i['利き手']['value'] === 'right') ? '右利き'
          : (i['利き手']['value'] === 'left')  ? '左利き'
          : '両利き'
        );
      };

      // 誕生日のフォーマットを日本語形式に変換
      if (i['誕生日']) {
        const month =Number(i['誕生日']['value'].substr(2,2));
        const day =Number(i['誕生日']['value'].substr(5,2));
        i['誕生日']['value'] =`${month}月${day}日`;
      };

      // 単位を追加
      const regex = /[a-zA-Z0-9!-/:-@¥[-`{-~]/mu;
      const chkKey =['年齢', '身長', '体重', '血液型'];
      const unit = ['歳', 'cm', 'kg', '型'];
      for (let j= 0; j < chkKey.length; j++) {
        if (i[chkKey[j]] && regex.test(i[chkKey[j]]['value'])) {
          i[chkKey[j]]['value'] += unit[j];
        };
      };

      // プロフィール内容
      for (let j = 2; j < keys.length; j++) {
        const profValue = i[keys[j]]['value'];
        if (keys[j] === 'テーマカラー') continue;
        const profileContents = {
          "type": "box",
          "layout": "baseline",
          "contents": [
            {
              "type": "text",
              "text": keys[j],
              "size": "sm",
              "color": "#949494",
              "flex": 2
            },
            {
              "type": "text",
              "text": profValue,
              "wrap": true,
              "size": "sm",
              "flex": 4,
              "color": "#666666"
            }
          ],
          "spacing": "sm"
        };
        profile.push(profileContents);
      };

      // flexMesseageのオブジェクト
      const flexJsonData = {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": name, //名前
              "weight": "bold",
              "size": "xl"
            },
            {
              "type": "text",
              "text": i[keys[1]]['value'], // よみがな
              "size": "xs",
              "color": "#949494"
            },
            {
              "type": "separator",
              "margin": "sm"
            },
            {
              "type": "box",
              "layout": "vertical",
              "contents": profile // プロフィール内容
            }
          ],
              "margin": "lg",
              "spacing": "sm"
        },
        "footer": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "uri",
                "label": "Googleで検索",
                "uri": `http://www.google.co.jp/search?hl=ja&source=hp&q=${encodeURIComponent(`アイドルマスター ${name}`)}`
              },
              "style": "primary",
              "color": imageColor // テーマカラー
            }
          ]
        }
      };
      contents.push(flexJsonData);
    });
    // オブジェクトを返す
    const result = {
      'type': 'flex',
      'altText': `${data.length}件みつかりました！`,
      'contents': {
        'type': 'carousel',
        'contents': contents
      }
    };
    resolve(result);
  });
};

/**
 * エラーメッセージ
 * @param  {String} title タイトル
 * @param  {String} msg   エラー内容
 * @return {Object}       メッセージオブジェクト
 */
function errorMsg(title, msg) {
  return {
    'type': 'flex',
    'altText': title,
    'contents': {
      'type': 'bubble',
      'body': {
        'type': 'box',
        'layout': 'vertical',
        'contents': [
          {
            'type': 'text',
            'weight': 'bold',
            'size': 'md',
            'text': title
          },
          {
            'type': 'text',
            'text': msg,
            'size': 'xs',
            'color': '#949494',
            'margin': 'sm'
          }
        ]
      }
    }
  };
};
