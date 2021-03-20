'use strict'
const imageFilename = require('../data/image-filename.json')

/**
 * アイドルの画像のURLを取得
 *
 * @param  {String} name アイドル名
 * @return {String}      URL文字列
 */
function getImageUrl(name) {
  const noImage = 'https://arrow2nd.github.io/images/linebot-imas/noimage.png'
  const filename = imageFilename[name]
  return filename
    ? `https://idollist.idolmaster-official.jp/images/character_main/${filename}`
    : noImage
}

/**
 * 白っぽい色かどうか
 *
 * @param  {String} hexColor 16進数カラーコード
 * @return {Boolean}         白っぽい色かどうか
 */
function isWhitishColor(hexColor) {
  const hex = hexColor.match(/[0-9A-Fa-f]{2}/g).map((v) => parseInt(v, 16))
  const gs = Math.floor(
    (hex[0] * 0.299 + hex[1] * 0.587 + hex[2] * 0.114) / 2.55
  )
  return gs > 65
}

module.exports = {
  getImageUrl,
  isWhitishColor
}
