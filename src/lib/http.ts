import { signOut } from 'next-auth/react'
import { ofetch, FetchResponse } from 'ofetch'
import { deepClone } from './utils'

export default new class Http {
  private request: typeof ofetch

  constructor() {
    this.request = this.init()
  }

  private init() {
    const request = ofetch.create({
      // 请求拦截
      onRequest: async ({ options }) => {
        options.params = paramsSerializer(options.params)
        options.query = options.query || {}
      },
      // 响应拦截
      onResponse({ response }) {
        if (response._data.success !== true) {
          handleError(response)
          return Promise.reject(response._data)
        }

        return response._data
      },
    })
    return request
  }

  get<T>(url: string, params?: any) {
    return this.request<Api.ResponseStructure<T>>(url, { method: 'GET', params })
  }

  post<T>(url: string, body?: any) {
    return this.request<Api.ResponseStructure<T>>(url, { method: 'POST', body })
  }

  put<T>(url: string, body?: any) {
    return this.request<Api.ResponseStructure<T>>(url, { method: 'PUT', body })
  }

  patch<T>(url: string, body?: any) {
    return this.request<Api.ResponseStructure<T>>(url, { method: 'PATCH', body })
  }

  delete<T>(url: string, body?: any) {
    return this.request<Api.ResponseStructure<T>>(url, { method: 'DELETE', body })
  }
}

function paramsSerializer(params?: Record<string, any>) {
  if (!params) return
  const query = deepClone(params)
  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && typeof value === 'object' && Array.isArray(value)) {
      query[`${key}[]`] = value.map((v) => JSON.stringify(v))
      delete query[key]
    }
  })
  return query
}

function handleError<T>(response: FetchResponse<Api.ResponseStructure<T>> & FetchResponse<ResponseType>) {
  if (!response._data) {
    err('请求超时，服务器无响应！')
    return
  }

  const handleMap: { [key: number]: () => void } = {
    404: () => err('服务器资源不存在'),
    500: () => err('服务器内部错误'),
    403: () => err('没有权限访问该资源'),
    401: () => {
      err('登录状态已过期，请重新登录')
      signOut()
    },
  }
  handleMap[response.status] ? handleMap[response.status]() : err('未知错误！')

  function err(text: string) {
    console.error(response?._data?.message ?? text)
  }
}
