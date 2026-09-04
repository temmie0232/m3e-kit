# 17. 入力の設計

部品の見た目は [09-components](09-components.md)。ここは**組み方**。

---

## 並びを固定する

```html
<div class="field">
  <label class="label" for="mail">メールアドレス</label>
  <input class="input" id="mail" type="email" />
  <p class="field__help">請求書の送り先になります</p>
  <p class="field__error">＠より後ろが足りません</p>
</div>
```

**ラベル → 入力 → 説明 → エラー。この順から動かさない。**
読み上げが「ラベル・値・説明・エラー」の順に読むので、
見た目の順と一致していないと、目の見える人と見えない人で別のものになる。

- `<label for>` を必ず書く。プレースホルダーをラベル代わりにしない
  （入力すると消えるので、何を入れたのか分からなくなる）
- エラーが出たら説明は消す。2行になると入力欄が押し下がって、
  「押した場所と違うところが動いた」ように見える
- `aria-invalid="true"` を入力に付ける

## 何を必須にするか

- **必須の印を付けない。任意のほうに「（任意）」と書く。**
  ほとんどの欄が必須なら、`*` は画面中に散らばるだけ
- 任意の欄が多いなら、それは**聞きすぎ**の合図

---

## 型を宣言する（携帯のキーボードが変わる）

| 中身 | 書くもの |
|---|---|
| 数値（桁を数える） | `inputmode="numeric"` + `.input--num` |
| 小数を含む | `inputmode="decimal"` |
| 電話 | `type="tel"` |
| メール | `type="email"` `autocomplete="email"` |
| URL | `type="url"` `inputmode="url"` |
| 検索 | `type="search"` `enterkeyhint="search"` |
| 使い捨てコード | `autocomplete="one-time-code"` `inputmode="numeric"` |
| 新しいパスワード | `autocomplete="new-password"` |

`type="number"` は**使わない**。桁区切りが打てず、スピナーが出て、
Safari で `maxlength` が効かない。`inputmode="numeric"` + `type="text"` にする。

`enterkeyhint`（`done` / `next` / `search` / `send`）を書くと、
携帯の Enter キーの文字が変わる。地味に効く。

---

## 検証はいつ走らせるか

| いつ | 何を |
|---|---|
| 打っている間 | **何も出さない。** 打っている途中は必ず「まだ不正」 |
| 欄から離れたとき（blur） | その欄のエラーを出す |
| 送信を押したとき | 全部のエラーを出し、**最初のエラーへスクロールしてフォーカス** |
| エラーが出た後に打ち直している間 | リアルタイムで消す（直ったことは即座に伝える） |

「出すのは遅く、消すのは早く。」

送信ボタンは**押せるままにする**。押せなくすると、なぜ押せないのかが
どこにも書かれていない画面ができる。押させて、エラーを見せる。

---

## 横に並べる

```html
<div class="field-row" style="--field-n: 2">
  <div class="field">…姓…</div>
  <div class="field">…名…</div>
</div>
```

420px 未満では自動で縦に落ちる。**★横に3つ以上並べない★**
和文のラベルは 1文字まで縮むので、`minmax(0, 1fr)` でも読めなくなる。

## 単位・記号を入れる

```html
<div class="field__wrap field__wrap--start">
  <span class="field__affix field__affix--start">¥</span>
  <input class="input input--num" inputmode="numeric" />
</div>
```

`pointer-events: none` にしてあるので、記号を押しても入力にフォーカスが入る。

## 文字数

```html
<p class="field__count"><span class="mono">28</span> / 140</p>
<p class="field__count field__count--over">…</p>
```

**★等幅で書く★** 打つたびに桁が変わるので、プロポーショナルだと数字が踊る。
超えたら `--over`（error）。ただし**打てなくはしない** — 消す作業をさせない。

---

## 保存の作法

| 場面 | どうする |
|---|---|
| 設定 | **即時保存。**「保存」ボタンを置かない。スイッチは押した瞬間に効く |
| 長いフォーム | 下書きを自動保存し、離脱を止めない |
| 戻せない送信（送金・削除） | ダイアログで確認 |
| それ以外 | 楽観的更新 + スナックバーの「元に戻す」（→ [11-states](11-states.md)） |

即時保存にすると、失敗したときの見せ方が要る。
**静かに巻き戻してスナックバー**（画面を止めない）。

---

## プルダウン（`<select>`）

閉じた姿だけでなく **開いた一覧も自前で描く**（`components-core.css` の
`@supports (appearance: base-select)`）。ここを素のままにすると、押した瞬間だけ
OS の顔になって一気に古く見える。未対応の環境では宣言ごと捨てられ、
従来どおり OS の一覧が出るので壊れない。

**★`lib/press.ts`（`watchPress()`）を必ず入れること★**
base-select の `<select>` は、**指では何度押しても閉じない**。マウスでは閉じるので
気づきにくい。一覧はポップオーバーなので指が触れた時点で light-dismiss が閉じるのだが、
同じ操作の既定の動作が直後に開き直してしまう。`watchPress()` が
「開いている `<select>` の上での `pointerdown` だけ既定を止める」ので、
light-dismiss が残って **開く → 閉じる → 開く** になる。

実測（chromium 151・指の tap を3回）:

| | 1回目 | 2回目 | 3回目 |
|---|---|---|---|
| 何もしない | 開く | 開く | 開く |
| `watchPress()` あり | 開く | **閉じる** | 開く |

★止めてよいのは**本体の上での押下だけ**★ base-select では `<option>` も
`<select>` の子のままなので、`closest('select')` だけで判定すると
**選ぶ操作まで止まって値が変わらなくなる**（実際に踏んだ）。
`option, optgroup` の上は除外すること。

`blur()` で閉じる手もあるが**採らない**。閉じはするがフォーカスまで飛んで
キーボード操作が切れる。

---

## 日付と時刻

| 入れさせ方 | いつ |
|---|---|
| `.cal`（カレンダー） | 「いつ」を**探す**とき（予定・締切） |
| 数字の入力（`.timefields`） | 分かっている値を**打つ**とき（9:30） |
| `.dial`（ダイヤル） | 触る画面で時刻を**選ぶ**とき |
| 相対のチップ（今日/明日/来週） | ほとんどの場合、これで足りる |

**★まずチップを出す★** 「今日」「明日」「来週」を押せば済むのに、
いきなりカレンダーを出すのは1手多い。

```html
<div class="chips">
  <button class="chip">今日</button><button class="chip">明日</button>
  <button class="chip">日付を選ぶ</button>
</div>
```

期間を選ばせるときは `.cal__day--start` / `--in` / `--end` で帯にする。
**開始だけ選んだ状態**を必ず作る（「終了を選んでください」を出す）。

---

## 使い捨てコード（OTP）

**★1マス1文字の `<input>` を並べない★**
貼り付けが1マスにしか入らず、iOS の自動入力が効かず、
読み上げが「編集テキスト」を6回読む。

1つの `<input>` を透明にしてマスの上に敷き、マスは表示専用の `<div>` にする
（`.otp__ghost` + `.otp__box`）。`autocomplete="one-time-code"` を必ず書く。

---

## ファイル

```html
<label class="dropzone">
  <input type="file" class="sr-only" multiple />
  <svg class="icon icon--lg">…</svg>
  <span>ここに置く、または選ぶ</span>
  <span class="muted">PNG / JPEG、20MB まで</span>
</label>
```

- **制限を先に書く。** 「20MB まで」を、蹴った後ではなく置く前に見せる
- 進み具合は `.meter`（1件）または `.rowlist` + 各行に `.meter`（複数）
- 失敗した1件で全部を捨てない。成功したものは残し、失敗だけ再試行させる

---

## キーボードで隠れないようにする

```html
<meta name="viewport" content="… interactive-widget=resizes-content" />
```

これが無いと、下のほうの入力欄がキーボードに隠れる。
シートの中に入力欄を置くときは、`.sheet__body` が `overflow-y: auto` なので
フォーカス時に自動でスクロールする（`scroll-padding` は要らない）。

**★入力欄の `font-size` は 16px 以上★**（`--t-input`）。
下回った瞬間、iOS がフォーカスで画面を拡大して戻さなくなる。

---

## 読み上げ

- `<label for>` か `aria-label` を必ず持たせる
- エラーは `aria-invalid="true"` + `aria-describedby` でエラー文に繋ぐ
- グループ（ラジオ・チェックの束）は `<fieldset>` + `<legend>`。
  `<legend>` を隠したいときは `.sr-only`
- 「必須」は `required` 属性で伝える（`*` の見た目だけにしない）
