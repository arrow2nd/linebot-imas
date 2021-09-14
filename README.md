# linebot-imas

[![arrow2nd](https://circleci.com/gh/arrow2nd/linebot-imas.svg?style=shield)](https://circleci.com/gh/arrow2nd/linebot-imas/tree/master)
[![UpdateCache](https://github.com/arrow2nd/linebot-imas/actions/workflows/update-cache.yaml/badge.svg)](https://github.com/arrow2nd/linebot-imas/actions/workflows/update-cache.yaml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier)
![GitHub](https://img.shields.io/github/license/arrow2nd/linebot-imas)

IDOLM@STER シリーズに登場するアイドルのプロフィールを検索できる LINEBot です。

プロフィール情報は[im@sparql](https://sparql.crssnky.xyz/imas/)より取得しています。（ありがとうございます…！）

## 友だち登録

![QRコード](https://user-images.githubusercontent.com/44780846/78094124-bac41c00-740e-11ea-9c0c-0a3704e44e31.png)

<a href="https://lin.ee/gsEi1Ik"><img src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png" alt="友だち追加" height="36" border="0"></a>

## 使い方

プロフィールを検索したいアイドルの名前を送信してください。

**名前の一部**や**ひらがな**でも検索できます。

![スクリーンショット](https://user-images.githubusercontent.com/44780846/130342672-dcc586d2-868d-49c2-8a68-dcd7dce3f3bd.png)

### 誕生日検索

誕生日からアイドルを検索することができます。

> **リッチメニューから行えるようになりました！**

![リッチメニュー](https://user-images.githubusercontent.com/44780846/101235459-241dcc80-370c-11eb-9689-917b0a01183f.png)

<details>
<summary>反応する文字について</summary>

- 「昨日・今日・明日」と「誕生日」を含む文を送ると、その日が誕生日のアイドルのプロフィールを検索します。

- 「月/日」の形で日付を送ると、その日が誕生日のアイドルのプロフィールを検索します。（例: 7/7）

</details>

### 同時検索

複数のアイドル名をスペース・改行で区切ると、同時に検索することができます。

![スクリーンショット](https://user-images.githubusercontent.com/44780846/130342691-d22ad2d4-f09e-48bc-bf5c-555d88d8a789.png)

「え...芹沢あさひって白菊ほたるより年上なの...？」ってなった時などにご活用ください。

## 仕様

- 複数のプロフィールが見つかった場合、上位 5 件までを返信します
