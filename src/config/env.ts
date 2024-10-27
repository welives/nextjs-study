export const NODE_ENV: 'development' | 'production' | 'test' = process.env.NODE_ENV

export const __DEV__ = NODE_ENV === 'development'
