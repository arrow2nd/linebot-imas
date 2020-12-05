# linebot-imas

[![arrow2nd](https://circleci.com/gh/arrow2nd/linebot-imas.svg?style=shield)](https://circleci.com/gh/arrow2nd/linebot-imas/tree/master)

IDOLM@STERシリーズに登場するアイドルのプロフィールを検索できるLINEBotです。

プロフィール情報は[im@sparql](https://sparql.crssnky.xyz/imas/)より取得しています。（ありがとうございます…！）

## 友だち登録

![319rwvnv](https://user-images.githubusercontent.com/44780846/78094124-bac41c00-740e-11ea-9c0c-0a3704e44e31.png)

<a href="https://lin.ee/gsEi1Ik"><img src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png" alt="友だち追加" height="36" border="0"></a>

## 使い方

プロフィールを検索したいアイドル名を送信してください。

名前の一部やひらがなからでも検索できます。

![bot](https://user-images.githubusercontent.com/44780846/93973164-b4f03780-fdae-11ea-999f-1d3fa40b95a6.png)

## 誕生日検索
**リッチメニューから行えるようになりました！**

![rich](https://user-images.githubusercontent.com/44780846/101235459-241dcc80-370c-11eb-9689-917b0a01183f.png)

<details>
<summary>反応する文字について</summary>

- 「昨日・今日・明日」と「誕生日」を含む文を送ると、その日が誕生日のアイドルのプロフィールを検索します。

- 「MM月DD日」の形で日付を送ると、その日が誕生日のアイドルのプロフィールを検索します。

</details>

## 仕様

- 複数のプロフィールが見つかった場合、上位5件までを返信します。
