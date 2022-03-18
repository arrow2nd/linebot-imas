import { brandList } from '../data/convert-list.js'
import { idolImages } from '../data/idol-images.js'

/**
 * アイドルの画像のURLを取得
 * @param {string} idolName アイドル名
 * @return 画像URL
 */
export function getImageUrl(idolName) {
  const noImage = 'https://linebot-imas.vercel.app/noimage.png'
  const imageName = idolImages.find((e) => e.name === idolName)?.image

  return imageName
    ? `https://idollist.idolmaster-official.jp/images/character_main/${imageName}`
    : noImage
}

/**
 * ブランドのイメージカラーを取得
 * @param {string | undefined} brandName ブランド名
 * @returns 16進カラーコード
 */
export function getBrandColor(brandName) {
  // ブランドカラーが存在しない場合、アイマス全体のイメージカラーを返す
  return (brandName && brandList.get(brandName)?.color) || '#FF74B8'
}

/**
 * 白っぽい色かどうかを判定
 * @param {string} hexColor 16進数カラーコード
 * @return 白っぽい色かどうか
 */
export function isWhitishColor(hexColor) {
  const [r, g, b] = hexColor
    .match(/[0-9A-Fa-f]{2}/g)
    .map((v) => parseInt(v, 16))

  // グレースケール
  const gs = Math.floor((r * 0.299 + g * 0.587 + b * 0.114) / 2.55)

  return gs > 65
}

/**
 * 半角記号を除去する
 * @param {string} text 文字列
 * @return 除去済みの文字列
 */
export function removeSymbol(text) {
  return text.replace(/[!-/:-@[-`{-~]/g, '')
}
