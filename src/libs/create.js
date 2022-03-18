import { convertBrandName, convertProfile, getIdolColor } from './convert.js'
import { getImageUrl, isWhitishColor } from './util.js'

/**
 * 返信メッセージを作成
 * @param {any[]} results 検索結果
 * @returns FlexMessageオブジェクト
 */
export function createReplyMessage(results) {
  // データが無い場合はエラー
  if (!results.length) {
    return createErrorMessage('みつかりませんでした', 'ごめんなさい…！')
  }

  // カルーセル作成
  const carousel = results.map((profile) => {
    const convertedProfile = convertProfile(profile)

    // プロフィールのコンポーネントを作成
    const component = []
    for (const key in convertedProfile) {
      if (['名前', '名前ルビ', 'ブランド', 'URL'].includes(key)) continue
      component.push(createTextComponent(key, profile[key].value))
    }

    return createBubble(convertedProfile, component)
  })

  return {
    type: 'flex',
    altText: `${results.length}人 みつかりました！`,
    contents: {
      type: 'carousel',
      contents: carousel
    }
  }
}

/**
 * エラーメッセージを作成
 * @param {string} title タイトル
 * @param {string} text エラー内容
 * @returns FlexMessageオブジェクト
 */
export function createErrorMessage(title, text) {
  return {
    type: 'flex',
    altText: title,
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            weight: 'bold',
            size: 'md',
            text: title
          },
          {
            type: 'text',
            text: text,
            size: 'xs',
            color: '#949494',
            margin: 'sm'
          }
        ]
      }
    }
  }
}

/**
 * バブルを作成
 * @param {any} profile プロフィールデータ
 * @param {any[]} components プロフィールのコンポーネント
 * @returns バブルコンポーネント
 */
function createBubble(profile, components) {
  const brandName = profile.ブランド
    ? convertBrandName(profile.ブランド.value)
    : '不明'

  const subText = `${profile.名前ルビ.value}・${brandName}`
  const imageUrl = getImageUrl(profile.名前.value)
  const footer = createFooter(profile)

  return {
    type: 'bubble',
    size: 'mega',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'image',
          url: imageUrl,
          size: 'full',
          aspectMode: 'cover',
          aspectRatio: '16:9',
          gravity: 'center'
        },
        {
          type: 'image',
          url: 'https://linebot-imas.vercel.app/gradation.png',
          size: 'full',
          aspectMode: 'cover',
          aspectRatio: '16:9',
          position: 'absolute'
        },
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: profile.名前.value,
              size: 'xl',
              color: '#ffffff',
              weight: 'bold'
            },
            {
              type: 'text',
              text: subText,
              size: 'xs',
              color: '#ffffff'
            }
          ],
          position: 'absolute',
          offsetTop: '110px',
          paddingStart: '15px'
        },
        {
          type: 'box',
          layout: 'vertical',
          contents: components,
          paddingStart: '15px',
          paddingTop: '15px',
          paddingBottom: '10px',
          paddingEnd: '15px'
        }
      ],
      paddingAll: '0px'
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: footer
    }
  }
}

/**
 * テキストコンポーネントを作成
 * @param {string} key 項目名
 * @param {string} value 内容
 * @returns テキストコンポーネント
 */
function createTextComponent(key, value) {
  return {
    type: 'box',
    layout: 'baseline',
    contents: [
      {
        type: 'text',
        text: key,
        size: 'sm',
        color: '#949494',
        flex: 2
      },
      {
        type: 'text',
        text: value,
        wrap: true,
        size: 'sm',
        flex: 5,
        color: '#666666'
      }
    ],
    spacing: 'none'
  }
}

/**
 * フッターを作成
 * @param {any} profile プロフィールデータ
 * @returns フッターコンポーネント
 */
function createFooter(profile) {
  const footer = []
  const color = getIdolColor(profile)
  const style = isWhitishColor(color) ? 'secondary' : 'primary'

  // アイドル名鑑
  if (profile.URL) {
    footer.push({
      type: 'button',
      height: 'sm',
      style: 'link',
      offsetTop: '-10px',
      action: {
        type: 'uri',
        label: 'アイドル名鑑でみる',
        uri: profile.URL.value
      }
    })
  }

  // Googleで検索
  footer.push({
    type: 'button',
    height: 'sm',
    style: style,
    color: color,
    offsetTop: '-5px',
    action: {
      type: 'uri',
      label: 'Googleで検索する',
      uri: `http://www.google.co.jp/search?hl=ja&source=hp&q=${encodeURIComponent(
        `アイドルマスター ${profile.名前.value}`
      )}`
    }
  })

  return footer
}
