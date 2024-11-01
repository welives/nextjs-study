export const ROUTES = [
  {
    path: '/admin/welcome',
    name: '欢迎',
    icon: 'smile',
  },
  {
    path: '/admin/course',
    name: '课程',
    icon: 'heart',
  },
  {
    path: "/admin/quiz",
    name: '试题',
    icon: 'heart',
    routes: [
      {
        path: '/admin/quiz/list',
        name: '试题列表',
        icon: 'heart',
      },
      {
        path: '/admin/quiz/create',
        name: '新增试题',
        icon: 'heart',
      },
    ]
  },
  {
    path: '/admin/category',
    name: '分类',
    icon: 'heart',
  },
]
