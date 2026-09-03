# 02. 色

## 配色は生成する。手で書かない

シード色 **1つ**から、ライト/ダーク両方の全役割を HCT（色相・彩度・トーン）で
算出する。使うのは Google の `@material/material-color-utilities`。

```
starter/scripts/gen-m3-scheme.mjs   ← ここの SEEDS を直す
        ↓  npm run gen:scheme
starter/styles/m3-scheme.css        ← --md-sys-color-* （生成物・手で触らない）
starter/lib/seeds.ts                ← 設定画面が並べる色の一覧（生成物）
        ↓
starter/styles/tokens.css           ← 短い別名（--primary / --surface-mid …）
```

**★実行時に計算しない★** ライブラリは 100KB 超ある。色は設計時に決まるものなので、
ビルド前に CSS へ静的化する。

`spec 2025`（= Expressive の色体系）を指定してある。2021 spec との違いは
「コンテナがより鮮やか、primary は落ち着く、surface の階層が整理された」。

### シードを足す・変える

```js
const SEEDS = [
  { id: 'indigo', label: 'インディゴ', hex: '#4F5BD5', variant: 'tonalSpot' },
  //  ↑ 先頭が既定（data-seed 属性なし）
]
```

`variant` は3つ。
- `tonalSpot` … Android の既定。落ち着く。**迷ったらこれ**
- `vibrant` … 彩度高め。ブランド色を主張したいとき
- `neutral` … ほぼ無彩色。写真・図表が主役の画面向け

---

## 役割と使い場所

| 役割 | 使う場所 |
|---|---|
| `--primary` / `--on-primary` | 塗りの主ボタン、自分の吹き出し、グラフの1系列目、送信、接続ボタン群の選択ピル |
| `--primary-container` / `--on-primary-container` | FAB、読み込みの印の器、「有効」のバッジ、正解 |
| `--secondary-container` / `--on-secondary-container` | **選択中**のチップ・行・タイル、tonal ボタン（既定の `.btn`）、ナビゲーションバーの選択ピル、進捗のトラック |
| `--tertiary-container` | 2系列目（収入/資産など、1系列目と区別が要るときだけ） |
| `--error` / `--error-container` | 超過、期限切れ、削除の予告、失敗の通知 |
| `--surface` | 画面の地 |
| `--surface-lowest` | 地より沈めたい面（コード欄など） |
| `--surface-low` | ボトムシート |
| `--surface-mid` | パネル・カード・行・ナビゲーションバー・潜ったトップアプリバー |
| `--surface-high` | 通知カード、ダイアログ、浮くツールバー |
| `--surface-highest` | filled テキストフィールド、トラック、骨（スケルトン） |
| `--on-surface` / `--on-surface-variant` / `--outline` | 本文 / 補助文 / 弱い文字・枠 |
| `--outline-variant` | 区切り線（1px）。0.5px の hairline は使わない |
| `--inverse-surface` / `--inverse-on-surface` / `--inverse-primary` | スナックバー |
| `--scrim` | シート・ダイアログの暗幕（32%）。**背後が触れないことを示す唯一の合図** |

### 面の5段の意味

「高さ」を明度で表す。ライトでは lowest が最も明るく、ダークでは highest が
最も明るい。**どちらでも highest が最も"手前"**。

```
surface          画面の地
 └ surface-low       シート（地から少し浮く）
    └ surface-mid       カード・行・バー
       └ surface-high      ダイアログ・通知・浮くツールバー
          └ surface-highest   入力欄・トラック・骨
```

面を重ねるときは**必ず1段ずつ**。`surface` の上にいきなり `surface-highest` を
置くと、段が飛んで「浮いている」ではなく「別のもの」に見える。

---

## 状態レイヤー

M3 では、押下・ホバー・フォーカスは**地の上に on-色を薄く重ねて**表す。

| 状態 | 不透明度 | トークン |
|---|---|---|
| hover | 8% | `--hover-on-surface` |
| focus | 10% | — |
| pressed | 10% | `--pressed-on-surface` / `--pressed-primary` |
| dragged | 16% | — |

**★`box-shadow: inset 0 0 0 999px` で重ねる★**

```css
.btn {
  background: var(--secondary-container);
  --btn-layer: transparent;
  box-shadow: inset 0 0 0 999px var(--btn-layer);
  transition: box-shadow var(--d-tap) var(--ease-effects);
}
.btn.is-pressed { --btn-layer: var(--pressed-on-surface); }
```

`background` を直接差し替えると、地色の `transition` と混ざって
「押した色」と「もとの色」の中間の変な色を通過する。inset の影なら
地色から独立して重なる。

**濃い地の上では白で重ねる。** `--primary` の上に `on-surface`（暗い色）を
重ねても、シードによっては差が見えない。

```css
.btn--filled.is-pressed { --btn-layer: rgb(255 255 255 / 0.14); }
```

---

## 明暗の切り替え

```
:root                          ライト（既定）
@media (prefers-color-scheme: dark) :root    端末がダークなら
[data-theme='dark']            明示指定。★メディアクエリより後に書いて勝たせる★
[data-theme='light']
```

`lib/theme.ts` の `applyTheme()` が `<html data-theme>` を書き、
`<meta name="theme-color">` を **`--surface` の算出値から取り直す**。
ここに hex を直書きすると、色を変えたときに必ず直し忘れて、
画面上端に前のテーマの帯が残る。

### ★別名を `:root` にだけ置かない★

```css
:root,
[data-theme] {           /* ← [data-theme] にも当てる */
  --primary: var(--md-sys-color-primary);
  ...
}
```

カスタムプロパティの `var()` は**その要素で**算出値に解決されてから継承される。
画面の一部だけ明暗を変えたいとき（記事だけ暗く、プレビューだけ明るく）、
別名を `:root` にだけ置くと、子には「`:root` で解決済みの色」が継承され、
その要素の `--md-sys-color-*` を書き換えても別名が追従しない。

**★色に関わるものだけをここに置く★** 動きの `--d-*` をここに入れると、
視差低減の `@media`（`:root` に書く）が `[data-theme]` の再宣言に負ける。

---

## 写真・動画の上に置くもの

ここだけはテーマに追従させない。背後が必ず写真だから、
テーマの色を使うと明るい写真の上で消える。

```css
.iconbtn--onmedia {
  background: rgb(0 0 0 / 0.45);
  color: #ffffff;
}
```

**手書きの hex を許すのはここだけ。**（と、暗い写真の上に敷く黒帯）

---

## コントラスト

- 本文は 4.5:1 以上。生成された `on-` 色を**正しい組で**使っていれば満たす
- ❌ `primary-container` の上に `primary` … 同系なので落ちる。`on-primary-container` を使う
- ❌ `surface-mid` の上に `outline` で本文 … `outline` は「弱い文字・枠」用
- 色だけで状態を伝えない。選択中は「色 + 太字 + 太い線のアイコン」のように重ねる
