'use strict'
const { convertProfile, convertBrandName, getIdolColor } = require('./convert')
const { getImageUrl, isWhitishColor } = require('./util')

/**
 * flexMessageを作成
 *
 * @param {Array} results 検索結果
 * @return FlexMessageオブジェクト
 */
function createMessage(results) {
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

  const flexMessage = {
    type: 'flex',
    altText: `${results.length}人 みつかりました！`,
    contents: {
      type: 'carousel',
      contents: carousel
    }
  }

  return flexMessage
}

/**
 * バブルを作成
 *
 * @param {Object} profile プロフィールデータ
 * @param {Array}  component プロフィールのコンポーネント
 * @return バブルコンポーネント
 */
function createBubble(profile, component) {
  const brandName = profile.ブランド
    ? convertBrandName(profile.ブランド.value)
    : '不明'
  const subText = `${profile.名前ルビ.value}・${brandName}`
  const imageUrl = getImageUrl(profile.名前.value)
  const footer = createFooter(profile)

  const bubble = {
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
          url: 'https://arrow2nd.github.io/images/linebot-imas/gradation.png',
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
          contents: component,
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

  return bubble
}

/**
 * テキストコンポーネントを作成
 *
 * @param {String} key 項目名
 * @param {String} value 内容
 * @return テキストコンポーネント
 */
function createTextComponent(key, value) {
  const contents = {
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

  return contents
}

/**
 * フッターを作成
 *
 * @param {Object} profile プロフィールデータ
 * @return フッターコンポーネント
 */
function createFooter(profile) {
  const color = getIdolColor(profile)
  const style = isWhitishColor(color) ? 'secondary' : 'primary'
  const footer = []

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

/**
 * エラーメッセージを作成
 *
 * @param {String} title タイトル
 * @param {String} text エラー内容
 * @return FlexMessageオブジェクト
 */
function createErrorMessage(title, text) {
  const errorMessage = {
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

  return errorMessage
}

module.exports = {
  createMessage,
  createErrorMessage
}
