/**
 * ベースの検索クエリ
 * @param searchCriteria 条件クエリ
 * @returns クエリ
 */
const baseQuery = (searchCriteria: string, disableLimit = false) => `
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
${disableLimit ? "" : "LIMIT 5"}
 `;

/**
 * 名前検索のクエリを作成
 * @param keyword キーワード
 * @returns クエリ
 */
function createNameSearchQuery(keyword: string): string {
  const searchCriteria = `
    OPTIONAL{ ?d schema:name ?本名 }
    OPTIONAL{ ?d imas:nameKana ?名前ルビ }
    OPTIONAL{ ?d imas:givenNameKana ?名前ルビ }
    OPTIONAL{ ?d imas:alternateNameKana ?名前ルビ }
    FILTER(CONTAINS(?名前, "${keyword}") || CONTAINS(?本名, "${keyword}") || CONTAINS(?名前ルビ, "${keyword}"))
  `;

  return baseQuery(searchCriteria);
}

/**
 * 複数検索のクエリを作成
 * @param keywords キーワード配列
 * @returns クエリ
 */
function createMultiSearchQuery(keywords: string[]): string {
  // 同時に検索できるキーワードが5件まで
  const keyword = keywords.slice(0, 5).join("|");
  const searchCriteria = `
    OPTIONAL{ ?d schema:name ?本名 }
    OPTIONAL{ ?d imas:nameKana ?名前ルビ }
    OPTIONAL{ ?d imas:givenNameKana ?名前ルビ }
    OPTIONAL{ ?d imas:alternateNameKana ?名前ルビ }
    FILTER(REGEX(?名前, "${keyword}") || REGEX(?本名, "${keyword}") || REGEX(?名前ルビ, "${keyword}"))
  `;

  return baseQuery(searchCriteria);
}

/**
 * 誕生日検索のクエリを作成
 * @param date 日付 (MM-DD)
 * @returns クエリ
 */
export function createBirthdaySearchQuery(date: string): string {
  const searchCriteria = `
    schema:birthDate ?BD.
    FILTER CONTAINS(STR(?BD), "${date}")
    OPTIONAL{ ?d imas:nameKana ?名前ルビ }
    OPTIONAL{ ?d imas:givenNameKana ?名前ルビ }
    OPTIONAL{ ?d imas:alternateNameKana ?名前ルビ }
  `;

  return baseQuery(searchCriteria, true);
}

/**
 * 検索クエリを作成
 * @param keyword キーワード
 * @returns クエリ
 */
export function createSearchQuery(keyword: string): string {
  // 複数検索
  const keywords = keyword.replace('"', '\\"').split(/[\n\s]/);
  if (keywords.length > 1) {
    return createMultiSearchQuery(keywords);
  }

  // 名前検索
  return createNameSearchQuery(keywords[0]);
}
