# Change Log

## [Unreleased]

## [1.13.1] - 2022/02/18

### Security

- 依存パッケージを更新

## [1.13.0] - 2022-02-16

### Security

- 依存パッケージを更新

### Added

- プライバシーポリシーを追加

### Change

- テキスト以外が送信された際のエラーメッセージを変更
- モジュール機構を CommonJS から ES モジュールへ変更

## [1.12.2] - 2022-01-22

### Security

- 依存パッケージを更新

## [1.12.1] - 2021-11-09

### Changed

- 5 秒以内にサーバーから応答がない場合、タイムアウトするように変更しました

## [1.12.0] - 2021-11-02

### Changed

- 画像をセルフホストするように変更しました

## [1.10.0] - 2021-08-22

### Added

- 複数アイドルの同時検索に対応しました

## [1.9.0] - 2021-07-11

### Added

- プロフィールに「学年」を追加

## [1.8.1] - 2021-07-08

### Fixed

- 「今日誕生日のアイドル」の検索結果がおかしい

## [1.8.0] - 2021-07-06

### Changed

- moment.js を day.js に置換

### Removed

- 「M 月 D 日」形式での誕生日検索を廃止

## [1.7.4] - 2021-04-18

### Added

- イメージカラーを持たないアイドルの場合、ブランドカラーをボタンの背景色に適用する処理を追加

### Changed

- im@sparql 側の変更に対応
- 各アイドルのブランド名の表記を変更

## [1.7.3] - 2021-03-22

### Added

- プロフィールに「特技」の項目を追加

### Changed

- プロフィールのレイアウトを調整

### Fixed

- 検索クエリを修正

## [1.7.2] - 2021-03-20

### Changed

- フォルダ構成を変更

## [1.7.1] - 2021-01-08

### Fixed

- イメージカラーよってはボタンが見えづらくなる問題を修正

## [1.7.0] - 2021-01-07

### Changed

- request から axios に移行

### Removed

- Webhook 検証をチェックするコードを削除

## [1.6.1] - 2021-01-06

- ライブラリを更新

## [1.6.0] - 2020-12-05

### Added

- リッチメニューから誕生日検索する機能を追加

## [1.5.5] - 2020-10-22

### Changed

- アイドルの画像 URL をキャッシュから取得するように変更

## [1.5.4] - 2020-10-08

### Fixed

- 検索クエリを修正

## [1.5.3] - 2020-09-24

### Added

- テストを追加

## [1.5.2] - 2020-09-23

### Fixed

- 検索クエリを修正
- 改行を含む文字列がエラーになるバグを修正

## [1.5.0] - 2020-09-23

### Added

- プロフィールにアイドルの画像を追加

## [1.4.0] - 2020-07-25

### Added

- アイドル名鑑へのリンクを追加

### Changed

- BWH の表示形式を変更

## [1.3.0] - 2020-07-25

### Added

- 日付から誕生日検索する機能を追加

### Fixed

- プロフィールに単位が付かないバグを修正

## [1.2.2] - 2020-07-19

### Fixed

- タイムゾーンを JST に修正

## [1.2.0] - 2020-07-08

### Changed

- デプロイ先を Vercel に変更

## [1.1.0] - 2020-06-25

### Changed

- 一部メッセージ内容を変更

## [1.0.8] - 2020-05-22

### Changed

- プロフィールの表示順を変更

### Fixed

- 検索クエリを修正

## [1.0.7] - 2020-04-29

### Added

- 昨日・明日が誕生日のアイドルの検索機能を追加

## [1.0.6] - 2020-04-10

### Added

- 今日が誕生日のアイドルの検索機能を追加

### Fixed

- 検索クエリを修正

## [1.0.5] - 2020-04-07

### Changed

- リファクタリング

## [1.0.4] - 2020-04-02

### Added

- 検索失敗時の処理を追加

## [1.0.3] - 2020-03-23

### Fixed

- 年齢・BWH が不明な場合の処理を修正

## [1.0.2] - 2020-03-22

### Fixed

- 検索クエリを修正

## 0.0.1 - 2020-03-21

- リリース

[unreleased]: https://github.com/arrow2nd/linebot-imas/compare/v1.13.1...HEAD
[1.13.1]: https://github.com/arrow2nd/linebot-imas/compare/v1.13.0...v1.13.1
[1.13.0]: https://github.com/arrow2nd/linebot-imas/compare/v1.12.2...v1.13.0
[1.12.2]: https://github.com/arrow2nd/linebot-imas/compare/v1.12.1...v1.12.2
[1.12.1]: https://github.com/arrow2nd/linebot-imas/compare/v1.12.0...v1.12.1
[1.12.0]: https://github.com/arrow2nd/linebot-imas/compare/v1.10.0...v1.12.0
[1.10.0]: https://github.com/arrow2nd/linebot-imas/compare/v1.9.0...v1.10.0
[1.9.0]: https://github.com/arrow2nd/linebot-imas/compare/v1.8.1...v1.9.0
[1.8.1]: https://github.com/arrow2nd/linebot-imas/compare/v1.8.0...v1.8.1
[1.8.0]: https://github.com/arrow2nd/linebot-imas/compare/v1.7.4...v1.8.0
[1.7.4]: https://github.com/arrow2nd/linebot-imas/compare/v1.7.3...v1.7.4
[1.7.3]: https://github.com/arrow2nd/linebot-imas/compare/v1.7.2...v1.7.3
[1.7.2]: https://github.com/arrow2nd/linebot-imas/compare/v1.7.1...v1.7.2
[1.7.1]: https://github.com/arrow2nd/linebot-imas/compare/v1.7.0...v1.7.1
[1.7.0]: https://github.com/arrow2nd/linebot-imas/compare/v1.6.1...v1.7.0
[1.6.1]: https://github.com/arrow2nd/linebot-imas/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/arrow2nd/linebot-imas/compare/v1.5.5...v1.6.0
[1.5.5]: https://github.com/arrow2nd/linebot-imas/compare/v1.5.4...v1.5.5
[1.5.4]: https://github.com/arrow2nd/linebot-imas/compare/v1.5.3...v1.5.4
[1.5.3]: https://github.com/arrow2nd/linebot-imas/compare/v1.5.2...v1.5.3
[1.5.2]: https://github.com/arrow2nd/linebot-imas/compare/v1.5.0...v1.5.2
[1.5.0]: https://github.com/arrow2nd/linebot-imas/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/arrow2nd/linebot-imas/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/arrow2nd/linebot-imas/compare/v1.2.2...v1.3.0
[1.2.2]: https://github.com/arrow2nd/linebot-imas/compare/v1.2.0...v1.2.2
[1.2.0]: https://github.com/arrow2nd/linebot-imas/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/arrow2nd/linebot-imas/compare/v1.0.8...v1.1.0
[1.0.8]: https://github.com/arrow2nd/linebot-imas/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/arrow2nd/linebot-imas/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/arrow2nd/linebot-imas/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/arrow2nd/linebot-imas/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/arrow2nd/linebot-imas/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/arrow2nd/linebot-imas/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/arrow2nd/linebot-imas/compare/v0.0.1...v1.0.2
