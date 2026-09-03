# 03. 形

## shape scale

| トークン | 値 | 用途 |
|---|---|---|
| `--shape-xs` | 4 | filled テキストフィールドの上角、骨、写真の上のバッジ |
| `--shape-sm` | 8 | チップ、バッジ、スナックバー、小ボタンの押下形 |
| `--shape-md` | 12 | ボタンの押下形、small FAB、カード内の小物、アイコンボタンの押下形 |
| `--shape-lg` | 16 | パネル・カード、FAB、通知カード |
| `--shape-lg2` | 20 | 吹き出し |
| `--shape-xl` | 28 | ボトムシート上端、ダイアログ、検索欄のピル、FAB の押下形 |
| `--shape-xl2` | 32 | 大きな面の上端 |
| `--shape-xxl` | 48 | 全面のヒーロー |
| `--shape-full` | 999 | ボタン・チップ群・ナビゲーションの選択ピル・接続ボタン群 |

**中身より外の器のほうが角丸は大きい。** 16 のカードの中に 16 の要素を入れると、
角が平行に走って窮屈に見える。中は 1 段落とす（16 の中には 12）。

---

## shape morph — Expressive の顔

押している間だけ `border-radius` が変わる。**これが「押した」の伝え方**で、
縮める（`scale`）・透けさせる（`opacity`）は使わない。

```css
.btn {
  border-radius: var(--shape-full);
  transition: border-radius var(--d-spatial-fast) var(--ease-spatial-fast);
}
.btn:active,
.btn.is-pressed { border-radius: var(--shape-md); }
```

### 変化の対応

| 部品 | 通常 → 押下 |
|---|---|
| ボタン（48） | `full` → `md`(12) |
| ボタン（XS 32） | `full` → `sm`(8) |
| ボタン（M 56 / 幅いっぱい） | `full` → `lg`(16) |
| アイコンボタン | `full` → `md`(12) |
| FAB | `lg`(16) → `xl`(28) |
| チップ | 変えない（32 と小さく、`sm`(8) から動かすと形が読めない）。状態レイヤーだけ |
| カード・行 | 変えない。状態レイヤーだけ |
| 写真グリッドのタイル | 変えない。並んだ矩形が一斉に動くとちらつく |

**大きいものほど押下の角丸も大きい。** 56 のボタンを 12 にすると角が立ちすぎる。

---

## ★`:active` だけに頼らない★

Chromium はタッチ由来の `:active` を GestureShowPress（体感 150ms 前後）まで
待ってから当てる。つまり素の CSS だけだと「押した瞬間に何も起きない」時間が
生まれ、そこで安っぽくなる。

`lib/press.ts` が `pointerdown` で `.is-pressed` を即座に付ける。
CSS は必ず**両方**書く:

```css
.btn:active,
.btn.is-pressed { ... }
```

`pointercancel` も外す対象に入れること。指を置いたままスクロールを始めると
`pointerup` は来ないので、押しっぱなしの見た目で固まる。

---

## 形で状態を言う

選択されていることを形で示してよい場面がある（設定のテーマ色の見本など）。
同じ作法で `border-radius` を `full → md` にする。

```css
.seedbtn { border-radius: var(--shape-full); }
.seedbtn[aria-pressed='true'] { border-radius: var(--shape-md); }
```

ただし**色と併用する**こと。形の変化だけでは、隣に比較対象が無いと読めない。
