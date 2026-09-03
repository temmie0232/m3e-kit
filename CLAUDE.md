# CLAUDE.md

このリポジトリの使い方は [AGENTS.md](AGENTS.md) にある。**先にそれを読むこと。**

要点だけ:

- ここは Material 3 Expressive の**説明書とコピー元**。ライブラリではない
- `starter/` を対象プロジェクトにコピーして使う
- `docs/01-principles.md` の5原則に反する実装をしない
- カタログ（`docs/09-components.md`）に無い部品は
  `docs/10-new-component.md` の9問で導出する。値を発明しない
- 書き終わったら `docs/13-checklist.md` で自己検証して報告する

このリポジトリ自身を編集するとき:

- `starter/styles/m3-scheme.css` と `starter/lib/seeds.ts` は**生成物**。
  手で編集しない（`npm run gen:scheme`）
- 部品を足したら **`docs/09-components.md` と `demo/index.html` の両方**に足す
- 説明書に書く数値は、`starter/` の実体と必ず一致させる
