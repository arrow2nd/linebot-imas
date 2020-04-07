'use strict';
const express = require('express');
const request = require('request');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 5000;
const config = {
  channelAccessToken: process.env.ACCESS_TOKEN,
  channelSecret: process.env.SECRET_KEY
};
const client = new line.Client(config);

express()
  .post('/hook/', line.middleware(config), (req, res) => lineBot(req, res))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

// LINEBot
function lineBot(req, res) {
  res.status(200).end();
  const events = req.body.events;
  for (let i = 0, l = events.length; i < l; i++) {
    const ev = events[i];
    // メッセージイベント以外、webhook検証ならreturn
    if (ev.type !== 'message' || ev.replyToken === '00000000000000000000000000000000') {
      console.log('メッセージイベントではありません');
      continue;
    }; 
    idol(ev);
  };
};

// 検索して返信
function idol(ev) {
  // テキスト以外ならreturn
  if (ev.message.type !== 'text') {
    return client.replyMessage(ev.replyToken, {
      type: 'text',
      text: 'テキストでお願いします…！'
    });
  };
  const text = ev.message.text;
  searchIdolProfile(text)
    .then((json) => createSendMessage(json))
    .then((flexMesseage) => {
      console.log(`ok! : ${text}`);
      return client.replyMessage(ev.replyToken, flexMesseage);
    })
    .catch((errorFlexMesseage) => {
      console.log(`NotFound : ${text}`);
      return client.replyMessage(ev.replyToken, errorFlexMesseage);
    });
};

// im@sparqlからプロフィールを取得
function searchIdolProfile (idolName) {
  return new Promise((resolve, reject) => {
    const query = `
    PREFIX schema: <http://schema.org/>
    PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
    SELECT DISTINCT ?data ?名前 ?名前ルビ ?ニックネーム ?ニックネームルビ ?テーマカラー ?所属 ?性別 ?年齢 ?身長 ?体重 ?B ?W ?H ?誕生日 ?星座 ?血液型 ?利き手 ?出身地 ?説明 (GROUP_CONCAT(distinct ?Favorite;separator=',') as ?好きなもの) (GROUP_CONCAT(distinct ?Hobby;separator=',') as ?趣味) ?CV 
    WHERE {
      {
        ?data rdfs:label ?名前 .
        OPTIONAL { ?data imas:nameKana ?名前ルビ . }
        OPTIONAL { ?data imas:alternateNameKana ?名前ルビ . }
        OPTIONAL { ?data imas:givenNameKana ?名前ルビ . }
        FILTER(CONTAINS(?名前, "${idolName}") || CONTAINS(?名前ルビ, "${idolName}")) .
      }
      OPTIONAL { ?data imas:Color ?テーマカラー . }
      OPTIONAL { ?data imas:Title ?所属 . }
      OPTIONAL { ?data schema:gender ?性別 . }
      OPTIONAL { ?data foaf:age ?年齢 . }
      OPTIONAL { ?data schema:height ?身長 . }
      OPTIONAL { ?data schema:weight ?体重 . }
      OPTIONAL { ?data imas:Bust ?B . }
      OPTIONAL { ?data imas:Waist ?W . }
      OPTIONAL { ?data imas:Hip ?H . }
      OPTIONAL { ?data schema:birthDate ?誕生日 . }
      OPTIONAL { ?data imas:Constellation ?星座 . }
      OPTIONAL { ?data imas:BloodType ?血液型 . }
      OPTIONAL { ?data imas:Handedness ?利き手 . }
      OPTIONAL { ?data schema:birthPlace ?出身地 . }
      OPTIONAL { ?data imas:Hobby ?Hobby . }
      OPTIONAL { ?data imas:Favorite ?Favorite . }
      OPTIONAL { ?data schema:description ?説明 . }
      OPTIONAL { ?data imas:cv ?CV . FILTER( lang(?CV) = 'ja' ) . }
    }GROUP BY ?data ?名前 ?名前ルビ ?ニックネーム ?ニックネームルビ ?テーマカラー ?所属 ?性別 ?年齢 ?身長 ?体重 ?B ?W ?H ?誕生日 ?星座 ?血液型 ?利き手 ?出身地 ?説明 ?CV LIMIT 5
    `;
    const url = `https://sparql.crssnky.xyz/spql/imas/query?output=json&query=${encodeURIComponent(query)}`;
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

// FlexMesseageを作成
function createSendMessage(json) {
  return new Promise((resolve, reject) => {
    const contents = [];
    // データがあるか確認
    if (!json.length){
      reject(errorMsg('見つかりませんでした', 'ごめんなさい…(´+ω+｀)'));
    };
    json.forEach((i, index) => {
      const profile = [];
      const keys = Object.keys(i);
      const name = i[keys[1]]['value'];
      const imageColor = (keys[3] === 'テーマカラー') ? `#${i[keys[3]]['value']}` : '#ff73cc';
      
      // 性別を日本語化する
      if (i['性別']) {
        i['性別']['value'] = i['性別']['value'] === 'female' ?  '女性' : '男性';
      };
      // 利き手を日本語化する
      if (i['利き手']) {
        i['利き手']['value'] = i['利き手']['value'] === 'right' ? '右利き' : (i['利き手']['value'] === 'left' ? '左利き' : '両利き');
      };
      // 誕生日のフォーマットを日本語形式にする
      if (i['誕生日']) {
        const month =Number(i['誕生日']['value'].substr(2,2));
        const day =Number(i['誕生日']['value'].substr(5,2));
        i['誕生日']['value'] =`${month}月${day}日`;
      };
      // それぞれのキーが存在するか確認して、単位を追加する
      const regex = /[a-zA-Z0-9!-/:-@¥[-`{-~]/mu;
      const chkKey =['年齢', '身長', '体重', '血液型'];
      const unit = ['歳', 'cm', 'kg', '型'];
      for (let j= 0; j < chkKey.length; j++) {
        if (i[chkKey[j]] && regex.test(i[chkKey[j]]['value'])) {
          i[chkKey[j]]['value'] += unit[j];
        };
      };

      // プロフィール情報のオブジェクト配列
      for (let j = 3; j < keys.length; j++) {
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
      // flexMesseageのJSON
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
              "text": i[keys[2]]['value'], // よみがな
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
              "contents": profile // プロフィールのオブジェクト配列
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
              "color": imageColor　// テーマカラー
            }
          ]
        }
      };
      contents.push(flexJsonData);
      
      // 完了を確認
      if (index === json.length - 1) {
        const result = {
          'type': 'flex',
          'altText': 'こちらが見つかりました！',
          'contents': {
            'type': 'carousel',
            'contents': contents
          }
        };
        resolve(result);
      };
    });
  });
};

// エラーメッセージ
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
            'color': '#666666',
            'margin': 'sm'
          }
        ]
      }
    }
  };
};
