# 18. 一覧・表・図

---

## 一覧か、表か

| | 使うもの |
|---|---|
| 携帯（〜599） | **必ず `.rowlist`**。表は使わない |
| 1件が2〜3個の値しか持たない | `.rowlist`（主文 + 副題 + 右端の値） |
| 列どうしを見比べる（金額の大小、日付の並び） | `.table` |
| 並べ替え・絞り込み・選択が要る | `.table` |

**★携帯で表を使わない★** 360px には列が2つしか入らない。
横スクロールする表は、見出しが流れていって「いま何の列を見ているか」が消える。

同じデータを両方で見せるときは、**幅で描き分ける**:

```html
<div class="rowlist" data-compact>…携帯用…</div>
<div class="table-wrap" data-wide>…PC 用…</div>
```

```css
@media (max-width: 839px) { [data-wide] { display: none } }
@media (min-width: 840px) { [data-compact] { display: none } }
```

---

## 表

```html
<div class="table-wrap scroller">
  <table class="table">
    <thead>
      <tr>
        <th class="table__stick">名前</th>
        <th><button class="table__sort" aria-sort="descending">金額<svg class="icon icon--sm">…</svg></button></th>
        <th>日付</th>
      </tr>
    </thead>
    <tbody>
      <tr aria-selected="false">
        <td class="table__stick">家賃</td>
        <td class="table__num">72,000</td>
        <td class="mono">09/01</td>
      </tr>
    </tbody>
  </table>
</div>
```

- 見出しは `position: sticky`。**縦に長い表で列の意味が消えない**
- 名前の列は `.table__stick`（左端に固定）。**地を必ず塗る** — 透けると下の行が見える
- 数値は `.table__num`（右寄せ + 等幅）。**日付も等幅**にする（`.mono`）
- **★区切りは `border` ではなく `inset` の影★** `border-collapse` と `sticky` を
  併用すると、Chromium で見出しの下線だけが一緒にスクロールする
- 行を選べるなら `aria-selected`。選択中は `--secondary-container`
- 詰めたいときは `.table--dense`（56/52 → 40/36）

### 表の操作

| やりたいこと | どこに置く |
|---|---|
| 並べ替え | 見出しのボタン（`.table__sort` + `aria-sort`） |
| 絞り込み | 表の上に `.chips`、多いならサイドシート |
| 列の表示/非表示 | 表の右上のメニュー（`.menu` + `.checkbox`） |
| 選択したものへの操作 | **浮くツールバー**（`.toolbar`）。行ごとにボタンを置かない |
| ページ送り | 表の下に `.pager`（件数が意味を持つときだけ） |

### 表の4状態

読み込み中は**表の形のまま**骨を出す（`<td>` の中に `.skel`）。
表ごと消して四角い骨にすると、列幅が変わって届いた瞬間に跳ねる。

```html
<td><div class="skel" style="width: 70%; height: 14px"></div></td>
```

---

## 長い一覧

- **仮想化する。** 数千行を DOM に置かない
- 区切りの見出しは `.label--sticky`（`top: var(--inset-top)`、**地を塗る**）
- 追加読み込みは無限スクロール。ページ送りは使わない
- 引いて更新（`.ptr`）を付ける
- 1件の高さを固定できるなら固定する（スクロールバーが暴れない）

---

## 図（chart）

**★描くのは JS / SVG。ここで決めるのは色と目盛りの作法だけ★**

### 色

```
--series-1  primary          1系列目。単一系列は必ずこれ
--series-2  tertiary
--series-3  secondary
--series-4  primary-fixed-dim
--series-5  tertiary-fixed-dim
--grid      outline-variant  グリッド線
--axis      on-surface-variant  目盛りの文字
```

- **★4系列を超えたら色で分けるのを諦める★** M3 の配色は「意味を持つ役割」で
  できていて、categorical palette ではない。5色目以降は互いに区別できない。
  線の横に直接ラベルを置くか、小さい図を並べる（small multiples）に切り替える
- **★`error` を系列色に使わない★** 赤は「超過・失敗」の意味を持っている。
  ただし「予算を超えた部分」のように**意味が合っているときは使う**
- 系列が3つ以下なら**凡例を置かず、線の横に直接ラベルを書く**。
  凡例は目を図と凡例の間で往復させる

### 形

```html
<svg class="chart" viewBox="0 0 320 160" preserveAspectRatio="none">
  <path class="chart__grid" d="M0 40H320M0 80H320M0 120H320" />
  <path class="chart__area" data-series="1" d="…" />
  <path class="chart__line" data-series="1" d="…" />
</svg>
<div class="legend">…</div>
```

- `viewBox` だけで描き、`width`/`height` を書かない。器の幅がそのまま倍率になる
- グリッドは**横線だけ**。縦のグリッドは値を読むのに要らない
- 0 から始める（棒グラフは必ず。折れ線は変化を見せたいなら例外あり、その旨を書く）
- 軸の数字は等幅（`--font-num` + `tabular-nums`）

### 触る

- **★点をタップさせない★** 指より小さい。**縦の帯**（列全体）を当たり判定にする
- 値の表示は、指の位置ではなく**図の上か下の固定の場所**に出す
  （指で隠れる場所に出さない）
- なぞって値を追わせるなら、指の位置に縦線を1本引く

図をたくさん作るときは、色・目盛り・凡例の設計に踏み込んだ指針
（dataviz のスキル）が別にある。この章はそれと矛盾しない範囲の M3 側の規約。

---

## 進み具合の見せ方

| | 使うもの |
|---|---|
| 割合（横長の場所がある） | `.meter`（線） |
| 割合（正方形の場所しかない） | `.ring`（環） |
| 何番目の手順か | `.steps` |
| 起きたことの並び | `.timeline` |
| 終わりが分からない | `.loader`（読み込みの印） |

`.ring` は `--p`（0〜100 の数）を渡す。`conic-gradient` + `mask` なので SVG が要らない。

```html
<div class="ring-wrap">
  <div class="ring" style="--p: 62"></div>
  <span class="ring__label">62</span>
</div>
```

---

## 空・エラー

一覧・表・図の**すべて**に、4つの状態を作る（→ [11-states](11-states.md)）。

- 表が空 → `<tbody>` を消して `.empty` を出す（**見出しは残す**。列の意味は消さない）
- 絞り込んだ結果が空 → ボタンは「絞り込みを外す」
- 図にデータが無い → 軸だけ描いて「まだ記録がありません」。
  **空の図を描かない**（0 の線が引かれると「0 だった」に見える）
