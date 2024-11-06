export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL

export enum PATHS {
  /** ************* SITE ****************** */
  SITE_HOME = '/',
  SITE_ABOUT = '/about',

  /** ************* ADMIN ****************** */
  ADMIN_HOME = '/admin',
  ADMIN_WELCOME = '/admin/welcome',

  /** ************* AUTH ****************** */
  AUTH_SIGN_IN = '/auth/sign-in',

  /** ************* API ****************** */
  API_AUTH_PREFIX = '/api/auth',
  NEXT_AUTH_SIGN_IN = '/api/auth/sign-in',
}

/**
 * 后台侧栏路由
 */
export const SIDE_BAR_ROUTES = [
  {
    path: '/admin/welcome',
    name: '欢迎',
    icon: 'smile',
  },
  {
    path: "/admin/quiz",
    name: '试题',
    icon: 'heart',
  },
  {
    path: '/admin/course',
    name: '课程',
    icon: 'heart',
  },
  {
    path: '/admin/category',
    name: '分类',
    icon: 'heart',
  },
]

/**
 * 公开路由
 */
export const PUBLIC_ROUTES = ['/', '/api/category', '/api/course', '/api/quiz']

/**
 * 权限路由
 */
export const AUTH_ROUTES = [`${PATHS.AUTH_SIGN_IN}`]
