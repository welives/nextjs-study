export enum StoreSceneKey {
  SETTING = '@@setting',
}

export const timeZone = process.env.TIMEZONE

export const BREAK_POINTS = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const
