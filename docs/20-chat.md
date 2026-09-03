# 20. 会話（チャット）

AI アプリでもメッセージアプリでも、要るものは同じ。
実体は `starter/styles/components-chat.css`。

---

## チャットは「一覧」ではない

並んでいるものが等価な項目ではなく、**時間順の発話**。
リストの作法をそのまま持ち込むと読めなくなる。

| ❌ 一覧の作法 | ✅ 会話の作法 |
|---|---|
| 区切り線を引く | 引かない。発話は独立した項目ではない |
| 左揃えで積む | **自分は右、相手は左。** 色だけで分けない |
| 新しいものが上 | **新しいものが下。** 読み込みは上に足す |
| 幅いっぱいの行 | **中身なりの幅。** 1文字の返事が画面幅にならない |

---

## 骨組み

```html
<div class="chat">
  <div class="chat__log">
    <span class="chat__mark">今日</span>
    <div class="msg">…相手…</div>
    <div class="msg msg--me">…自分…</div>
  </div>
  <div class="composer">…</div>
</div>
```

`.chat` は `.main` の**代わり**に使う。縦の flex 列で、上が流れる場所、
下が入力帯。`.main` の `padding-bottom` では入力帯を避けられない
（キーボードが出たときに一緒に上がってほしいため）。

`.chat__log` は `justify-content: flex-end`。**発話が少ないうちは下に寄せる** —
上に寄せると入力帯との間に広い空白ができて「壊れている」ように見える。

---

## 発話

```html
<div class="msg msg--me">
  <div class="msg__bubble">38,420円でした。</div>
  <div class="msg__meta">09:12 · 既読</div>
</div>
```

| クラス | |
|---|---|
| `.msg` | 相手（左寄せ、`surface-high`） |
| `.msg--me` | 自分（右寄せ、`primary` の塗り） |
| `.msg--cont` | 続けて話している。隣り合う角だけ小さくして「ひと続き」に見せる |
| `.msg--pending` | 送信中。**消さずに薄くする**（消えると失敗に見える） |
| `.msg--failed` | 失敗。`error-container` + もう一度押せる |

- **★時刻・既読は吹き出しの外★** 中に入れると、短い返事のときに
  本文より時刻のほうが幅を決めてしまう
- **★吹き出しの中は `user-select: text` に戻す★** `base.css` で切ってあるが、
  会話の中身はコピーされるためにある
- 長い URL や ID で横に溢れないよう `overflow-wrap: anywhere`

### 発話に付ける操作

```html
<div class="msg__acts">
  <button class="iconbtn" aria-label="コピー">…</button>
  <button class="iconbtn" aria-label="やり直す">…</button>
</div>
```

**★常に出す★** hover でしか出ない操作は、触る画面では**永久に見つからない**
（→ [15-adaptive](15-adaptive.md) の最後）。

---

## AI の返答

中身は `.prose` で描く（→ [09-components](09-components.md)）。
markdown を描画するので、こちらが構造を決められない。

```html
<div class="msg__bubble">
  <div class="prose">…markdown を描いたもの…</div>
</div>
```

### 流れてくる途中（ストリーミング）

```html
<div class="msg__bubble">いま書いている途中<span class="msg__caret"></span></div>
```

- **★点滅させない★** 点滅は目を引きすぎて、肝心の文字が読めなくなる
- **★点が3つ跳ねるアニメーションにしない★** 待たされている時間を
  ただ強調するだけになる。M3 の読み込みの印と同じで、
  「進んでいる」ことだけを静かに示す（`.msg__typing`）
- 流れている間は入力帯の上に「止める」（`.chat__stop`）を出す

### 自動スクロール

- 一番下に居るときだけ追従する
- **★上を読んでいる間は動かさない★** 勝手に下へ飛ぶのが最悪の体験
- 下から離れたら「最新へ」（`.chat__jump`、small FAB）を出す

---

## 入力帯

```html
<div class="composer">
  <button class="composer__act" aria-label="添付">…</button>
  <textarea class="composer__input" rows="1" placeholder="メッセージ"></textarea>
  <button class="composer__send" aria-label="送信">…</button>
</div>
```

- **★`font-size` は 16px を下回らせない★**（`--t-input`）。
  下回ると iOS がフォーカスで画面を拡大して戻さなくなる
- 1行のときは 48、伸びても**最大 5行ぶん**（132px）。
  無制限に伸ばすと画面が入力欄で埋まる
- 空のときは送信を押せなくするが、**消さない**
  （消えると「送るところが無い」画面になる）
- ナビゲーションバーと同居するときは `.composer--above-bar`

```js
/* 中身で伸ばす。最大は CSS の max-height が抑える */
const grow = () => {
  ta.style.height = 'auto'
  ta.style.height = `${ta.scrollHeight}px`
  send.disabled = !ta.value.trim()
}
```

### Enter の扱い

| 端末 | 送る | 改行 |
|---|---|---|
| 携帯 | **送信ボタンだけ** | Enter |
| PC | Enter | Shift+Enter |

**★携帯で Enter を送信にしない★** 日本語入力の変換確定と取り合う。
`isComposing` を見ても端末差で漏れる。

---

## 状態

会話にも4つの状態がある（→ [11-states](11-states.md)）。

| 状態 | |
|---|---|
| 読み込み中 | 骨（`.skel`）を吹き出しの形で置く。全画面スピナーにしない |
| 空 | 「何でも聞いてください」+ **例の質問を3つチップで置く**。空画面は招待状 |
| エラー | その発話だけ `.msg--failed`。会話全体を壊さない |
| 中身あり | 本体 |

送信は**楽観的更新**。押した瞬間に自分の発話を出し、
失敗したら `.msg--failed` に変えて「もう一度」を出す。
