declare namespace Api {

  // 响应结构体
  interface ResponseStructure<T = any> {
    code: number | string
    message: string
    success: boolean
    data?: T
    url?: string
    [key: string]: any
  }

  // 分类模块
  interface CategoryListData {
    id: React.Key
    name: string
    pid?: React.Key
    remark?: string
    createdAt: Date
    updatedAt: Date
  }
  interface CategoryListPageParams {
    page?: number
    pageSize?: number
    keyword?: string
  }
}
