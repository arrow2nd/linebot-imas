'use strict'
const axios = require('axios')

const birthQuery = (keyword) => `
rdf:type ?type;
schema:birthDate ?BD.
FILTER(?type IN (imas:Idol,imas:Staff)).
FILTER(regex(str(?BD),"${keyword}")).
OPTIONAL{?data imas:nameKana ?名前ルビ.}
OPTIONAL{?data imas:alternateNameKana ?名前ルビ.}
OPTIONAL{?data imas:givenNameKana ?名前ルビ.}
`

const nameQuery = (keyword) => `
rdf:type ?type.
FILTER(?type IN (imas:Idol,imas:Staff)).
OPTIONAL{?data schema:name ?本名.}
OPTIONAL{?data imas:nameKana ?名前ルビ.}
OPTIONAL{?data imas:alternateNameKana ?名前ルビ.}
OPTIONAL{?data imas:givenNameKana ?名前ルビ.}
FILTER(CONTAINS(?名前,"${keyword}")||CONTAINS(?本名,"${keyword}")||CONTAINS(?名前ルビ,"${keyword}")).
`

const query = (searchCriteria) => `
PREFIX schema: <http://schema.org/>
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
LIMIT 5
`

/**
 * imasparqlからプロフィールを取得
 *
 * @param  {String} keyword 検索文字列
 * @return {Object}         検索結果
 */
async function getIdolProfile(keyword) {
  // MM-DD形式なら誕生日検索、それ以外なら通常検索
  const searchCriteria = /^\d{1,2}-\d{1,2}/.test(keyword)
    ? birthQuery(keyword)
    : nameQuery(keyword)

  const url = `https://sparql.crssnky.xyz/spql/imas/query?output=json&query=${encodeURIComponent(
    query(searchCriteria)
  )}`

  try {
    const res = await axios.get(url)
    if (!res.data.results) {
      throw new Error('[Error] データがありません')
    }
    return res.data.results.bindings
  } catch (err) {
    throw new Error(
      `[Error] im@sparqlにアクセスできません (${err.response.statusText} : ${err.response.status})`
    )
  }
}

module.exports = getIdolProfile
