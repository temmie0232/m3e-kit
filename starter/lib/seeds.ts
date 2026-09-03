/* 生成物 — 手で編集しない。scripts/gen-m3-scheme.mjs を回す。
   設定の「テーマの色」が並べる一覧。swatch はライトの primary。 */
export type SeedId = 'indigo' | 'teal' | 'green' | 'amber' | 'rose' | 'violet' | 'graphite'

export const SEEDS: { id: SeedId; label: string; swatch: string; swatchDark: string }[] = [
  { id: 'indigo', label: 'インディゴ', swatch: '#575b8c', swatchDark: '#c1c3ee' },
  { id: 'teal', label: 'ティール', swatch: '#206a5f', swatchDark: '#9dd1c6' },
  { id: 'green', label: 'グリーン', swatch: '#496738', swatchDark: '#b3cfa1' },
  { id: 'amber', label: 'アンバー', swatch: '#88522d', swatchDark: '#f5ba96' },
  { id: 'rose', label: 'ローズ', swatch: '#894d5b', swatchDark: '#f5b6c2' },
  { id: 'violet', label: 'バイオレット', swatch: '#6f33d5', swatchDark: '#be9dff' },
  { id: 'graphite', label: 'グラファイト', swatch: '#575f6b', swatchDark: '#bfc7d5' },
]

export const DEFAULT_SEED: SeedId = 'indigo'
