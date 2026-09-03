# 22. アイコン

## Lucide を使う。自分で描かない

[Lucide](https://lucide.dev)（ISC）は、M3 の作法と**最初から一致している**。

| | Lucide | M3 | |
|---|---|---|---|
| 塗り | `fill: none` | 線で描く | ✅ 一致 |
| 色 | `stroke: currentColor` | 文字色に従う | ✅ 一致 |
| 端点 | `round` | 丸 | ✅ 一致 |
| 格子 | 24×24 | 24 | ✅ 一致 |
| 太さ | **2** | **1.8** | ⚠ `.icon` の CSS が上書きする |

太さだけが違うが、Lucide は `stroke-width` を**属性**で持っていて、
CSS は presentation attribute に勝つので `.icon { stroke-width: 1.8 }` で揃う。

Material Symbols（Google 純正）を使わない理由: 可変フォントで 数百 KB あり、
塗りのアイコンが混ざるので「全部ストローク設計」の規約が守れなくなる。

---

## 配り方 — 使うものだけ焼く

2,050 個を全部配らない。**使うアイコンは設計時に決まるもの**なので、
配色と同じくビルド前に静的化する。

```
starter/scripts/gen-icons.mjs   ← ここの NAMES に lucide の名前を足す
        ↓  npm run gen:icons
starter/icons/sprite.svg        ← <symbol id="i-*"> を並べたもの（生成物）
starter/lib/icons.ts            ← 同じものを文字列で持つ + 名前の型（生成物）
```

```sh
npm i -D lucide-static
npm run gen:icons
```

無い名前を書くと**その場で落ちる**（Lucide は改名があるので、
黙って空のアイコンが出るより落ちたほうがよい）。

いま焼いてあるのは 106 個。行き先・操作・もの・人・状態・見せ方・
文字を書く、の7系統をひととおり。

---

## 使い方

### 1. スプライト（枠組みを問わない。これが既定）

起動時に1回だけ差し込む:

```ts
import { SPRITE } from './lib/icons'
document.body.insertAdjacentHTML('afterbegin', SPRITE)
```

あとはどこでも:

```html
<svg class="icon"><use href="#i-search" /></svg>
<svg class="icon icon--sm"><use href="#i-check" /></svg>
<svg class="icon icon--lg"><use href="#i-upload" /></svg>
```

**★太さ・色・大きさは `.icon` の CSS が持つ★** `<symbol>` の中には
`stroke` も `fill` も入っていない。`stroke` / `fill` / `stroke-width` /
`stroke-linecap` / `stroke-linejoin` は**継承されるプロパティ**なので、
`<use>` の影の中にもちゃんと届く。

### 2. React で書くなら

```sh
npm i lucide-react
```

```tsx
import { Search } from 'lucide-react'
<Search className="icon" />
```

`.icon` を付ければ寸法も太さも揃う。`size` や `strokeWidth` を props で
渡さない — 渡すと部品ごとにバラける。

### 3. 1つだけ要るとき

`node_modules/lucide-static/icons/<name>.svg` の中身をそのまま貼って、
外側の `<svg>` の属性は捨てる（`class="icon"` に置き換える）。

---

## 名前は用途で付ける

生成スクリプトの `NAMES` は「Lucide の名前 → このキットでの id」の対応表。

```js
house: 'home',            // ✅ 用途
'chevron-left': 'back',   // ✅ 用途
'ellipsis-vertical': 'more',
```

**★見た目で付けない★** `i-house` にすると、後で別の絵に差し替えたときに
名前が嘘になる。`i-home` なら絵が変わっても正しいままでいられる。

---

## 規約

- **ストローク設計に統一する。** `fill: currentColor` に切り替えない。
  線で描いたアイコンは塗りにするとただの塊になる
- **`aria-label` を必ず付ける。** アイコンだけのボタンは、ラベルが無いと
  読み上げで「ボタン」としか読まれない
- 装飾だけのアイコン（ラベルが隣にある）は `aria-hidden="true"`
- **色で意味を持たせない。** 「赤いアイコン = 危険」は、色が見えない人に
  届かない。文字も添える
- **アイコンだけで操作を表さない。** 意味が自明なもの（✕・+・戻る・検索）
  以外は、ラベルを付けるかメニューの中に入れる

| 寸法 | クラス | 使う場所 |
|---|---|---|
| 16 | `.icon--sm` | 行の中、ボタンの中、右端の矢印 |
| 22 | `.icon` | 既定 |
| 24 | `.icon--lg` | ナビゲーションバー、FAB、空状態 |

タップできるアイコンは、見た目が 22 でも**当たり判定は 48**
（`.iconbtn` が面倒を見る）。

---

## 図鑑で一覧を見る

部品図鑑（`npm run demo`）の索引で `アイコン` を引くと、
焼いてある 106 個が id 付きで並ぶ。
