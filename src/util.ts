/**
 * imasparqlからデータを取得
 * @param query クエリ
 * @returns 検索結果
 */
export async function fetchFromImasparql<T>(query: string): Promise<T> {
  const url = new URL("https://sparql.crssnky.xyz/spql/imas/query?output=json");

  // クエリから空白・改行を削除
  const trimedQuery = query.replace(/[\n\r\s]/g, " ");
  url.searchParams.append("query", trimedQuery);

  // 5sでタイムアウト
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), 5000);

  const res = await fetch(url.toString(), { signal: ctrl.signal }).catch(
    (err) => {
      throw new Error(
        `[Error] im@sparqlにアクセスできません (${err.response.status})`,
      );
    },
  );

  clearTimeout(id);

  if (!res.ok) {
    throw new Error("[Error] 取得に失敗しました");
  }

  return await res.json();
}

// deno-lint-ignore no-explicit-any
export function getTypedEntries<T extends Record<string, any>>(
  obj: T,
): [keyof T, T[keyof T]][] {
  return Object.entries(obj);
}

export function isWhitishColor(colorCode: string): boolean {
  // 16進数カラーコードを分解
  const rgb = colorCode.match(/[0-9A-Fa-f]{2}/g);
  if (!rgb || rgb.length !== 3) {
    return false;
  }

  // グレースケールを計算
  const [r, g, b] = rgb.map((v) => parseInt(v, 16));
  const gs = Math.floor((r * 0.299 + g * 0.587 + b * 0.114) / 2.55);

  return gs > 65;
}
