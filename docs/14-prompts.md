# 14. AI に渡す指示文の雛形

コピーして使う。`<>` の中を埋める。

---

## A. 新しいアプリを M3 Expressive で作らせる

```
UI は Material 3 Expressive で作る。仕様書とコピー元一式が
<path>/m3e-kit にあるので、まず <path>/m3e-kit/AGENTS.md を読むこと。

手順:
1. m3e-kit/starter/ をこのプロジェクトにコピーする（AGENTS.md §1 の対応表どおり）
2. m3e-kit/docs/01-principles.md を読む
3. これから作る画面に関係する章だけ読む
4. 画面を実装する。カタログ（docs/09-components.md）に無い部品を作るときは
   docs/10-new-component.md の9問に順番に答えてから書く
5. docs/13-checklist.md で自己検証し、確認できなかった項目を明示して報告する

制約:
- 色は tokens.css の役割名だけを使う。hex を手で書かない
- ぼかし（backdrop-filter）・押下の縮み（scale / opacity）は禁止
- トークンに無い数値を使うときは、その理由をコメントに書く
```

---

## B. 既存アプリを M3 Expressive に揃えさせる

```
このアプリの UI を Material 3 Expressive に揃える。仕様書は
<path>/m3e-kit/AGENTS.md（と docs/）。

手順:
1. m3e-kit/AGENTS.md と docs/01-principles.md を読む
2. m3e-kit/starter/styles/ をこのプロジェクトに入れ、既存のトークンと
   突き合わせる。**既存のクラス名は変えない**。旧トークン名は
   tokens.css の中で M3 の役割名への別名として残す
3. 現在の CSS/コンポーネントを読み、仕様と乖離している箇所を一覧にする
   （手書きの色 / ぼかし / 押下の縮み / linear / 0.5px の線 / gap と margin の
     足し算 / 折り返す札）
4. 影響が大きい順に直す。JS と共有している寸法・padding・z-index は変えない
5. docs/13-checklist.md で自己検証して報告する

制約:
- 機能を追加しない。見た目と触り心地だけを変える
- 1コミット1関心事
- 一覧を出した時点で一度止めて、順番を確認させてほしい
```

---

## C. 1つの画面・1つの部品だけ作らせる

```
<画面名> を作る。UI の仕様は <path>/m3e-kit/docs/ にある。
読むのは 01-principles.md、09-components.md、それと
<この画面に関係する章：02-color / 05-space / 11-states など>。

この画面の4つの状態（読み込み中 / 空 / エラー / 中身あり）を全部作ること。
カタログに無い部品が要るときは docs/10-new-component.md の9問に答えてから書く。
```

---

## D. レビューさせる

```
この差分を <path>/m3e-kit/docs/13-checklist.md で点検して。
確認できた項目・落ちている項目・確認できなかった項目を分けて報告すること。
推測で「✅」を付けないこと。
```

---

## E. 見本帳を更新させる

```
いま足した部品を <path>/m3e-kit に登録して:
1. starter/styles/components.css に節を作って書く（1クラス1責務、意図をコメントに）
2. docs/09-components.md のカタログに追記
3. demo/index.html の見本帳に足す
```

---

## 渡し方のコツ

- **`AGENTS.md` だけを渡す。** docs を全部読ませようとしない。
  必要な章はエージェント自身が地図から選ぶ
- **「M3 っぽくして」と言わない。** どの章を根拠にするかを指定すると再現性が出る
- **チェックリストの結果を必ず報告させる。** 自己検証を省くと、
  ぼかしと手書き hex は必ず戻ってくる
- 見た目を確認できない環境（サーバ・CI）で作らせたときは、
  **「未確認」と書かせる**。「確認しました」と言わせない
