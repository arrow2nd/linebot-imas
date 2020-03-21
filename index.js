const express = require('express');
const request = require('request');
const Q = require('q');
const line = require('@line/bot-sdk');

const PORT = process.env.PORT || 5000
const config = {
  channelAccessToken: process.env.ACCESS_TOKEN,
  channelSecret: process.env.SECRET_KEY
}
const client = new line.Client(config)

express()
  .post('/hook/', line.middleware(config), (req, res) => lineBot(req, res)) // webhook
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

// リクエスト受付
function lineBot(req, res) {
  res.status(200).end()
  const events = req.body.events
  const promises = []
  for (let i = 0, l = events.length; i < l; i++) {
    const ev = events[i]
    promises.push(
      idol(ev)
    )
  }
  Promise.all(promises).then(console.log('pass')) // ログ
}

// 検索
async function idol(ev) {
  const text = ev.message.text;
  // テキスト以外ならreturn
  if (ev.message.type !== 'text') {
    return client.replyMessage(ev.replyToken, {
      type: 'text',
      text: 'テキストでお願いします…！'
    });
  };
  // 受け取ったテキストから検索クエリを作成
  const query = `
  PREFIX schema: <http://schema.org/>
  PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
  SELECT DISTINCT ?名前 ?名前ルビ ?ニックネーム ?ニックネームルビ ?テーマカラー ?シリーズ名 ?性別 ?年齢 ?身長 ?体重 ?B ?W ?H ?誕生日 ?星座 ?血液型 ?利き手 ?出身地 ?説明 (GROUP_CONCAT(distinct ?Favorite;separator=",") as ?好きなもの) (GROUP_CONCAT(distinct ?Hobby;separator=",") as ?趣味) ?CV 
  WHERE {
    { ?data schema:name ?名前 . FILTER( lang(?名前) = 'ja' ) .
      ?data imas:nameKana ?名前ルビ .
      FILTER(CONTAINS(?名前, "${text}") || CONTAINS(?名前ルビ, "${text}")) .
    } UNION {
      ?data schema:alternateName ?ニックネーム . FILTER( lang(?ニックネーム) = 'ja' ) .
      ?data imas:alternateNameKana ?ニックネームルビ .
      FILTER(CONTAINS(?ニックネーム, "${text}") || CONTAINS(?ニックネームルビ, "${text}")) .
    }
    OPTIONAL { ?data imas:Color ?テーマカラー . }
    OPTIONAL { ?data imas:Title ?シリーズ名 . }
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
  }GROUP BY ?名前 ?名前ルビ ?ニックネーム ?ニックネームルビ ?テーマカラー ?シリーズ名 ?性別 ?年齢 ?身長 ?体重 ?B ?W ?H ?誕生日 ?星座 ?血液型 ?利き手 ?出身地 ?説明 ?CV LIMIT 5
  `;
  const url = `https://sparql.crssnky.xyz/spql/imas/query?output=json&query=${encodeURIComponent(query)}`;
 
  Q.when(url)
    // クエリを投げてJSONを受け取る
    .then((url) => {
      var d = Q.defer();
      request.get(url, (err, res, body) => {
        const json = JSON.parse(body)['results']['bindings'];
        d.resolve(json);
      });
      return d.promise;
    })
    // JSONを解析
    .then((json) => {
      var d = Q.defer();
      const contents = [];
      // データがあるか確認
      if (!json.length) {
        console.log(`${text} : Not Found`);
        contents.push(errorMsg());
        d.resolve(contents); // (?)
      } else {
        json.forEach((i, index) => {
          const profile = [];
          const keys = Object.keys(i)
          const name = i[keys[0]]['value'];
          const imageColor = (keys[2] === 'テーマカラー') ? `#${i[keys[2]]['value']}` : '#ff8c75';
          
          // プロフィール情報のオブジェクト配列を作る
          for (let j = 3; j < keys.length; j++) {
            const profValue = i[keys[j]]['value'];
            // プロフィール情報
            const profileContents = {
              "type": "box",
              "layout": "baseline",
              "contents": [
                {
                  "type": "text",
                  "text": keys[j],
                  "size": "sm",
                  "color": "#aaaaaa",
                  "flex": 3
                },
                {
                  "type": "text",
                  "text": profValue,
                  "wrap": true,
                  "size": "sm",
                  "flex": 5,
                  "color": "#666666"
                }
              ],
              "spacing": "sm"
            };
            // 追加
            profile.push(profileContents);
          }
          
          // Flex MessageのJSONデータを作る
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
                  "color": "#aaaaaa"
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
          }
          
          // オブジェクト配列に追加
          contents.push(flexJsonData);
          
          // 完了を確認
          if (index === json.length - 1) {
            console.log(`${text}から${index + 1}件のプロフィールを取得`);
            d.resolve(contents);
          };
        });
      }
      return d.promise;
    })
    // 結果を返信
    .done((contents) => {
      if (!contents) {
        console.log('コンテンツが空です');
        contents.push(errorMsg());
      };
      return client.replyMessage(ev.replyToken, {
        "type": "flex",
        "altText": "こちらが見つかりました！",
        "contents": {
          "type": "carousel",
          "contents": contents
        }
      });
    });
};

// 見つからなかったメッセージ
function errorMsg() {
  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "weight": "bold",
          "size": "md",
          "text": "見つかりませんでした。"
        },
        {
          "type": "text",
          "text": "ごめんなさい…(´+ω+｀)",
          "size": "xs",
          "color": "#aaaaaa",
          "margin": "sm"
        }
      ]
    }
  }
};