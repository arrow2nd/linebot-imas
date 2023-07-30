import type { Binding } from "./types/imasparql.ts";
import type { FlexMessage } from "./types/message.ts";

import {
  convert2ReadableBrandName,
  convert2ReadableProfile,
  getBrandColor,
  getImageUrl,
} from "./convert.ts";
import { getTypedEntries, isWhitishColor } from "./util.ts";

function createTextComponent(key: string, value: string) {
  return {
    type: "box",
    layout: "baseline",
    contents: [
      {
        type: "text",
        text: key,
        size: "sm",
        color: "#949494",
        flex: 2,
      },
      {
        type: "text",
        text: value,
        wrap: true,
        size: "sm",
        flex: 5,
        color: "#666666",
      },
    ],
    spacing: "none",
  };
}

function createFooterComponents(profile: Binding) {
  const footer = [];

  // アイドル名鑑へのリンクボタン
  if (profile.URL) {
    footer.push({
      type: "button",
      height: "sm",
      style: "link",
      offsetTop: "-10px",
      action: {
        type: "uri",
        label: "アイドル名鑑でみる",
        uri: profile.URL.value,
      },
    });
  }

  // ボタンのスタイル
  const color = profile.カラー?.value || getBrandColor(profile.ブランド?.value);
  const style = isWhitishColor(color) ? "secondary" : "primary";

  // 検索ボタン
  footer.push({
    type: "button",
    height: "sm",
    style,
    color,
    offsetTop: "-5px",
    action: {
      type: "uri",
      label: "Googleで検索する",
      uri: `http://www.google.co.jp/search?hl=ja&source=hp&q=${
        encodeURIComponent(`アイドルマスター ${profile.名前.value}`)
      }`,
    },
  });

  return footer;
}

function createBubble(profile: Binding, components: any[]) {
  const brandName = convert2ReadableBrandName(profile.ブランド?.value);
  const subText = profile.名前ルビ?.value
    ? `${profile.名前ルビ.value}・${brandName}`
    : brandName;

  const imageUrl = getImageUrl(profile.名前.value);
  const footer = createFooterComponents(profile);

  return {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "image",
          url: imageUrl,
          size: "full",
          aspectMode: "cover",
          aspectRatio: "16:9",
          gravity: "center",
        },
        {
          type: "image",
          url: "https://linebot-imas.vercel.app/gradation.png",
          size: "full",
          aspectMode: "cover",
          aspectRatio: "16:9",
          position: "absolute",
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: profile.名前.value,
              size: "xl",
              color: "#ffffff",
              weight: "bold",
            },
            {
              type: "text",
              text: subText,
              size: "xs",
              color: "#ffffff",
            },
          ],
          position: "absolute",
          offsetTop: "110px",
          paddingStart: "15px",
        },
        {
          type: "box",
          layout: "vertical",
          contents: components,
          paddingStart: "15px",
          paddingTop: "15px",
          paddingBottom: "10px",
          paddingEnd: "15px",
        },
      ],
      paddingAll: "0px",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: footer,
    },
  };
}

export function createReplyMessage(results: Binding[]): FlexMessage {
  // 結果がない場合はエラーを返す
  if (results.length === 0) {
    return createTextMessage("みつかりませんでした", "ごめんなさい…！");
  }

  // カルーセル作成
  const carousel = results.map((profile) => {
    const readableProfile = convert2ReadableProfile(profile);
    const component = [];

    // プロフィールのコンポーネントを作成
    for (const [key, value] of getTypedEntries(readableProfile)) {
      const isSkip = ["名前", "名前ルビ", "ブランド", "URL"].includes(key);
      if (!value?.value || isSkip) {
        continue;
      }

      component.push(createTextComponent(key, value.value));
    }

    return createBubble(readableProfile, component);
  });

  return {
    type: "flex",
    altText: `${results.length}人 みつかりました！`,
    contents: {
      type: "carousel",
      contents: carousel,
    },
  };
}

/**
 * テキスト主体のFlexMessageを作成
 * @param title タイトル
 * @param desc 説明
 * @returns FlexMessage
 */
export function createTextMessage(title: string, desc: string): FlexMessage {
  return {
    type: "flex",
    altText: title,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            weight: "bold",
            size: "md",
            text: title,
          },
          {
            type: "text",
            text: desc,
            size: "xs",
            color: "#949494",
            margin: "sm",
          },
        ],
      },
    },
  };
}
