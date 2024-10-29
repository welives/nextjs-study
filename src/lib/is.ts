const { getPrototypeOf } = Object
const kindOf = ((cache) => (thing: any) => {
  const str = toString.call(thing)
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase())
})(Object.create(null))

const typeOfTest = (type: string) => (thing: any) => typeof thing === type

const _global = (() => {
  if (typeof globalThis !== 'undefined') return globalThis
  return typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : global
})()

function kindOfTest(type: string) {
  type = type.toLowerCase()
  return (thing: any) => kindOf(thing) === type
}

/** @description 是否为数组 */
export const isArray = Array.isArray

/** @description 是否为 undefined */
export const isUndefined = typeOfTest('undefined')

/** @description 是否为对象 */
export function isObject(thing: any) {
  return thing !== null && typeof thing === 'object'
}

/** @description 是否为函数 */
export const isFunction = typeOfTest('function')

/** @description 是否为数字 */
export const isNumber = typeOfTest('number')

/** @description 是否为布尔值 */
export function isBoolean(thing: any) {
  return thing === true || thing === false
}

/** @description 是否为字符串 */
export const isString = typeOfTest('string')

/** @description 是否为 Date 对象 */
export const isDate = kindOfTest('Date')

/** @description 是否为 File 对象 */
export const isFile = kindOfTest('File')

/** @description 是否为 FileList 对象 */
export const isFileList = kindOfTest('FileList')

/** @description 是否为 Blob 对象 */
export const isBlob = kindOfTest('Blob')

/** @description 是否为 Stream流 */
export function isStream(val: any) {
  return isObject(val) && isFunction(val.pipe)
}

/** @description 是否为 URLSearchParams 对象 */
export const isURLSearchParams = kindOfTest('URLSearchParams')

/** @description 是否为 HTMLFormElement 对象 */
export const isHTMLForm = kindOfTest('HTMLFormElement')

/** @description 是否为 ArrayBuffer 对象 */
export const isArrayBuffer = kindOfTest('ArrayBuffer')

/** @description 是否为 RegExp 对象 */
export const isRegExp = kindOfTest('RegExp')

/** @description 是否为异步函数 */
export const isAsyncFn = kindOfTest('AsyncFunction')

/** @description 是否存在上下文对象 */
export function isContextDefined(context: any) {
  return !isUndefined(context) && context !== _global
}

/** @description 是否为 Buffer 对象 */
export function isBuffer(val: any): boolean {
  return (
    val !== null &&
    !isUndefined(val) &&
    val.constructor !== null &&
    !isUndefined(val.constructor) &&
    isFunction(val.constructor.isBuffer) &&
    val.constructor.isBuffer(val)
  )
}

/** @description 是否为 ArrayBuffer 对象 */
export function isArrayBufferView(val: any): boolean {
  let result: any
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) result = ArrayBuffer.isView(val)
  else result = val && val.buffer && isArrayBuffer(val.buffer)

  return result
}

/** @description 是否为 plain object */
export function isPlainObject(val: any) {
  if (kindOf(val) !== 'object') return false
  const prototype = getPrototypeOf(val)
  return (
    (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) &&
    !(Symbol.toStringTag in val) &&
    !(Symbol.iterator in val)
  )
}

/** @description 是否为 FormData 对象 */
export function isFormData(thing: any) {
  let kind: any
  return (
    thing &&
    ((typeof FormData === 'function' && thing instanceof FormData) ||
      (isFunction(thing.append) &&
        ((kind = kindOf(thing)) === 'formdata' ||
          // detect form-data instance
          (kind === 'object' && isFunction(thing.toString) && thing.toString() === '[object FormData]'))))
  )
}

/** @description 是否为 FormData 对象 */
export function isSpecCompliantForm(thing: any) {
  return !!(thing && isFunction(thing.append) && thing[Symbol.toStringTag] === 'FormData' && thing[Symbol.iterator])
}

/** @description 是否有 then 方法 */
export function isThenable(thing: any) {
  return thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch)
}

/** @description 是否绝对地址 */
export function isAbsoluteURL(url: string) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url)
}

/** @description 是否为JWT */
export function isJWT(token: string): boolean {
  const parts = token.split('.')
  return (
    parts.length === 3 &&
    /^[a-zA-Z0-9_-]+$/.test(parts[0]) &&
    /^[a-zA-Z0-9_-]+$/.test(parts[1]) &&
    /^[a-zA-Z0-9_-]+$/.test(parts[2])
  )
}

/** @description 判断对象是否有某属性 */
export const hasOwnProperty = (
  ({ hasOwnProperty }) =>
    (obj: object, prop: string) =>
      hasOwnProperty.call(obj, prop)
)(Object.prototype)
