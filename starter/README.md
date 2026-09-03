# starter — そのままコピーして使う一式

## 入れ方

```
starter/styles/   →  <project>/src/styles/
starter/lib/      →  <project>/src/lib/
starter/scripts/  →  <project>/scripts/
```

エントリで CSS を1本読み、起動時に3つ呼ぶ:

```ts
import './styles/components.css'
import { initTheme } from './lib/theme'
import { watchPress } from './lib/press'
import { watchMotionPrefs } from './lib/motion'

initTheme()
watchPress()
watchMotionPrefs()
```

`components.css` が入口。そこから `base.css` → `tokens.css` → `m3-scheme.css` と
部品の5本（core / nav / overlay / form / data）が `@import` で芋づるに入るので、
読むのは1本だけでよい。

**★分割の順番を変えない★** 後ろのファイルが前を上書きする前提で書いてある。
使わない分類（例: PC を作らないので `-nav`）を外しても壊れないが、
`components.css` から `@import` を消す形にすること。

`<head>` にこれも要る:

```html
<meta name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />
```

- `viewport-fit=cover` … `env(safe-area-inset-*)` を使えるようにする
- `interactive-widget=resizes-content` … キーボードで入力欄が隠れないようにする

### CSS だけでも動く

`lib/` を入れないと失われるのは3つだけ。

| 入れないと | どうなる |
|---|---|
| `press.ts` | 押下の反応が 150ms 遅れる（Chromium の `:active` の遅延） |
| `motion.ts` | バネが `cubic-bezier` の近似のまま（それでも十分見られる） |
| `loader.ts` | 読み込みの印の形が変わらない（回るだけ） |
| `overlay.ts` | メニュー・候補が画面中央に出る（Popover API の既定位置） |

配色・形・字・間隔は CSS だけで全部効く。
開閉そのもの（外側を押して閉じる・Esc）は `popover` 属性と `<details>` が持つので、
`overlay.ts` を入れなくても機能はする。

---

## 配色を変える

```sh
npm i -D @material/material-color-utilities esbuild
```

`scripts/gen-m3-scheme.mjs` の `SEEDS` を直して:

```json
{
  "scripts": {
    "gen:scheme": "esbuild scripts/gen-m3-scheme.mjs --bundle --platform=node --format=esm --outfile=node_modules/.cache/gen-m3-scheme.mjs --log-level=error && node node_modules/.cache/gen-m3-scheme.mjs"
  }
}
```

```sh
npm run gen:scheme
```

`src/styles/m3-scheme.css` と `src/lib/seeds.ts` が書き変わる。
**どちらも生成物。手で編集しない。**

- 出力先の既定は `<cwd>/src/styles` と `<cwd>/src/lib`。
  変えたいときは `M3E_OUT=<dir> npm run gen:scheme`
- MCU は拡張子なしの ESM で書かれていて Node から直接読めない。
  だから esbuild で束ねてから実行する
- **★`devDependencies` に置くこと★** ライブラリは 100KB 超ある。
  実行時に読み込まない

### シードの書き方

```js
{ id: 'indigo', label: 'インディゴ', hex: '#4F5BD5', variant: 'tonalSpot' }
```

先頭が既定（`data-seed` 属性なし）。`variant` は
`tonalSpot`（落ち着く。迷ったらこれ）/ `vibrant`（彩度高め）/
`neutral`（ほぼ無彩色）。

---

## 明暗とシードの切り替え

```ts
import { setTheme, applySeed } from './lib/theme'

setTheme('dark')       // 'system' | 'light' | 'dark'
applySeed('teal')
```

`localStorage` のキーは `theme.ts` の `NS`（既定 `'app'`）で決まる。
アプリごとに名前空間を変えること。

---

## 各ファイルの役割

| | |
|---|---|
| `styles/m3-scheme.css` | **生成物。** `--md-sys-color-*`（7シード × ライト/ダーク） |
| `styles/tokens.css` | 短い別名（`--primary` `--surface-mid` …）+ 形・字・間隔・動き・外殻の幾何・画面幅・z-index・図の系列色 |
| `styles/base.css` | reset。「Webページの顔」（長押しメニュー・青い選択範囲・タップの点滅）を消す |
| `styles/components.css` | **入口。** 下の5本を束ねるだけ |
| `styles/components-core.css` | 骨組み・バー・ボタン・入力・選択・面と行・知らせ・進捗・シート・ダイアログ |
| `styles/components-nav.css` | レール・ドロワー・ボトムアプリバー・サイドシート・パンくず・ページ送り・タブの追加種 |
| `styles/components-overlay.css` | メニュー・ポップオーバー・ツールチップ・開閉・コマンドパレット・全画面の検索 |
| `styles/components-form.css` | コンボボックス・日付/時刻・OTP・トグル・分割ボタン・FABメニュー・ドロップ領域・評価 |
| `styles/components-data.css` | アバター・表・カルーセル・木・手順・年表・環の進捗・図・本文・コード |
| `lib/motion.ts` | M3 のバネを `linear()` に焼く。速度追跡・中断可能な動き・ラバーバンド・ハプティクス |
| `lib/loader.ts` | 7つの多角形を補間する読み込みの印 |
| `lib/press.ts` | `pointerdown` で `.is-pressed` を付ける（委譲。document に1つ） |
| `lib/overlay.ts` | メニュー・候補の位置決め、コンテキストメニュー、↑↓ の操作、ツールチップ |
| `lib/theme.ts` | 明暗とシードの適用・保存・`theme-color` の追従 |
| `lib/seeds.ts` | **生成物。** 設定画面が並べる色の一覧 |

---

## 既存アプリに入れるとき

**既存のクラス名を変えない。** `tokens.css` の中で、旧トークン名を
M3 の役割名への**別名**として残すのが安全。

```css
:root, [data-theme] {
  /* 旧名 → M3 の意味に接続する */
  --ink: var(--on-surface);
  --tint: var(--primary);
  --surface-raised: var(--surface-mid);
}
```

★色の別名は `:root` だけでなく `[data-theme]` にも置く★
（理由は [docs/02-color.md](../docs/02-color.md) の最後）。
★動きの `--d-*` はそこに入れない★ 視差低減の `@media` に負ける。

新しく書くものは M3 の名前を使い、別名は既存コードのために残す。
