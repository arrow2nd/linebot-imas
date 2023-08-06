import { crypto } from "https://deno.land/std@0.197.0/crypto/mod.ts";

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

/**
 * 型付きのentriesを取得
 * @param obj Object
 * @returns entries
 */
// deno-lint-ignore no-explicit-any
export function getTypedEntries<T extends Record<string, any>>(
  obj: T,
): [keyof T, T[keyof T]][] {
  return Object.entries(obj);
}

/**
 * 白っぽい色かどうか
 * @param colorCode 16進数カラーコード
 * @returns 結果
 */
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

/**
 * HMAC-SHA256
 */
export const hmacAlgorithm = { name: "HMAC", hash: "SHA-256" };

/**
 * HMAC-SHA256 でリクエストボディのダイジェスト値を取得
 * @param secretKey シークレットキー
 * @param body リクエストボディ
 * @returns Base64でエンコードされたダイジェスト値
 */
export async function hmac(secretKey: string, body: string): Promise<string> {
  const enc = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    hmacAlgorithm,
    false,
    ["sign", "verify"],
  );

  const sign = await crypto.subtle.sign(
    hmacAlgorithm.name,
    key,
    enc.encode(body),
  );

  return btoa(String.fromCharCode(...new Uint8Array(sign)));
}
