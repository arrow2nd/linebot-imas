'use strict';
const fs = require('fs');
const ogp = require('ogp-parser');
const request = require('request');

(async () => {
   const data = await getIdolData();
    let result = {};

    for (let e of data) {
        const name = e.name.value;
        const url = await getOgpImgUrl(e.URL.value);
        result[name] = url.match('^https:\/\/idollist\.idolmaster-official\.jp\/images\/character_main\/(.+)')[1];
        console.log(`${name} -> ${result[name]} ... OK!`);
        // ３秒待機する
        await new Promise(resolve => setTimeout(resolve, 3000));
    };
    
    fs.writeFileSync('./cache/imageFileName.json', JSON.stringify(result, null, '   '));
    console.log('success!');
})();

/**
 * URLからOGP画像のURLを取得
 *
 * @param  {String} url 取得するURL
 * @return {String}     OGP画像のURL
 */
async function getOgpImgUrl(url) {
    try {
        const data = await ogp(url, {skipOembed: true});
        return data.ogp['og:image'][0];
    } catch (err) {
        throw err;
    };
};

/**
 * アイドル名鑑のURLを持つアイドルを取得
 *
 * @return {Array} データ
 */
function getIdolData() {
    return new Promise((resolve, reject) => {
        const query = `
        PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>
        PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
        SELECT distinct ?name ?URL
        WHERE {
        ?data rdfs:label ?name.
        ?data imas:IdolListURL ?URL.
        }
        `;
        const url = `https://sparql.crssnky.xyz/spql/imas/query?output=json&query=${encodeURIComponent(query)}`;

        request.get(url, (err, res, body) => {
            if (!err && res.statusCode === 200) {
                const data = JSON.parse(body).results.bindings;
                resolve(data);
            } else {
                console.error(err);
                reject();
            };
        });
    });
};
