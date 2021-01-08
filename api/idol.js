'use strict';
const axios = require('axios');
const moment = require('moment-timezone');
const imageURLCache = require('../cache/image_filename.json');

/**
 * プロフィールを検索
 *
 * @param  {String} text メッセージテキスト
 * @return {Object}      flexMessage
 */
async function Search(text) {
    // 検索文字列を作成
    const keyword = createSearchKeyword(text);
    
    // 検索
    try {
        const data = await getIdolProfile(keyword);
        return createFlexMessage(data);
    } catch (err) {
        console.log(err);
        return createErrorMessage('検索できませんでした', 'im@sparqlにアクセスできません');
    }
}

/**
 * 検索文字列を作成
 *
 * @param  {String} text メッセージテキスト
 * @return {String}      検索文字列
 */
function createSearchKeyword(text) {
    // 改行と空白を削除
    text = text.trim().replace(/[\n\s]/g, '');

    // 誕生日検索かチェック
    if (/誕生日/.test(text)) {
        const addNum = (/明日/.test(text)) ? 1
            : (/昨日/.test(text)) ? -1
            : 0;
        return moment().add(addNum, 'days').tz('Asia/Tokyo').format('MM-DD');
    }

    // メッセージが日付かチェック
    for (let format of ['YYYY-MM-DD', 'M月D日']) {
        let date = moment(text, format, true);
        if (date.isValid()) return date.format('MM-DD');
    }

    return text;
}

/**
 * imasparqlからプロフィールを取得
 *
 * @param  {String} keyword 検索文字列
 * @return {Object}         検索結果
 */
async function getIdolProfile(keyword) {
    // MM-DD形式なら誕生日検索、それ以外なら通常検索
    const filterQuery = [
        `rdf:type ?type;schema:birthDate ?BD.FILTER(?type IN (imas:Idol,imas:Staff)).FILTER(regex(str(?BD),"${keyword}")).OPTIONAL{?data imas:nameKana ?名前ルビ.}OPTIONAL{?data imas:alternateNameKana ?名前ルビ.}OPTIONAL{?data imas:givenNameKana ?名前ルビ.}`,
        `rdf:type ?type.FILTER(?type IN (imas:Idol,imas:Staff)).OPTIONAL{?data schema:name ?本名.}OPTIONAL{?data imas:nameKana ?名前ルビ.}OPTIONAL{?data imas:alternateNameKana ?名前ルビ.}OPTIONAL{?data imas:givenNameKana ?名前ルビ.}FILTER(CONTAINS(?名前,"${keyword}")||CONTAINS(?本名,"${keyword}")||CONTAINS(?名前ルビ,"${keyword}")).`
    ];
    const searchCriteria = (/^\d{1,2}-\d{1,2}/.test(keyword)) ? filterQuery[0] : filterQuery[1];

    // クエリ
    const query = `PREFIX schema: <http://schema.org/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT DISTINCT ?名前 ?名前ルビ ?所属 ?性別 ?年齢 ?身長 ?体重 ?BWH ?誕生日 ?星座 ?血液型 ?利き手 ?出身地 (GROUP_CONCAT(DISTINCT ?hobby;separator=',') as ?趣味) (GROUP_CONCAT(DISTINCT ?favorite;separator=',') as ?好きなもの) ?説明 ?カラー ?CV ?URL
    WHERE {?data rdfs:label ?名前;
    ${searchCriteria}
    OPTIONAL {?data imas:Title ?所属.}
    OPTIONAL {?data schema:gender ?性別.}
    OPTIONAL {?data foaf:age ?年齢.}
    OPTIONAL {?data schema:height ?身長.}
    OPTIONAL {?data schema:weight ?体重.}
    OPTIONAL {?data imas:Bust ?B; imas:Waist ?W; imas:Hip ?H. BIND(CONCAT(str(?B),"/",str(?W),"/",str(?H)) as ?BWH)}
    OPTIONAL {?data schema:birthDate ?誕生日.}
    OPTIONAL {?data imas:Constellation ?星座.}
    OPTIONAL {?data imas:BloodType ?血液型.}
    OPTIONAL {?data imas:Handedness ?利き手.}
    OPTIONAL {?data schema:birthPlace ?出身地.}
    OPTIONAL {?data imas:Hobby ?hobby.}
    OPTIONAL {?data imas:Favorite ?favorite.}
    OPTIONAL {?data schema:description ?説明.}
    OPTIONAL {?data imas:Color ?color. BIND(CONCAT("#",str(?color)) as ?カラー)}
    OPTIONAL {?data imas:cv ?CV. FILTER(lang(?CV)='ja').}
    OPTIONAL {?data imas:IdolListURL ?URL}
    } GROUP BY ?名前 ?名前ルビ ?所属 ?性別 ?年齢 ?身長 ?体重 ?BWH ?誕生日 ?星座 ?血液型 ?利き手 ?出身地 ?説明 ?カラー ?CV ?URL
    LIMIT 5`;

    const url = `https://sparql.crssnky.xyz/spql/imas/query?output=json&query=${encodeURIComponent(query)}`;

    try {
        const res = await axios.get(url);
        const data = res.data.results.bindings;
        return data;
    } catch (err) {
        throw new Error(`[Error] im@sparqlにアクセスできません (${err.response.statusText} : ${err.response.status})`);
    }
}

/**
 * flexMessageを作成
 *
 * @param  {Object} data 検索結果
 * @return {Object}      flexMessage
 */
function createFlexMessage(data) {
    // データが無い場合はエラー
    if (!data.length) {
        return createErrorMessage('みつかりませんでした…', 'ごめんなさい！');
    }
    
    // カルーセル作成
    let carousel = [];
    for (let profile of data) {
        let component = [];

        // プロフィールデータを調整
        profile = editProfileData(profile);

        // プロフィールのコンポーネントを作成
        for (let key in profile) {
            if (['名前', '名前ルビ', '所属', 'URL'].includes(key)) continue;
            component.push(createTextComponent(key, profile[key].value));
        }

        // バブルを作成してカルーセルに追加
        carousel.push(createBubble(profile, component));
    }

    const flexMsg = {
        'type': 'flex',
        'altText': `${data.length}人みつかりました！`,
        'contents': {
            'type': 'carousel',
            'contents': carousel
        }
    };

    return flexMsg;
}

/**
 * プロフィールデータを調整
 *
 * @param  {Object} profile プロフィールデータ
 * @return {Object}         編集後のプロフィールデータ
 */
function editProfileData(profile) {
    // 各種データ
    const convert = {
        series: {
            'CinderellaGirls': '346Pro (CinderellaGirls)',
            '1st Vision': '765Pro (旧プロフィール)',
            'DearlyStars': '876Pro (DearlyStars)',
            '315ProIdols': '315Pro (SideM)',
            'MillionStars': '765Pro (MillionLive!)',
            '283Pro': '283Pro (ShinyColors)',
            '765AS': '765Pro (IDOLM@STER)',
            '961ProIdols': '961Pro (IDOLM@STER)',
            '1054Pro': '1054Pro (IDOLM@STER)'
        },
        gender: {
            male: '男性',
            female: '女性'
        },
        handedness: {
            right: '右利き',
            left: '左利き',
            both: '両利き'
        },
        addUnit: [
            {
                key: '年齢',
                unit: '歳'
            },
            {
                key: '身長',
                unit: 'cm'
            },
            {
                key: '体重',
                unit: 'kg'
            },
            {
                key: '血液型',
                unit: '型'
            }
        ]
    };

    // シリーズ名
    if (profile.所属) {
        const title = convert.series[profile.所属.value];
        profile.所属.value = (title) ? title : profile.所属.value;
    }

    // 性別
    if (profile.性別) {
        const jp = convert.gender[profile.性別.value];
        profile.性別.value = (jp) ? jp : '不明';
    }

    // 利き手
    if (profile.利き手) {
        const jp = convert.handedness[profile.利き手.value];
        profile.利き手.value = (jp) ? jp : '不明';
    }

    // 誕生日のフォーマット
    if (profile.誕生日) {
        profile.誕生日.value = moment(profile.誕生日.value, '-MM-DD').format('M月D日');
    }

    // 単位を追加
    for (let i = 0; i < convert.addUnit.length; i++) {
        const chkKey = convert.addUnit[i].key;
        if (profile[chkKey] && /[a-zA-Z0-9?]/.test(profile[chkKey].value)) {
            profile[chkKey].value += convert.addUnit[i].unit;
        }
    }

    return profile;
}

/**
 * バブルを作成
 *
 * @param  {Object} profile   プロフィールデータ
 * @param  {Array}  component プロフィールのコンポーネント
 * @return {Object}           バブル
 */
function createBubble(profile, component) {
    const name = profile.名前.value;
    const subText = (profile.所属) ? `${profile.名前ルビ.value}・${profile.所属.value}` : profile.名前ルビ.value;
    const imageURL = getImageURLFromCache(profile.名前.value);
    const footer = createFooter(profile);
    const bubble = {
        'type': 'bubble',
        'size': 'mega',
        'body': {
            'type': 'box',
            'layout': 'vertical',
            'contents': [
                {
                    'type': 'image',
                    'url': imageURL,
                    'size': 'full',
                    'aspectMode': 'cover',
                    'aspectRatio': '16:9',
                    'gravity': 'center'
                },
                {
                    'type': 'image',
                    'url': 'https://arrow2nd.github.io/images/img/gradation.png',
                    'size': 'full',
                    'aspectMode': 'cover',
                    'aspectRatio': '16:9',
                    'position': 'absolute'
                },
                {
                    'type': 'box',
                    'layout': 'vertical',
                    'contents': [
                        {
                            'type': 'text',
                            'text': name,
                            'size': 'xl',
                            'color': '#ffffff',
                            'weight': 'bold'
                        },
                        {
                            'type': 'text',
                            'text': subText,
                            'size': 'xs',
                            'color': '#ffffff'
                        }
                    ],
                    'position': 'absolute',
                    'offsetTop': '110px',
                    'paddingStart': '15px'
                },
                {
                    'type': 'box',
                    'layout': 'vertical',
                    'contents': component,
                    'paddingStart': '15px',
                    'paddingTop': '15px',
                    'paddingBottom': '10px',
                    'paddingEnd': '15px'
                }
            ],
            'paddingAll': '0px'
        },
        'footer': {
            'type': 'box',
            'layout': 'vertical',
            'contents': footer
        }
    };

    return bubble;
}

/**
 * 画像URLをキャッシュから取得
 * 
 * @param  {String} name アイドル名
 * @return {String}      URL文字列
 */
function getImageURLFromCache(name) {
    const noImage = 'https://arrow2nd.github.io/images/img/noimage.png';
    const fileName = imageURLCache[name];

    return fileName
        ? `https://idollist.idolmaster-official.jp/images/character_main/${fileName}`
        : noImage;
}

/**
 * テキストコンポーネントを作成
 *
 * @param  {String} key   項目名
 * @param  {String} value 内容
 * @return {Object}       テキストコンポーネント
 */
function createTextComponent(key, value) {
    const contents = {
        'type': 'box',
        'layout': 'baseline',
        'contents': [
            {
                'type': 'text',
                'text': key,
                'size': 'sm',
                'color': '#949494',
                'flex': 2
            },
            {
                'type': 'text',
                'text': value,
                'wrap': true,
                'size': 'sm',
                'flex': 4,
                'color': '#666666'
            }
        ],
        'spacing': 'sm'
    };

    return contents;
}

/**
 * フッターを作成
 *
 * @param  {Object} profile プロフィールデータ
 * @return {Array}          フッターのコンポーネント
 */
function createFooter(profile) {
    const color = (profile.カラー) ? profile.カラー.value : '#FF74B8';
    const style = isWhitishColor(color) ? 'secondary' : 'primary';
    let footer = [];

    // アイドル名鑑
    if (profile.URL) {
        footer.push({
            'type': 'button',
            'height': 'sm',
            'style': 'link',
            'offsetTop': '-10px',
            'action': {
                'type': 'uri',
                'label': 'アイドル名鑑を開く！',
                'uri': profile.URL.value
            }
        });
    }

    // Googleで検索
    footer.push({
        'type': 'button',
        'height': 'sm',
        'style': style,
        'color': color,
        'offsetTop': '-5px',
        'action': {
            'type': 'uri',
            'label': 'Googleで検索！',
            'uri': `http://www.google.co.jp/search?hl=ja&source=hp&q=${encodeURIComponent(`アイドルマスター ${profile.名前.value}`)}`
        }
    });

    return footer;
}

/**
 * エラーメッセージを作成
 *
 * @param  {String} title タイトル
 * @param  {String} text  エラー内容
 * @return {Object}       flexMessage
 */
function createErrorMessage(title, text) {
    const errMsg = {
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
                        'text': text,
                        'size': 'xs',
                        'color': '#949494',
                        'margin': 'sm'
                    }
                ]
            }
        }
    };

    return errMsg;
}

/**
 * 白っぽい色かどうか
 * 
 * @param  {String} hexColor 16進数カラーコード
 * @return {Boolean}         白っぽい色かどうか
 */
function isWhitishColor(hexColor) {
    const hex = hexColor.match(/[0-9A-Fa-f]{2}/g).map(v => parseInt(v, 16));
    const gs = Math.floor((hex[0] * 0.299 + hex[1] * 0.587 + hex[2] * 0.114) / 2.55);
    console.log(`${hexColor} -> [${gs} > 60]`);
    return gs > 65;
}

module.exports = { Search };
