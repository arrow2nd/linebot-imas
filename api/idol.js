'use strict';
const request = require('request');

/**
 * アイドルのプロフィールを取得
 * @param  {String} text 検索キーワード
 * @return {Object}      flexMessage
 */
async function getIdolProfile(text){
    let mode = 0;
    let profile;
    let flexMessage;
    
    // 誕生日検索をするか
    if (text.match(/誕生日/)) {
        mode = text.match(/明日/) ? 3 : text.match(/昨日/) ? 1 : 2;
    };

    // プロフィールを検索
    try {
        profile = await search(mode, text);
    } catch(err) {
        return err;
    };
    
    // flexMessageを作成
    try {
        flexMessage = await createMessage(profile);
    } catch(err) {
        console.log('NotFound');
        return err;
    };

    // 取得したプロフィールを返信
    console.log('success!');
    return flexMessage;
};

/**
 * プロフィールを検索
 * @param  {Number} mode 0: 名前検索/1: 昨日が誕生日/2: 今日が誕生日/3: 明日が誕生日
 * @param  {String} word 検索ワード
 * @return {Object}      成功時: プロフィールデータ/失敗時: LINEflexMessage
 */
function search(mode, word) {
    return new Promise((resolve, reject) => {
        // 検索条件を指定
        let searchCriteria = '';
        if (mode === 0) {
            searchCriteria = `?data rdfs:label ?名前;rdf:type ?type.FILTER(?type IN (imas:Idol,imas:Staff)).OPTIONAL{?data imas:nameKana ?名前ルビ.}OPTIONAL{?data imas:alternateNameKana ?名前ルビ.}OPTIONAL{?data imas:givenNameKana ?名前ルビ.}FILTER(CONTAINS(?名前,"${word}")||CONTAINS(?名前ルビ,"${word}")).`;
        } else {
            const date = new Date();
            mode = mode - 2;
            const mon = ('00' + (date.getMonth() + 1)).slice(-2);
            const day = ('00' + (date.getDate() + mode)).slice(-2);
            const nowDate = `${mon}-${day}`;
            searchCriteria = `?data rdfs:label ?名前;rdf:type ?type;schema:birthDate ?BD.FILTER(?type IN (imas:Idol,imas:Staff)).FILTER(regex(str(?BD),"${nowDate}")).OPTIONAL{?data imas:nameKana ?名前ルビ.}OPTIONAL{?data imas:alternateNameKana ?名前ルビ.}OPTIONAL{?data imas:givenNameKana ?名前ルビ.}`;
        };

        // クエリ(ながい)
        const query = `
        PREFIX schema: <http://schema.org/>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
        SELECT DISTINCT ?名前 ?名前ルビ ?ニックネーム ?ニックネームルビ ?所属 ?性別 ?年齢 ?身長 ?体重 ?B ?W ?H ?誕生日 ?星座 ?血液型 ?利き手 ?出身地 (GROUP_CONCAT(distinct ?Favorite;separator=',') as ?好きなもの) (GROUP_CONCAT(distinct ?Hobby;separator=',') as ?趣味) ?説明 ?カラー ?CV
        WHERE { ${searchCriteria}
        OPTIONAL {?data imas:Title ?所属.}
        OPTIONAL {?data schema:gender ?性別.}
        OPTIONAL {?data foaf:age ?年齢.}
        OPTIONAL {?data schema:height ?身長.}
        OPTIONAL {?data schema:weight ?体重.}
        OPTIONAL {?data imas:Bust ?B.}
        OPTIONAL {?data imas:Waist ?W.}
        OPTIONAL {?data imas:Hip ?H.}
        OPTIONAL {?data schema:birthDate ?誕生日.}
        OPTIONAL {?data imas:Constellation ?星座.}
        OPTIONAL {?data imas:BloodType ?血液型.}
        OPTIONAL {?data imas:Handedness ?利き手.}
        OPTIONAL {?data schema:birthPlace ?出身地.}
        OPTIONAL {?data imas:Hobby ?Hobby.}
        OPTIONAL {?data imas:Favorite ?Favorite.}
        OPTIONAL {?data schema:description ?説明.}
        OPTIONAL {?data imas:Color ?カラー.}
        OPTIONAL {?data imas:cv ?CV.FILTER(lang(?CV)='ja').}
        }GROUP BY ?名前 ?名前ルビ ?ニックネーム ?ニックネームルビ ?所属 ?性別 ?年齢 ?身長 ?体重 ?B ?W ?H ?誕生日 ?星座 ?血液型 ?利き手 ?出身地 ?説明 ?カラー ?CV LIMIT 5`;
        
        // URL
        const url = `https://sparql.crssnky.xyz/spql/imas/query?output=json&query=${encodeURIComponent(query)}`;
        // imasparqlにアクセス
        request.get(url, (err, res, body) => {
            if (!err && res.statusCode === 200) {
                const data = JSON.parse(body).results.bindings;
                resolve(data);
            } else {
                console.error('Error: im@sparqlにアクセスできませんでした');
                reject(errorMsg('検索できませんでした', '現在im@sparqlにアクセスできない状況です'));
            };
        });
    });
};

/**
 * flexMessageをつくる
 * @param  {Object} profileData 取得したプロフィールデータ
 * @return {Object}             flexMessage
 */
function createMessage(profileData){
    return new Promise((resolve, reject) => {
        let contents = [];
        // 検索結果が無い場合
        if (!profileData.length) {
            reject(errorMsg('みつかりませんでした…', 'ワードを変えるとみつかるかもしれません'));
        };
        // flexMessageをつくる
        for (let data of profileData){
            let profile = [];
            const name = data.名前.value;
            const colorCode = (data.カラー) ? `#${data.カラー.value}` : '#ff73cc';
            // 読みやすい表現に変換
            data = conversion(data);
            // プロフィール内容
            for (let key in data){
                // スキップ
                if (key == '名前' || key == '名前ルビ'){
                    continue;
                };
                const profileContents = {
                    "type": "box",
                    "layout": "baseline",
                    "contents": [
                      {
                        "type": "text",
                        "text": key,
                        "size": "sm",
                        "color": "#949494",
                        "flex": 2
                      },
                      {
                        "type": "text",
                        "text": data[key].value,
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
            // flexMessage
            const flexMessage = {
                "type": "bubble",
                "size": "mega",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": name,
                            "size": "xl"
                        },
                        {
                            "type": "text",
                            "text": data.名前ルビ.value,
                            "size": "xs",
                            "color": "#949494"
                        },
                        {
                            "type": "separator",
                            "margin": "md"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": profile,
                            "margin": "lg"
                        }
                    ],
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "button",
                            "action": {
                                "type": "uri",
                                "label": "Googleで検索！",
                                "uri": `http://www.google.co.jp/search?hl=ja&source=hp&q=${encodeURIComponent(`アイドルマスター ${name}`)}`
                            },
                            "style": "primary",
                            "color": colorCode
                        }
                    ]
                }
            };
            contents.push(flexMessage);
        };
        // オブジェクトを返す
        const result = {
            'type': 'flex',
            'altText': `${profileData.length}件みつかりました！`,
            'contents': {
                'type': 'carousel',
                'contents': contents
            }
        };
        resolve(result);
    });
};

/**
 * 読みやすい表現に変換
 * @param  {Object} data プロフィールデータ
 * @return {Object}      変換後のプロフィールデータ
 */
function conversion(data){
    // 作品名を変換
    const series = {
        'CinderellaGirls': '346Pro (CinderellaGirls)',
        '1st Vision': '765Pro (旧プロフィール)',
        'DearlyStars': '876Pro (DearlyStars)',
        '315ProIdols': '315Pro (SideM)',
        'MillionStars': '765Pro (MillionLive!)',
        '283Pro': '283Pro (ShinyColors)',
        '765AS': '765Pro (IDOLM@STER)',
        '961ProIdols': '961Pro (IDOLM@STER)',
        '1054Pro': '1054Pro (IDOLM@STER)'
    };
    if (data.所属){
        const title = series[data.所属.value];
        data.所属.value = (title) ? title : data.所属.value;
    };
    
    // 性別を日本語に変換
    const gender = {
        male: '男性',
        female: '女性'
    };
    if (data.性別) {
        const jp = gender[data.性別.value];
        data.性別.value = (jp) ? jp : '不明';
    };

    // 利き手を日本語に変換
    const handedness = {
        right: '右利き',
        left: '左利き',
        both: '両利き'
    };
    if (data.利き手) {
        const jp = handedness[data.利き手.value];
        data.利き手.value = (jp) ? jp : '不明';
    };

    // 誕生日のフォーマットを日本語形式に変換
    if (data.誕生日) {
        const month = Number(data.誕生日.value.substr(2, 2));
        const day = Number(data.誕生日.value.substr(5, 2));
        data.誕生日.value = `${month}月${day}日`;
    };

    // 単位を追加
    const regex = /[a-zA-Z0-9!-/:-@¥[-`{-~]/mu;
    const chkKey = ['年齢', '身長', '体重', '血液型'];
    const unit = ['歳', 'cm', 'kg', '型'];
    for (let i = 0; i < chkKey.length; i++) {
        if (data[chkKey[i]] && regex.test(data[chkKey[i]].value)) {
            data[chkKey[i]].value += unit[i];
        };
    };

    //カラーコードに#をつける
    if (data.カラー){
        data.カラー.value = `#${data.カラー.value}`;
    };

    return data;
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

module.exports = {
    getIdolProfile
};
