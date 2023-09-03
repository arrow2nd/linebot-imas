import { idolImages } from "../data/images.ts";

type OgImage = {
  name: string;
  url: string;
};

const res = await fetch("https://arrow2nd.github.io/idol-og-images/data.json");
const ogImages = await res.json() as OgImage[];

for (const { name, url } of ogImages) {
  if (idolImages.has(name)) {
    if (url === "") {
      idolImages.delete(name);
    }
    console.log(name);
    continue;
  }

  idolImages.set(name, url);
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
