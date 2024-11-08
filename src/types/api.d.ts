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

  // 分页列表的基础参数
  interface GetListPage {
    page?: number | undefined
    limit?: number | undefined
    keyword?: string | null | undefined
  }

  // 分类模块
  interface CategoryListData {
    id: string
    name: string
    pid?: string
    remark?: string
    createdAt?: Date
    updatedAt?: Date
    parent?: CategoryListData
  }

  // 课程模块
  interface CourseListData {
    id: string
    title: string
    category: {
      id: string
      name: string
    }
    description?: string
    cover?: string
    createdAt?: Date
    updatedAt?: Date
  }

  // 试题模块
  interface QuizListData {
    id: string
    title: string
    courseId: string
    course: {
      id: string
      title: string
    }
    type: import('@/lib/schema').QuizType
    chapter?: string
    remark?: string | null
    answerOptions: QuizAnswerOption[]
    createdAt?: Date
    updatedAt?: Date
  }
  interface QuizAnswerOption {
    id: string
    content: string
    isCorrect: boolean
    createdAt?: Date
    updatedAt?: Date
  }

  // 答题记录
  interface RecordListData {
    id: string
    title: string
    userId: string
    user: {
      id: string
      username: string
      email: string
    }
    ratio: number
    createdAt?: Date
  }
}
