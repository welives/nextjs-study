import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { BASE_URL } from '../constants'
import { isArray, isNumber, isPlainObject, isBlob } from './is'

type AnyObj = Record<string, any>

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  return `${BASE_URL}${path}`
}

function findKey(obj: object, key: string) {
  key = key.toLowerCase()
  const keys = Object.keys(obj)
  let i = keys.length
  let _key
  while (i-- > 0) {
    _key = keys[i]
    if (key === _key.toLowerCase()) return _key
  }
  return null
}

export const hashString = function (str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

export function sleep(duration: number = 1000) {
  const start = Date.now()
  while (Date.now() - start < duration) { }
}

/** @description 去除字符串首尾的空白符 */
export function trim(str: string) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '')
}

/** @description 去除字符串中的 BOM */
export function stripBOM(content: string) {
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1)
  return content
}

/** @description 把 横线、下划线、空格 连接起来的字符串转为小驼峰字符串 */
export function toCamelCase(str: string) {
  return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, (m, p1, p2) => {
    return p1.toUpperCase() + p2
  })
}

/** @description 把baseURL和relativeURL组合起来 */
export function combineURLs(baseURL: string, relativeURL: string) {
  return relativeURL ? `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}` : baseURL
}

/** @description 将类数组对象转为真正的数组 */
export function toArray(thing: any) {
  if (!thing) return null
  if (isArray(thing)) return thing
  let i = thing.length
  if (!isNumber(i)) return null
  const arr = new Array(i)
  while (i-- > 0) arr[i] = thing[i]

  return arr
}

/** @description 迭代数组或对象 */
export function forEach(obj: AnyObj | Array<any>, fn: (...args: any[]) => void) {
  if (obj === null || typeof obj === 'undefined') return

  if (typeof obj !== 'object') obj = [obj]

  if (isArray(obj)) {
    for (let i = 0, l = obj.length; i < l; i++) fn.call(null, obj[i], i, obj)
  } else {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) fn.call(null, obj[key], key, obj)
    }
  }
}

/** @description 对象合并 */
export function merge<T = AnyObj>(...args: object[]): T {
  // @ts-expect-error ?
  const { caseless } = (this.isContextDefined(this) && this) || {}
  const result = {}
  const assignValue = (val: any, key: string) => {
    const targetKey = (caseless && findKey(result, key)) || key
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) result[targetKey] = merge(result[targetKey], val)
    else if (isPlainObject(val)) result[targetKey] = merge({}, val)
    else if (isArray(val)) result[targetKey] = val.slice()
    else result[targetKey] = val
  }

  for (let i = 0, l = arguments.length; i < l; i++) args[i] && forEach(args[i], assignValue)

  return result as T
}

/** @description 深拷贝 */
export function deepClone<T = any>(source: T, cache = new WeakMap()): T {
  if (typeof source !== 'object' || source === null) return source
  if (cache.has(source)) return cache.get(source)
  const target = Array.isArray(source) ? [] : {}
  Reflect.ownKeys(source).forEach((key) => {
    const val = source[key]
    if (typeof val === 'object' && val !== null) target[key] = deepClone(val, cache)
    else target[key] = val
  })
  return target as T
}

/** @description 将文件对象转为URL */
export function readBlob2Url(blob: Blob, cb: (url: any) => void) {
  if (!isBlob(blob)) throw new Error('is not Blob')

  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(blob)
  }).then(cb)
}

/** @description 洗牌算法 */
export function shuffle<T = any>(arr: T[]) {
  const res: T[] = []
  let random
  while (arr.length > 0) {
    random = Math.floor(Math.random() * arr.length)
    res.push(arr.splice(random, 1)[0])
  }
  return res
}

/**
 * 生成随机字符串
 * @param size
 * @param dict
 * @returns
 */
export function randomValue(
  size = 16,
  dict = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
): string {
  let id = ''
  let i = size
  const len = dict.length
  while (i--) id += dict[Math.floor(Math.random() * len) | 0]
  return id
}

export function findChildren<T = any>(list: any[], pid: string[], pidName = 'pid', onlyId = true): T[] {
  let res = list.filter(r => pid.includes(r[pidName]))
  if (res.length < 1) return []
  if (onlyId) {
    res = res.map(e => e.id)
    return res.concat(findChildren(list, res, pidName, onlyId))
  } else {
    return res.concat(findChildren(list, res.map(e => e.id), pidName, onlyId))
  }
}

export function findMeAndChildren<T = any>(list: any[], me: string[], pidName = 'pid', onlyId = true): T[] {
  let res = [], stack = list.filter(r => me.includes(r.id))
  if (onlyId) {
    stack = stack.map(e => e.id)
  }
  while (stack.length) {
    res = res.concat(stack)
    if (onlyId) {
      stack = list.filter(r => stack.includes(r[pidName])).map(e => e.id)
    } else {
      const pds = stack.map(r => r.id)
      stack = list.filter(r => pds.includes(r[pidName]))
    }
  }
  return res
}
