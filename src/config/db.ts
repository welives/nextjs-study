import { __DEV__ } from './env'
export const DATABASE_URL = __DEV__ ? process.env.DATABASE_DSN : process.env.DATABASE_DSN_PROD
