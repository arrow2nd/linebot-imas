import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

import type { ImasparqlResponse } from "../src/types/imasparql.ts";

import { idolImages } from "../data/images.ts";
import { fetchFromImasparql } from "../src/util.ts";

/**
 * OGP画像のURLを取得
 * @param url URL
 * @returns 画像URL
 */
async function fetchOgpImageUrl(url: string): Promise<string> {
  const res = await fetch(url).catch((err) => {
    throw new Error(
      `[Error] ${err.response.statusText} : ${err.response.status}`,
    );
  });

  const body = await res.text();
  const doc = new DOMParser().parseFromString(body, "text/html");
  if (!doc) {
    return "";
  }

  const ogImage = doc.querySelector('head > meta[property="og:image"]');
  if (!ogImage) {
    return "";
  }

  return ogImage.getAttribute("content") ?? "";
}

const query = `
PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT DISTINCT ?名前 ?URL
WHERE {
  ?data rdfs:label ?名前;
  imas:IdolListURL ?URL.
}
ORDER BY ?名前
`;

const res = await fetchFromImasparql<ImasparqlResponse>(query);

for (const binding of res.results.bindings) {
  const name = binding.名前.value;

  // 取得済みならスキップ
  if (idolImages.has(name) || !binding.URL) {
    console.log(`[SKIP] ${name}`);
    continue;
  }

  // OGP画像のURLを取得
  const url = await fetchOgpImageUrl(binding.URL?.value);

  // 2秒待機
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (url === "") {
    idolImages.delete(name);
    console.log(`[REMOVED] ${name}`);
    continue;
  }

  idolImages.set(name, url);
  console.log(`[ADDED] ${name} -> ${url}`);
}

let data = "";
for (const [key, value] of idolImages.entries()) {
  data += `["${key}", "${value}"],\n`;
}

const template = `
export const idolImages = new Map([
${data}
]);
`;

Deno.writeTextFileSync("./data/images.ts", template);

console.log("[SUCCESS]");
