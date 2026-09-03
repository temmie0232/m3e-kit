# 08. 画面の外殻

## 骨組み

```html
<div class="app">
  <header class="appbar">…</header>     <!-- 絶対配置で上に重なる -->
  <main class="main main--padded">…</main>  <!-- 全高。バーの下を流れる -->
  <button class="fab">…</button>
  <nav class="navbar">…</nav>           <!-- 絶対配置で下に重なる -->
</div>
```

`.main` が `.app` の全高を占め、その上にバーを重ねる。コンテンツは両者の下を
`padding` で避けて流れる。**位置決めの基準を1つにできる**のが利点。

```css
.main {
  padding-top: var(--inset-top);
  padding-bottom: var(--inset-bottom);
  scroll-padding-top: var(--inset-top);
}
```

---

## ★上下の占有量は2本のトークンに集約する★

```css
--nav-h: 64px;        /* トップアプリバー */
--dock-h: 80px;       /* ナビゲーションバー */
--inset-top: calc(var(--nav-h) + var(--safe-top));
--inset-bottom: calc(var(--dock-h) + var(--safe-bottom));
```

FAB・浮くツールバー・スナックバー・引いて更新の印は、**必ずここから calc する**。

```css
.fab { bottom: calc(var(--inset-bottom) + var(--s-4)); }
```

各所で個別に `calc(80px + env(...))` と書くと、1箇所でも直し漏れたときに
スナックバーがバーの裏に隠れて「元に戻す」が押せなくなる
＝ **取り消し不能な削除**になる。

バーを持たない画面（ログインなど）は body のクラスで上書きする:

```css
body.no-bars {
  --inset-top: var(--safe-top);
  --inset-bottom: var(--safe-bottom);
}
```

★`:root` に定義して `body` で上書きする★ `body` 直下の portal
（スナックバー）には `.app` のカスタムプロパティが届かない。

---

## 重なり順は1箇所で決める

```css
--z-bar: 20;       /* トップアプリバー / ナビゲーションバー */
--z-float: 15;     /* FAB・引いて更新の印（バーの下から出る） */
--z-toolbar: 21;   /* 浮くツールバー（バーより上） */
--z-viewer: 60;    /* 全画面ビューア */
--z-flight: 70;    /* 共有要素で飛んでいる1枚 */
--z-scrim: 88;
--z-sheet: 89;     /* ビューアより上。写真を消す確認がビューアの裏に隠れない */
--z-snackbar: 95;  /* 常に最前。何かを取り消せる唯一の場所だから */
```

各ファイルで `z-index` を発明しない。足りなくなったらこの表に足す。

---

## 高さの単位

```css
height: 100%;
height: 100dvh;   /* ★% を先に書いて dvh で上書き★ */
```

未対応環境では `dvh` の宣言ごと捨てられて `%` が残る。
`dvh` にすると、ブラウザで URL バーが出入りしても下端のバーが動かない。

`max-height: 88vh; max-height: 88dvh;` も同じ書き方。

---

## トップアプリバー

M3 の center-aligned top app bar（64）。

- 最上部では地と同じ色（`--surface`）
- コンテンツが下に潜ると `--surface-mid` に変わる（M3 の on-scroll 色）
- **影は付けない。** M3 は色の変化だけで潜りを表す

```js
main.addEventListener('scroll', () => {
  const next = main.scrollTop > 4
  if (next !== solid) { solid = next; appbar.classList.toggle('appbar--solid', solid) }
}, { passive: true })
```

★しきい値をまたいだときだけ class を触る★ 毎フレーム `toggle` を呼ぶと
スタイル再計算が走り続ける。`{ passive: true }` を忘れない。

タイトルを必ず中央に置くために、両端を `1fr` にした3列 grid にする
（中身の有無に関わらず中央が動かない）。

---

## ナビゲーションバー

M3 navigation bar（80、`--surface-mid`、画面下端に**貼り付く**。浮かせない）。

- 選択中の札は「アイコンの背後の 64×32 のピル（`--secondary-container`）」
- タブを移るとピルが `spatial` のバネで**横に滑る**
- 選択中は「太い線のアイコン + 太字のラベル」。**色だけで示さない**

区画数は `--nav-n`、選択位置は `--nav-i` で渡す（変数1本に集約）。

```css
.navbar { grid-template-columns: repeat(var(--nav-n, 4), 1fr); }
.navbar__ind {
  width: calc(100% / var(--nav-n, 4));
  transform: translateX(calc(var(--nav-i, 0) * 100%));
}
```

ピルは「区画幅の透明な箱」を滑らせ、`::before` で中央に描く。
`translateX` の % は自分の幅基準なので、箱の幅 = 区画幅 にしておく必要がある。

区画が6つ以上になると1区画が 60px を切る端末がある。ラベルは `nowrap` にして
溢れさせる（2行に折れるとアイコンごと持ち上がってバーが崩れる）。

---

## 画面の入場

**フェードだけ。横スライドさせない。**

```css
.main { animation: screen-in var(--d-effects) var(--ease-effects); }
@keyframes screen-in { from { opacity: 0 } }
```

タブは階層を降りるのではなく「並列の場所移動」なので、方向を持たせると
位置関係を誤解させる。階層を降りる（一覧 → 詳細）ときだけ、共有要素
トランジションか横方向の動きを使う。

---

## キーボード

```html
<meta name="viewport" content="... interactive-widget=resizes-content" />
```

これが無いと、キーボードが出たときに入力欄が隠れる。
`viewport-fit=cover` も併記して Safe Area を使えるようにする。

---

## 画面の一部だけ明暗を変える

```css
.main[data-theme] {
  background: var(--surface);
  color: var(--on-surface);   /* ★これが無いと文字だけ反転する★ */
}
```

`body` の `color` は `body` で算出値に解決されてから継承されるので、
子で `--on-surface` を再宣言しても文字色は追従しない。**地と一緒に塗り直す。**
