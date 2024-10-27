export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL

export enum PATHS {
  /** ************* SITE ****************** */
  SITE_HOME = '/',
  SITE_ABOUT = '/about',

  /** ************* ADMIN ****************** */
  ADMIN_HOME = '/admin',
  ADMIN_OVERVIEW = '/admin/overview',

  /** ************* AUTH ****************** */
  AUTH_SIGN_IN = '/auth/sign-in',
  NEXT_AUTH_SIGN_IN = '/api/auth/sign-in',
}

export const PATH_MAP = new Map([
  /** ************* SITE ****************** */
  [PATHS.SITE_HOME, '首页'],
  [PATHS.SITE_ABOUT, '关于'],

  /** ************* ADMIN ****************** */
  [PATHS.ADMIN_HOME, '后台首页'],
  [PATHS.ADMIN_OVERVIEW, '统计'],

  /** ************* AUTH ****************** */
  [PATHS.AUTH_SIGN_IN, '后台登录'],
])
