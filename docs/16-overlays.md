# 16. 重ねるもの

メニュー・ポップオーバー・ツールチップ・開閉・コマンドパレット。

---

## まず: 何で出すかを選ぶ

| 出したいもの | 携帯（compact） | PC（expanded） |
|---|---|---|
| 行の「その他の操作」 | **ボトムシート** | メニュー（`⋮` から） |
| 並べ替え・絞り込み | **ボトムシート** | メニュー / サイドシート |
| 短い説明 | ラベルを省かない | ツールチップ |
| 中身が自由な補足 | ボトムシート | ポップオーバー |
| 戻せない確認 | ダイアログ | ダイアログ |
| 何かを探す | 全画面の検索（`.searchview`） | コマンドパレット |

**★携帯でメニューを使わない★** 小さい画面で「押した場所の近くに小さい板」を出すと、
出た瞬間に**指で隠れる**。同じ選択肢はボトムシートで出す。

---

## 出し入れは Popover API に任せる

```html
<button class="iconbtn" popovertarget="m1" aria-expanded="false" aria-label="その他">⋮</button>
<div popover id="m1" class="menu">…</div>
```

`popover` 属性を付けるだけで、ブラウザが以下をやる:

- 外側を押したら閉じる（light dismiss）
- Esc で閉じる
- **top layer に出す** — 親の `overflow: hidden` や `z-index` に影響されない
- 同時に開けるのは1つ（`popover="auto"`）

**★自前の「外側クリック検出」を書かない★** 必ずスクロール中や iframe の中で漏れる。
対応: Chrome 114+ / Safari 17+ / Firefox 125+。

`[popover]` の既定は「中央に置いて `margin: auto`」なので、
`components-overlay.css` が `margin: 0; inset: auto` に戻している。
その上で位置を決めるのが `lib/overlay.ts`。

```ts
import { bindMenu, bindContextMenu, keyboardList, bindTooltip } from './lib/overlay'

bindMenu(triggerEl, menuEl, { placement: 'bottom-end' })
```

`bindMenu` がやること: 開いたら位置を合わせる / スクロールとリサイズに追従する /
`aria-expanded` を切り替える / 項目を押したら閉じる。

**★top layer に出た要素は親の `transform` の影響を受けない★**
だから fixed 座標で計算してよい（`.app` に transform を載せてはいけない
という [07-motion](07-motion.md) の制約は、こちらには効かない）。

---

## メニュー

M3 menu / 角 xs(4) / `--surface-mid` / elev-2 / 項目 48

```html
<div popover id="m1" class="menu">
  <div class="menu__label">この項目</div>
  <button class="menu__item">
    <svg class="icon">…</svg>複製<span class="menu__trailing">⌘D</span>
  </button>
  <button class="menu__item" aria-disabled="true">…共有（準備中）</button>
  <div class="menu__sep"></div>
  <button class="menu__item menu__item--danger"><svg class="icon">…</svg>削除</button>
</div>
```

- 項目は label-l（14/500）、`nowrap`
- 右端（`.menu__trailing`）はショートカット・チェック・入れ子の矢印
- 破壊的な項目は `--danger`。**メニューの一番下に置いて、区切りで離す**
- **★入れ子のメニューを作らない★** 触る画面で辿れない。2階層要るなら
  それはメニューではなくシートか画面

### コンテキストメニュー

```ts
bindContextMenu(areaEl, menuEl)
```

右クリック（PC）と長押し 500ms（触る画面）の両方で開く。
長押しで開いたときは短い振動を返す（開いたことを指に伝える）。

---

## ポップオーバー

メニューとの違いは「行が並ぶ」か「自由な中身か」だけ。

```html
<button class="btn" popovertarget="p1">詳しく</button>
<div popover id="p1" class="popover">
  <strong>予算とは</strong>
  <span class="muted">その費目に月いくらまで使うかの目安です。</span>
  <button class="btn btn--sm">設定する</button>
</div>
```

`--surface-high` / 角 lg / elev-2 / 最大 320。

---

## ツールチップ

**★触る画面には出さない★** 指には hover が無いので、タップで出すと
「押した」のか「説明が出た」のか分からなくなる。
`bindTooltip()` は `pointer: coarse` のとき**何もしない**。

```html
<button class="iconbtn" id="t-btn" aria-describedby="t1">…</button>
<div popover id="t1" class="tip">元に戻す（⌘Z）</div>
```

```ts
bindTooltip(document.getElementById('t-btn'), document.getElementById('t1'))
```

- plain（`.tip`）… `--inverse-surface` / body-s / 最大 224 / **押せない**
- rich（`.tip--rich`）… 表題・本文・操作を持てる / `--surface-high` / **押せる**
- キーボードのフォーカスでも出す。マウスだけの情報にしない

携帯で同じことを伝えたいなら:
1. ラベルを省かない（アイコンだけにしない）
2. 初回だけ `.banner` で説明する
3. 設定画面に `.field__help` として書く

---

## 開閉（アコーディオン）

**★`<details>` / `<summary>` で作る★** 開閉の状態・キーボード操作・
読み上げ・ページ内検索をブラウザが持つ。`div` と JS で作り直さない。

```html
<div class="accordion">
  <details class="accordion__item">
    <summary class="accordion__head">
      <span>配送について</span>
      <svg class="accordion__chevron">…</svg>
    </summary>
    <div class="accordion__body">通常3〜5日で届きます。</div>
  </details>
</div>
```

- `list-style: none` と `::-webkit-details-marker` の両方を消す（消さないと ▶ が出る）
- 高さのアニメーションは `interpolate-size` + `::details-content`
  （Chrome 131+）。**入っていない環境では瞬間的に開くだけで、壊れない**
- 排他（1つだけ開く）にしたいときは `<details name="faq">`（同じ name で排他）

**★FAQ 以外でアコーディオンを使う前に考える★** 「畳んでおきたい」は
たいてい「その画面に置く情報が多すぎる」の言い換え。

---

## コマンドパレット

```html
<div class="command">
  <div class="command__head">
    <svg class="icon">…</svg>
    <input class="command__input" placeholder="何をしますか" />
    <span class="kbd">esc</span>
  </div>
  <div class="command__list">
    <div class="menu__label">最近</div>
    <button class="command__item" aria-selected="true">
      <svg class="icon">…</svg>新しい記録<span class="command__sub">⌘N</span>
    </button>
  </div>
</div>
```

```ts
const kb = keyboardList(inputEl, listEl, '.command__item', (el) => run(el.dataset.id))
kb.first()
```

- **★`hover` ではなく `aria-selected` で「いま辿っている場所」を示す★**
  キーボードで下に動かしたとき、マウスの位置に印が引きずられない
- `↑↓` / `Home` / `End` / `Enter` を拾う。マウスを乗せたら印もそこへ移す
- 携帯では `.searchview`（全画面）にする。⌘K は PC の作法

---

## 全画面の検索（M3 search view）

```html
<div class="searchview">
  <div class="searchview__head">
    <button class="iconbtn" aria-label="戻る">…</button>
    <input class="searchview__input" placeholder="検索" autofocus />
    <button class="iconbtn" aria-label="消す">…</button>
  </div>
  <div class="searchview__body">
    <div class="rowlist">…候補…</div>
  </div>
</div>
```

`.search`（ピル）を押したら、これが全画面で開く。
**入場は「ピルが広がって画面になる」**（共有要素トランジション、`spatial`）。

---

## ダイアログ

```html
<div class="scrim"></div>
<div class="dialog dialog--alert">
  <svg class="dialog__icon">…</svg>
  <h2 class="dialog__title">4件を完全に削除しますか</h2>
  <p class="muted">この操作は元に戻せません。</p>
  <div class="dialog__acts">
    <button class="btn btn--text">やめる</button>
    <button class="btn btn--danger">削除する</button>
  </div>
</div>
```

- **★本当に戻せないものだけ★** 取り消せる操作はスナックバーの「元に戻す」
  （→ [11-states](11-states.md)）
- 破壊的な選択肢を**既定のフォーカスにしない**
- 中身が長いときは `.dialog--scroll`（頭と足を固定して中だけ流す）
- ネイティブの `<dialog>` + `showModal()` を使ってもよい。その場合
  `::backdrop` に `--scrim` を塗り、`.scrim` は使わない

---

## 重なり順

`tokens.css` の1箇所で決めてある。各ファイルで発明しない。

```
--z-sheet: 89     シート・ドロワー（モーダル）・ダイアログ
--z-menu: 90      メニュー・ポップオーバー・候補（シートの中からも開く）
--z-snackbar: 95  取り消せる唯一の場所
--z-tooltip: 96   最前
```

Popover API で出したものは **top layer**（`z-index` の外）に出るので、
上の値は「Popover API を使わない場合」の保険。
