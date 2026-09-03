/* ============================================================
   テーマとシード（Material You の「自分の色」）

   明暗の既定は端末設定に従う。明示指定は <html data-theme="light|dark">。
   m3-scheme.css は data-theme をメディアクエリより後に定義してあるので、
   明示指定は必ず勝つ。

   配色そのものはシード色 1 つで決まる。候補と生成物は
   scripts/gen-m3-scheme.mjs → styles/m3-scheme.css / lib/seeds.ts。
   既定のシードは属性なし、それ以外は <html data-seed="..."> で切り替える。
   ============================================================ */

import { DEFAULT_SEED, SEEDS, type SeedId } from './seeds'

export type Theme = 'system' | 'light' | 'dark'
export type { SeedId }

/* localStorage のキー。アプリごとに名前空間を変えること */
const NS = 'app'
const TKEY = `${NS}.theme`
const SKEY = `${NS}.seed`

export function getTheme(): Theme {
  try {
    const v = localStorage.getItem(TKEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

export function setTheme(t: Theme) {
  try {
    if (t === 'system') localStorage.removeItem(TKEY)
    else localStorage.setItem(TKEY, t)
  } catch {
    /* プライベートモードで localStorage が使えないだけ。表示は効く */
  }
  applyTheme(t)
}

export function applyTheme(t: Theme) {
  const root = document.documentElement
  if (t === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', t)

  /* アドレスバー／ステータスバーの色も追従させる。ここを合わせないと
     画面上端に前のテーマの帯が残って一発で安っぽくなる。

     ★色を二重管理しない★ ここに hex を直書きすると、tokens を変えたときに
     必ず直し忘れる。算出値から読めば必ず一致する。
     （index.html 側の <meta name="theme-color"> は起動直後にここで
       消されるので、書いても無意味） */
  for (const el of document.querySelectorAll('meta[name="theme-color"]')) el.remove()
  const meta = document.createElement('meta')
  meta.name = 'theme-color'
  meta.content = getComputedStyle(root).getPropertyValue('--surface').trim() || '#ffffff'
  document.head.appendChild(meta)
}

export function getSeed(): SeedId {
  try {
    const v = localStorage.getItem(SKEY)
    return SEEDS.some((s) => s.id === v) ? (v as SeedId) : DEFAULT_SEED
  } catch {
    return DEFAULT_SEED
  }
}

export function applySeed(id: SeedId) {
  const root = document.documentElement
  if (id === DEFAULT_SEED) root.removeAttribute('data-seed')
  else root.setAttribute('data-seed', id)
  try {
    if (id === DEFAULT_SEED) localStorage.removeItem(SKEY)
    else localStorage.setItem(SKEY, id)
  } catch {
    /* noop */
  }
  // アドレスバーの色は --surface から読むので、色を変えたら取り直す
  applyTheme(getTheme())
}

/* OS のダーク/ライト切替に追従する。
   applyTheme は起動時に1回しか呼ばれないので、これが無いと
   theme='system' のまま OS を切り替えてもアドレスバーだけ前の色で残る。
   （CSS 側はメディアクエリが自分で切り替わるので、ズレるのは meta だけ） */
export function watchSystemTheme() {
  try {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => applyTheme(getTheme()))
  } catch {
    /* 古い WebView では addEventListener が無い。追従しないだけで害はない */
  }
}

/** 起動時に1回呼ぶ */
export function initTheme() {
  applySeed(getSeed()) // 中で applyTheme も走る
  watchSystemTheme()
}
