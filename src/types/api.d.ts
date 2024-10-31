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
    type: import('../db/schema').QuizType
    quizAnswerOptions: QuizAnswerOption[]
    createdAt?: Date
    updatedAt?: Date
  }
  interface QuizAnswerOption {
    id: string
    title: string
    isCorrect: boolean
    createdAt?: Date
    updatedAt?: Date
  }
}
