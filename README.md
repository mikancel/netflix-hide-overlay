# netflix-hide-overlay

A Chrome extension that hides Netflix UI overlays when the mouse is idle, and shows them again when the mouse moves.

Netflixの再生中、マウスが静止しているときにUIオーバーレイを非表示にし、マウスを動かすと再表示するChrome拡張機能です。

---

## Features / 機能

- Hides all UI elements (buttons, overlays, controls) when the mouse is idle
- Shows all UI elements when the mouse moves
- Hides the mouse cursor when idle
- Works only on `/watch` pages — no interference with browsing
- Automatically re-hides dynamically added elements (e.g. skip intro, credits buttons)
- Prevents video from shrinking during end card / next episode screens

---

- マウス静止中はUIの全要素（ボタン・オーバーレイ・コントロール）を非表示
- マウスを動かすと全要素を再表示
- 静止中はマウスカーソルも非表示
- `/watch` ページのみ動作し、通常のブラウジングには影響なし
- 動的に追加される要素（イントロスキップ・クレジットボタンなど）も即座に非表示
- エンドカード・次のエピソード画面での映像縮小を防止

---

## Installation / インストール方法

### Chrome / Brave / Edge

1. Download or clone this repository / このリポジトリをダウンロードまたはクローン
2. Open `chrome://extensions` (or `brave://extensions`) / `chrome://extensions` を開く
3. Enable **Developer mode** / **デベロッパーモード** をONにする
4. Click **Load unpacked** / **パッケージ化されていない拡張機能を読み込む** をクリック
5. Select the repository folder / リポジトリのフォルダを選択

---

## Known Issues / 既知の問題

- End card behavior may be unstable / エンドカード周辺の動作が不安定な場合があります

---

## Notes / 注意事項

- Firefox is not supported / Firefoxには対応していません
- Netflix may update their front-end at any time, which could affect this extension / Netflixのフロントエンド変更により動作しなくなる場合があります
- The hide delay is set to 2.5 seconds and can be changed in `content.js` (`HIDE_DELAY`) / 非表示までの時間は `content.js` の `HIDE_DELAY` で変更できます（単位: ミリ秒）
