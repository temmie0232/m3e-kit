/* Material 3 の配色トークンを生成する。
 *
 *   npm run gen:scheme
 *
 * `@material/material-color-utilities`（Google 公式の HCT 実装）で、
 * シード色 1 つから 2025 spec（= Material 3 Expressive の色体系）の
 * ライト/ダーク両スキームを算出し、CSS カスタムプロパティとして
 * `src/styles/m3-scheme.css` に焼き込む。
 *
 * ★生成物は手で触らない★ 色を変えたいときは下の SEEDS を直してこのスクリプトを回す。
 * ★実行時には何も計算しない★ ライブラリは 100KB 超ある。色は設計時に決まる
 *   ものなので、実行時に解かずビルド前に静的化する。
 *
 * MCU は拡張子無しの ESM import で書かれていて Node から直接は読めない。
 * package.json の gen:scheme は esbuild で束ねてから実行する。
 *
 * 出力先は既定で <cwd>/src/styles と <cwd>/src/lib（Vite の慣習）。
 * 別の場所に出したいときは環境変数 M3E_OUT にディレクトリを渡す:
 *   M3E_OUT=app npm run gen:scheme   →  app/styles/ と app/lib/ に出す
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  Hct,
  MaterialDynamicColors,
  SchemeNeutral,
  SchemeTonalSpot,
  SchemeVibrant,
  argbFromHex,
  hexFromArgb,
} from '@material/material-color-utilities'

// ★cwd 基準にすること★ esbuild で束ねた後の import.meta.url は
// node_modules/.cache を指すので、自分の位置からは辿れない
const ROOT = join(process.cwd(), process.env.M3E_OUT ?? 'src')
const OUT_CSS = join(ROOT, 'styles', 'm3-scheme.css')
const OUT_TS = join(ROOT, 'lib', 'seeds.ts')

/** シード。先頭が既定（data-seed 属性なし）。
 *  variant … tonalSpot = Android の既定（落ち着き）/ vibrant = 彩度高め / neutral = ほぼ無彩色 */
const SEEDS = [
  { id: 'indigo', label: 'インディゴ', hex: '#4F5BD5', variant: 'tonalSpot' },
  { id: 'teal', label: 'ティール', hex: '#00796B', variant: 'tonalSpot' },
  { id: 'green', label: 'グリーン', hex: '#3F7D20', variant: 'tonalSpot' },
  { id: 'amber', label: 'アンバー', hex: '#E0731D', variant: 'tonalSpot' },
  { id: 'rose', label: 'ローズ', hex: '#C2185B', variant: 'tonalSpot' },
  { id: 'violet', label: 'バイオレット', hex: '#7B3FE4', variant: 'vibrant' },
  { id: 'graphite', label: 'グラファイト', hex: '#5B626D', variant: 'neutral' },
]

/** 書き出す色。MaterialDynamicColors のプロパティ名 → CSS 名（kebab） */
const ROLES = [
  'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer',
  'primaryFixed', 'primaryFixedDim', 'onPrimaryFixed', 'onPrimaryFixedVariant',
  'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
  'secondaryFixed', 'secondaryFixedDim', 'onSecondaryFixed', 'onSecondaryFixedVariant',
  'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
  'tertiaryFixed', 'tertiaryFixedDim', 'onTertiaryFixed', 'onTertiaryFixedVariant',
  'error', 'onError', 'errorContainer', 'onErrorContainer',
  'surface', 'surfaceDim', 'surfaceBright',
  'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer',
  'surfaceContainerHigh', 'surfaceContainerHighest',
  'onSurface', 'onSurfaceVariant', 'surfaceVariant',
  'outline', 'outlineVariant',
  'inverseSurface', 'inverseOnSurface', 'inversePrimary',
  'surfaceTint', 'scrim', 'shadow',
]

/** `rgb(var(--x-rgb) / a)` の形で透過を作りたい色だけ、r g b の三つ組も出す */
const WITH_RGB = new Set([
  'primary', 'onPrimary', 'secondary', 'tertiary', 'onSurface', 'onSurfaceVariant',
  'surface', 'surfaceTint', 'error', 'inverseSurface', 'outline', 'scrim', 'shadow',
  'primaryContainer', 'onPrimaryContainer', 'secondaryContainer',
])

const kebab = (s) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())

function scheme(seed, dark) {
  const hct = Hct.fromInt(argbFromHex(seed.hex))
  const C = { tonalSpot: SchemeTonalSpot, vibrant: SchemeVibrant, neutral: SchemeNeutral }[seed.variant]
  // contrastLevel 0 = 標準。spec 2025 = Expressive の色体系（コンテナがより鮮やか、surface 階層が整理）
  return new C(hct, dark, 0, '2025', 'phone')
}

function vars(s, indent) {
  const out = []
  for (const role of ROLES) {
    const argb = MaterialDynamicColors[role].getArgb(s)
    const hex = hexFromArgb(argb)
    out.push(`${indent}--md-sys-color-${kebab(role)}: ${hex};`)
    if (WITH_RGB.has(role)) {
      const r = (argb >> 16) & 255
      const g = (argb >> 8) & 255
      const b = argb & 255
      out.push(`${indent}--md-sys-color-${kebab(role)}-rgb: ${r} ${g} ${b};`)
    }
  }
  return out.join('\n')
}

function block(selector, s, dark, indent = '') {
  return `${indent}${selector} {\n${vars(s, indent + '  ')}\n${indent}  color-scheme: ${dark ? 'dark' : 'light'};\n${indent}}`
}

const parts = []
parts.push(`/* ============================================================
   生成物 — 手で編集しない。scripts/gen-m3-scheme.mjs を回す。
   Material 3（2025 spec / Expressive）の配色。シード色ごとに
   ライト/ダークを持ち、既定は ${SEEDS[0].id}（属性なし）。
   他は <html data-seed="..."> で切り替える（lib/theme.ts）。

   セレクタの並びは tokens.css の規約と同じ:
     1. :root（ライト）
     2. @media dark の :root
     3. [data-theme='dark'] … 明示指定はメディアクエリより後に置いて勝たせる
     4. [data-theme='light']
   :root だけでなく素の [data-theme] にも当てるのは、画面の一部だけ
   明暗を変えたい（記事だけ暗く 等）ときに、その要素で色を解決し直すため。
   ============================================================ */`)

SEEDS.forEach((seed, i) => {
  const light = scheme(seed, false)
  const dark = scheme(seed, true)
  parts.push(`\n/* ---------------------------------------------------------- ${seed.id} (${seed.hex}, ${seed.variant})${i === 0 ? ' — 既定' : ''} */`)
  if (i === 0) {
    parts.push(block(':root', light, false))
    parts.push(`@media (prefers-color-scheme: dark) {\n${block(':root', dark, true, '  ')}\n}`)
    parts.push(block(":root[data-theme='dark'],\n[data-theme='dark']", dark, true))
    parts.push(block(":root[data-theme='light'],\n[data-theme='light']", light, false))
  } else {
    const r = `:root[data-seed='${seed.id}']`
    parts.push(block(r, light, false))
    parts.push(`@media (prefers-color-scheme: dark) {\n${block(r, dark, true, '  ')}\n}`)
    parts.push(block(`${r}[data-theme='dark'],\n${r} [data-theme='dark']`, dark, true))
    parts.push(block(`${r}[data-theme='light'],\n${r} [data-theme='light']`, light, false))
  }
})

writeFileSync(OUT_CSS, parts.join('\n') + '\n')

/* 設定画面の色選びが使う一覧。見本の色は「ライトの primary」 */
const ts = `/* 生成物 — 手で編集しない。scripts/gen-m3-scheme.mjs を回す。
   設定の「テーマの色」が並べる一覧。swatch はライトの primary。 */
export type SeedId = ${SEEDS.map((s) => `'${s.id}'`).join(' | ')}

export const SEEDS: { id: SeedId; label: string; swatch: string; swatchDark: string }[] = [
${SEEDS.map((s) => {
  const l = hexFromArgb(MaterialDynamicColors.primary.getArgb(scheme(s, false)))
  const d = hexFromArgb(MaterialDynamicColors.primary.getArgb(scheme(s, true)))
  return `  { id: '${s.id}', label: '${s.label}', swatch: '${l}', swatchDark: '${d}' },`
}).join('\n')}
]

export const DEFAULT_SEED: SeedId = '${SEEDS[0].id}'
`
writeFileSync(OUT_TS, ts)

// 目視確認用の要約
for (const seed of SEEDS) {
  const l = scheme(seed, false)
  const d = scheme(seed, true)
  const g = (s, r) => hexFromArgb(MaterialDynamicColors[r].getArgb(s))
  console.log(
    seed.id.padEnd(9),
    'L primary', g(l, 'primary'), 'p-cont', g(l, 'primaryContainer'), 's-cont', g(l, 'secondaryContainer'),
    'surface', g(l, 'surface'), 'sc', g(l, 'surfaceContainer'),
    '| D primary', g(d, 'primary'), 'surface', g(d, 'surface'), 'sc', g(d, 'surfaceContainer'),
  )
}
console.log('wrote', OUT_CSS, 'and', OUT_TS)
