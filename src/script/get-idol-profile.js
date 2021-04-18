'use strict'
const axios = require('axios')

const birthQuery = (keyword) => `
schema:birthDate ?BD.
FILTER(regex(str(?BD), "${keyword}"))
OPTIONAL{ ?d imas:nameKana ?名前ルビ }
OPTIONAL{ ?d imas:givenNameKana ?名前ルビ }
OPTIONAL{ ?d imas:alternateNameKana ?名前ルビ }
`

const nameQuery = (keyword) => `
OPTIONAL{ ?d schema:name ?本名 }
OPTIONAL{ ?d imas:nameKana ?名前ルビ }
OPTIONAL{ ?d imas:givenNameKana ?名前ルビ }
OPTIONAL{ ?d imas:alternateNameKana ?名前ルビ }
FILTER(CONTAINS(?名前, "${keyword}") || CONTAINS(?本名, "${keyword}") || CONTAINS(?名前ルビ, "${keyword}"))
`

const query = (searchCriteria) => `
PREFIX schema: <http://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT DISTINCT ?名前 ?名前ルビ ?ブランド ?性別 ?年齢 ?身長 ?体重 ?BWH ?誕生日 ?星座 ?血液型 ?利き手 ?出身地 ?趣味 ?好きな物 ?特技 ?紹介文 ?CV ?カラー ?URL
WHERE {
  ?d rdf:type ?type.
  FILTER(?type IN (imas:Idol, imas:Staff))
  ?d rdfs:label ?名前;
  ${searchCriteria}
  OPTIONAL { ?d imas:Brand ?ブランド }
  OPTIONAL { ?d schema:gender ?性別 }
  OPTIONAL { ?d foaf:age ?年齢 }
  OPTIONAL { ?d schema:height ?身長 }
  OPTIONAL { ?d schema:weight ?体重 }
  OPTIONAL {
    ?d imas:Bust ?B; imas:Waist ?W; imas:Hip ?H.
    BIND(CONCAT(str(?B), " / ", str(?W), " / ", str(?H)) as ?BWH)
  }
  OPTIONAL { ?d schema:birthDate ?誕生日 }
  OPTIONAL { ?d imas:Constellation ?星座 }
  OPTIONAL { ?d imas:BloodType ?血液型 }
  OPTIONAL { ?d imas:Handedness ?利き手 }
  OPTIONAL { ?d schema:birthPlace ?出身地 }
  OPTIONAL {
    SELECT ?d (GROUP_CONCAT(DISTINCT ?hobby; separator=" / ") AS ?趣味)
    WHERE { ?d imas:Hobby ?hobby }
    GROUP BY ?d
  }
  OPTIONAL {
    SELECT ?d (GROUP_CONCAT(DISTINCT ?fav; separator=" / ") AS ?好きな物)
    WHERE { ?d imas:Favorite ?fav }
    GROUP BY ?d
  }
  OPTIONAL {
    SELECT ?d (GROUP_CONCAT(DISTINCT ?talent; separator=" / ") AS ?特技)
    WHERE { ?d imas:Talent ?talent }
    GROUP BY ?d
  }
  OPTIONAL { ?d schema:description ?紹介文 }
  OPTIONAL { ?d imas:cv ?CV. FILTER(lang(?CV)="ja") }
  OPTIONAL { ?d imas:Color ?color. BIND(CONCAT("#", str(?color)) as ?カラー) }
  OPTIONAL { ?d imas:IdolListURL ?URL }
}
ORDER BY ?名前
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
