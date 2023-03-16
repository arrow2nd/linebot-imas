# linebot-imas

THE IDOLM@STER シリーズに登場するアイドルのプロフィールを検索できる LINEBot

[![update](https://github.com/arrow2nd/linebot-imas/actions/workflows/update.yaml/badge.svg)](https://github.com/arrow2nd/linebot-imas/actions/workflows/update.yaml)
[![test](https://github.com/arrow2nd/linebot-imas/actions/workflows/test.yaml/badge.svg)](https://github.com/arrow2nd/linebot-imas/actions/workflows/test.yaml)
[![Depfu](https://badges.depfu.com/badges/c74acef232e4fe4ea1ba4a4feef6173d/overview.svg)](https://depfu.com/github/arrow2nd/linebot-imas?project_id=34194)
![GitHub](https://img.shields.io/github/license/arrow2nd/linebot-imas)

![トーク画面](https://user-images.githubusercontent.com/44780846/130342672-dcc586d2-868d-49c2-8a68-dcd7dce3f3bd.png)

## 友だち登録

![QRコード](https://user-images.githubusercontent.com/44780846/78094124-bac41c00-740e-11ea-9c0c-0a3704e44e31.png)

<a href="https://lin.ee/gsEi1Ik"><img src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png" alt="友だち追加" height="36" border="0"></a>

## 使い方

プロフィールを検索したいアイドルの名前を送信してください。

**名前の一部やひらがなでも検索できます。**

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

![同時検索結果](https://user-images.githubusercontent.com/44780846/130342691-d22ad2d4-f09e-48bc-bf5c-555d88d8a789.png)

「芹沢あさひと白菊ほたるってどっちが年上だっけ...？」ってなった時などにご活用ください。

## 仕様

- 複数のプロフィールが見つかった場合、**上位 5 件まで**を返信します
- 検索結果の順序は都度、異なる場合があります

## プライバシーポリシー

[こちら](https://arrow2nd.github.io/linebot-imas/) をご覧ください

## 実行

以下の内容で `.env`を作成

```
PORT=<ポート番号>
ACCESS_TOKEN=<LINEBotアクセストークン>
SECRET_KEY=<LINEBotシークレットキー>
```

ngrok 等でポートを公開し、吐き出された URL を LINEBot の 管理画面から Webhook に登録

```
ngrok http <ポート番号>
```

実行！

```
pnpm install
pnpm start
```

## Thanks!

プロフィール情報は [im@sparql](https://sparql.crssnky.xyz/imas/) より取得しています。
