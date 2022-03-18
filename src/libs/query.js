/**
 * 誕生日検索の条件文
 * @param {string} keyword キーワード
 * @returns クエリ文字列
 */
const birthSearchCriteria = (keyword) => `
 schema:birthDate ?BD.
 FILTER CONTAINS(STR(?BD), "${keyword}")
 OPTIONAL{ ?d imas:nameKana ?名前ルビ }
 OPTIONAL{ ?d imas:givenNameKana ?名前ルビ }
 OPTIONAL{ ?d imas:alternateNameKana ?名前ルビ }
 `

/**
 * 名前検索の条件文
 * @param {string} keyword キーワード
 * @returns クエリ文字列
 */
const nameSearchCriteria = (keyword) => `
 OPTIONAL{ ?d schema:name ?本名 }
 OPTIONAL{ ?d imas:nameKana ?名前ルビ }
 OPTIONAL{ ?d imas:givenNameKana ?名前ルビ }
 OPTIONAL{ ?d imas:alternateNameKana ?名前ルビ }
 FILTER(CONTAINS(?名前, "${keyword}") || CONTAINS(?本名, "${keyword}") || CONTAINS(?名前ルビ, "${keyword}"))
 `

/**
 * 複数検索の条件文
 * @param {string[]} keywords キーワード配列
 * @returns クエリ文字列
 */
const multiSearchCriteria = (keywords) => {
  const keyword = keywords.slice(0, 5).join('|')

  return `
   OPTIONAL{ ?d schema:name ?本名 }
   OPTIONAL{ ?d imas:nameKana ?名前ルビ }
   OPTIONAL{ ?d imas:givenNameKana ?名前ルビ }
   OPTIONAL{ ?d imas:alternateNameKana ?名前ルビ }
   FILTER(REGEX(?名前, "${keyword}") || REGEX(?本名, "${keyword}") || REGEX(?名前ルビ, "${keyword}"))
   `
}

/**
 * メインクエリ
 * @param {string} searchCriteria 検索条件クエリ
 * @returns クエリ文字列
 */
const mainQuery = (searchCriteria) => `
 PREFIX schema: <http://schema.org/>
 PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
 PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>
 PREFIX foaf: <http://xmlns.com/foaf/0.1/>
 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
 
 SELECT DISTINCT ?名前 ?名前ルビ ?ブランド ?性別 ?年齢 ?学年 ?身長 ?体重 ?BWH ?誕生日 ?星座 ?血液型 ?利き手 ?出身地 ?趣味 ?好きな物 ?特技 ?紹介文 ?CV ?カラー ?URL
 WHERE {
   ?d rdf:type ?type.
   FILTER(?type IN (imas:Idol, imas:Staff))
   ?d rdfs:label ?名前;
   ${searchCriteria}
   OPTIONAL { ?d imas:Brand ?ブランド }
   OPTIONAL { ?d schema:gender ?性別 }
   OPTIONAL { ?d foaf:age ?年齢 }
   OPTIONAL { ?d imas:SchoolGrade ?学年 }
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
 * 検索条件クエリを作成
 * @param {string} keyword キーワード
 * @returns 検索クエリ
 */
function createSearchCriteria(keyword) {
  const keywords = keyword.split(/[\n\s]/)

  // 複数検索
  if (keywords.length > 1) {
    return multiSearchCriteria(keywords)
  }

  // 誕生日検索
  if (/^\d{1,2}-\d{1,2}$/.test(keywords[0])) {
    return birthSearchCriteria(keywords[0])
  }

  // 通常検索
  return nameSearchCriteria(keywords)
}

/**
 * クエリを作成
 * @param {string} keyword キーボード
 * @returns SPARQLクエリ
 */
export function createQuery(keyword) {
  const searchCriteria = createSearchCriteria(keyword)
  const query = mainQuery(searchCriteria)

  // 余分な空白・改行を除去
  return query.replace(/[\n\r\s]/g, ' ')
}
