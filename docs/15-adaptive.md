# 15. 画面幅とナビゲーション（適応レイアウト）

携帯だけのアプリなら、この章は読まなくてよい（`.navbar` だけで足りる）。
**PC・タブレットでも使うアプリ**を作るときに読む。

---

## 画面幅クラス（M3 window size class）

| クラス | 幅 | 端末 | 行き先の見せ方 | 中身 |
|---|---|---|---|---|
| compact | 〜599 | 携帯 | ナビゲーションバー（下端 80） | 1枚 |
| medium | 600〜839 | 折りたたみ・縦タブレット | ナビゲーションレール（左端 80） | 1枚 or 一覧+詳細 |
| expanded | 840〜1199 | 横タブレット・小さい PC | 常設ドロワー（左端 360） | 一覧 + 詳細 |
| large | 1200〜1599 | PC | 常設ドロワー | 一覧 + 詳細 + 補助 |
| extra-large | 1600〜 | 大画面 | 常設ドロワー | 同上（本文の幅は増やさない） |

値は `tokens.css` の `--bp-*` に台帳として書いてあるが、
**`@media` は `var()` を読めない**ので、メディアクエリには実数を書く。
両方を必ず一致させること。

**★large 以上で本文の幅を増やさない★** 1行が 90 文字を超えると、
目が行の頭に戻れなくなる。増やすのは「並べる枚数」であって「1枚の幅」ではない。

---

## 使い方

```html
<div class="app app--adaptive">
  <header class="appbar">…</header>

  <!-- 3つとも DOM に置く。CSS が1つだけ見せる -->
  <nav class="rail">…</nav>
  <aside class="drawer drawer--standard">…</aside>
  <nav class="navbar" style="--nav-n: 4">…</nav>

  <main class="main main--padded">…</main>
</div>
```

**★3つとも DOM に置いて、CSS で出し分ける★**
JS で幅を測って出し分けると、リサイズのたびに再マウントされて
入力中の値やスクロール位置が飛ぶ。項目の一覧は同じデータから3回描く
（React なら同じ配列を3回 `map`）。

`.app--adaptive` が付いていると、CSS が自動でやること:

| 幅 | 出るもの | `--inset-start` | `--inset-bottom` |
|---|---|---|---|
| 〜599 | `.navbar` | 0 | 80 + safe |
| 600〜839 | `.rail` | 80 | safe だけ |
| 840〜 | `.drawer--standard` | 360 | safe だけ |

`.main` / `.appbar` の左 padding、`.fab` / `.toolbar` の `left` は
**すべて `--inset-start` から計算される**。個別に書かない
（→ [08-layout](08-layout.md) の「占有量は1本に集約する」）。

840px 以上では `.app` の `max-width: 720px` が外れる。

---

## ナビゲーションレール

M3 navigation rail / 幅 80 / medium 幅

```html
<nav class="rail">
  <button class="iconbtn" aria-label="メニュー"><svg class="icon">…</svg></button>
  <button class="fab" aria-label="追加"><svg class="icon">…</svg></button>
  <button class="rail__item" aria-current="page">
    <svg class="icon">…</svg><span class="rail__label">ホーム</span>
  </button>
  …
  <div class="rail__spacer"></div>
  <button class="rail__item"><svg class="icon">…</svg><span class="rail__label">設定</span></button>
</nav>
```

- 上に「メニュー」と FAB、下に行き先。`.rail__spacer` で下に寄せられる
- 選択ピル（56×32）は**滑らせない**。縦の移動は「上下の階層」に見えてしまう。出入りだけ
- レールの中の FAB は影を落とさない（レール自体が板なので、板の上に浮かせない）
- **★ラベルは1行★** 幅 56px は和文3文字で埋まる

## ナビゲーションドロワー

M3 navigation drawer / 幅 360

```html
<!-- 常設（expanded 幅） -->
<aside class="drawer drawer--standard">
  <h2 class="drawer__head">アプリ名</h2>
  <button class="drawer__item" aria-current="page">
    <svg class="icon">…</svg>ホーム<span class="drawer__n">12</span>
  </button>
  <div class="drawer__label">フォルダ</div>
  <button class="drawer__item"><svg class="icon">…</svg>書類</button>
</aside>

<!-- 覆いをかけて開く（狭い画面で「メニュー」を押したとき） -->
<div class="scrim"></div>
<aside class="drawer drawer--modal">…</aside>
```

- 行き先は高さ 56、角 full、選択は `--secondary-container`
- `--standard` は地と同じ色（板に見せない）、`--modal` は `surface-low` + 右角 xl
- **JS**: `--modal` は `translateX(-100%)` からバネで入れる（`spatial`）

## ボトムアプリバー

M3 bottom app bar / 高さ 80

```html
<div class="bottombar">
  <button class="iconbtn">…</button>
  <button class="iconbtn">…</button>
  <button class="fab" aria-label="追加"><svg class="icon">…</svg></button>
</div>
```

**★行き先とは混ぜない★** 行き先はナビゲーションバー、**その画面の操作**はこちら。
両方が要るなら、それは画面を分ける合図。

## サイドシート

```html
<aside class="sidesheet">
  <div class="sidesheet__head">
    <h2 class="sidesheet__title">絞り込み</h2>
    <button class="iconbtn" aria-label="閉じる">…</button>
  </div>
  <div class="sidesheet__body">…</div>
</aside>
```

- ボトムシートは本文を隠す。**本文を見ながら触りたいもの**はサイドシート
- `.sidesheet--standard` を付けると、expanded 幅では覆いを掛けず横に並ぶ

## パンくず

```html
<nav class="crumbs">
  <a class="crumbs__item">ホーム</a>
  <span class="crumbs__sep">/</span>
  <span class="crumbs__item" aria-current="page">2026年9月</span>
</nav>
```

**★モバイルでは出さない★** 幅が足りず横スクロールになり、「戻る」より使いにくくなる。
expanded 幅から出す。

## ページ送り

```html
<nav class="pager">
  <button class="pager__item" disabled>‹</button>
  <button class="pager__item" aria-current="page">1</button>
  <button class="pager__item">2</button>
  <span class="pager__gap">…</span>
  <button class="pager__item">9</button>
  <button class="pager__item">›</button>
</nav>
```

**★一覧では使わない★** 一覧は無限スクロール + 引いて更新。
ページ送りが要るのは「件数と位置が意味を持つ」**表と検索結果**だけ。

---

## 中身の並べ方（pane）

| 幅 | 並べ方 |
|---|---|
| compact | 1枚。一覧 → 詳細は**画面遷移** |
| medium | 1枚。ただし横向きなら一覧+詳細もあり |
| expanded 以上 | 一覧 + 詳細（list-detail）。一覧は 360、詳細が残り |

```css
.panes {
  display: grid;
  gap: var(--s-4);
}
@media (min-width: 840px) {
  .panes {
    grid-template-columns: minmax(0, 360px) minmax(0, 1fr);
  }
}
```

**★詳細が空のときの状態を作る★** 2枚並べた瞬間に「まだ何も選ばれていない右側」
という状態が生まれる。`.empty` で「左から選んでください」を出す
（→ [11-states](11-states.md)）。

**★compact に戻したときに詳細が消えないようにする★** 選択中の ID を持ち、
compact では詳細だけ、expanded では両方を描く。幅で DOM を作り直さない。

---

## PC で足すもの・足さないもの

| | |
|---|---|
| ✅ 足す | hover の状態レイヤー、キーボードの `:focus-visible`、ショートカット（`.kbd` で見せる）、右クリックのメニュー、細いスクロールバー |
| ✅ 足す | ツールチップ（`pointer: fine` のときだけ）、コマンドパレット |
| ❌ 足さない | 密度を上げるためにタップ判定を 48px 未満にする（同じ CSS を携帯でも使う） |
| ❌ 足さない | hover でしか出ない操作。触る画面では**永久に見つからない** |

「hover でしか出ない操作」は、モバイルでは行の右端に常に置くか、
`⋮` のメニューに入れる。**PC の便利さのために携帯を壊さない。**
