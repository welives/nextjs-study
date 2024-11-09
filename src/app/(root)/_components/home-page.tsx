'use client'

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { List, Select, Spin, Typography, Radio, Checkbox, Space, Tag, Card, Flex, Tabs, Modal, Form } from 'antd'
import { debounce } from 'radash'
import { useMount } from 'react-use'
import { matchSorter } from 'match-sorter'
import { toast } from 'sonner'

import { Button } from '@/components/button'
import { getAllCourse } from '@/actions/course.action'
import { getByCourseId, checkTest } from '@/actions/quiz.action'
import { shuffle, cn } from '@/lib/utils'
import { TupleAnswered } from '@/lib/schema'
import { PATHS } from '@/constants'

interface CourseValueType {
  key?: string
  label: React.ReactNode
  value: string | number
}

type QuizListType = Awaited<ReturnType<typeof getByCourseId>>['data']
type CheckAnsweredResult = Awaited<ReturnType<typeof checkTest>>['data']

interface TabData {
  key: string
  label: React.ReactNode
  quizzes: QuizListType
  answers: CheckAnsweredResult
}

const quizTypeName = {
  single: '单选题',
  multiple: '多选题',
  judgement: '判断题',
} as const

const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const { confirm } = Modal

export default function HomePage() {
  // 客户端获取session的方式
  const { data: session } = useSession()

  const [form] = Form.useForm()
  const [courseOptions, setCourseOptions] = useState<CourseValueType[]>([])
  const [courseFetching, setCourseFetching] = useState(false)
  const courseFetchRef = useRef(0)
  const [courseId, setCourseId] = useState<string>('') // 当前选中的课程id
  const [loading, setLoading] = useState(false)
  const prevScrollToId = useRef<string>() // 记录上一次滚动位置的id

  const [tabList, setTabList] = useState<TabData[]>([])
  const [activeTab, setActiveTab] = useState<string>()
  /**
   * 当前选项卡下的试题列表
   */
  const quizList = useMemo(() => tabList.filter((e) => e.key === activeTab)[0]?.quizzes ?? [], [activeTab, tabList])
  /**
   * 当前选项卡下的答题结果, 是经过服务端校验后的数据
   */
  const curAnsweredResult = useMemo<CheckAnsweredResult>(() => {
    const index = tabList.findIndex((e) => e.key === activeTab)
    return tabList[index]?.answers
  }, [activeTab, tabList])
  /**
   * 以元祖配合map结构的方式来收集答题数据, 每次提交时会被清空
   * 结构类似这样 [题目id, [[答案id, 选项顺序], [...]]]
   */
  const [answerMap, setAnswerMap] = useState(new Map<string, Array<TupleAnswered>>())
  /**
   * 根据答题集合来判断是否进入了答题状态
   */
  const startedState = useMemo(() => !!answerMap.size, [answerMap])
  /**
   * 根据当前tab是否有答题结果来判断提交状态
   */
  const submitState = useMemo(() => !!curAnsweredResult, [curAnsweredResult])

  // 封装远程搜索课程选项的防抖函数
  const debounceCourseFetch = useMemo(() => {
    const loadOptions = (keyword?: string) => {
      courseFetchRef.current += 1
      const fetchId = courseFetchRef.current
      setCourseOptions([])
      setCourseFetching(true)

      getAllCourse().then((res) => {
        if (fetchId !== courseFetchRef.current) return
        if (!res.success) {
          toast.error(res.message)
        } else {
          const data = res.data ?? []
          const options = keyword ? matchSorter(data, keyword, { keys: ['title'] }) : data
          setCourseOptions(options.map((e) => ({ key: e.id, label: e.title, value: e.id })))
          setCourseFetching(false)
        }
      })
    }
    return debounce({ delay: 500 }, loadOptions)
  }, [])

  // 页面加载时执行一次初始搜索
  useMount(debounceCourseFetch)

  // 切换课程时重新请求数据
  useEffect(() => {
    setLoading(true)
    setTabList([])
    setActiveTab(void 0)
    handleResetAnswerData()
    getByCourseId(courseId).then((res) => {
      if (!res.success) {
        toast.error(res.message)
      } else {
        const tabs: string[] = []
        // 题目乱序
        const quizzes = shuffle(res.data ?? [])
        quizzes.forEach((e) => {
          // 答案乱序
          e.answerOptions = shuffle(e.answerOptions)
          if (e.chapter && !tabs.includes(e.chapter)) {
            tabs.push(e.chapter)
          }
        })
        setTabList(
          tabs.map((tab) => ({
            key: tab,
            label: tab,
            quizzes: quizzes.filter((d) => d.chapter === tab),
            answers: void 0,
          }))
        )
        setActiveTab(tabs[0])
      }
      setLoading(false)
    })
  }, [courseId])

  /**
   * 滚动到指定的题目
   * @param id
   * @returns
   */
  const scrollTo = (id: string) => {
    if (prevScrollToId.current === id) return
    const dom = document.querySelector(`[data-id=${id}]`)
    dom?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    prevScrollToId.current = id
  }

  const listTagRefs = useRef<(HTMLSpanElement | null)[]>([]) // 用来收集答题卡的dom引用集合
  /**
   * 答题卡的事件委托处理函数, 避免每个tag都绑定事件,优化性能
   * @param e
   */
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = e.target
    listTagRefs.current.some((ref, index) => {
      if (ref === target) {
        scrollTo(quizList?.[index].id!)
        return true // 终止循环
      }
    })
  }

  const onTabChange = (e: string) => {
    // 已开始答题,但是没提交时拦截切换给个提示
    if (startedState) {
      confirm({
        title: '提示',
        content: '你的新一轮测试还没做完，确定要放弃吗？',
        okText: '放弃',
        onOk() {
          setActiveTab(e)
          handleResetAnswerData()
        },
        cancelText: '继续做',
      })
    } else {
      setActiveTab(e)
    }
  }

  /**
   * 重置当前选项卡的答题数据
   */
  const handleResetAnswerData = () => {
    form.resetFields()
    setAnswerMap((prev) => {
      prev.clear()
      return new Map()
    })
    const index = tabList.findIndex((e) => e.key === activeTab)
    if (index !== -1) {
      setTabList((prev) => {
        prev[index].answers = void 0
        const quizzes = shuffle(prev[index].quizzes!)
        quizzes.forEach((e) => {
          e.answerOptions = shuffle(e.answerOptions)
        })
        prev[index].quizzes = quizzes
        return [...prev]
      })
    }
  }

  /**
   * 提交答案
   */
  const handleSubmit = async () => {
    if (answerMap.size === 0) {
      toast.error('答点题吧，瞎猜都好')
      return
    }
    const answeredList = quizList.map((q) => {
      return { id: q.id, options: q.answerOptions.map((e) => e.id), answered: answerMap.get(q.id) }
    })
    const title = `${courseOptions.find((e) => e.key === courseId)?.label} - ${activeTab}`
    const res = await checkTest({ title, quizzesData: answeredList })
    if (res.success) {
      setAnswerMap((prev) => {
        prev.clear()
        return new Map()
      })
      setTabList((prev) => {
        const index = prev.findIndex((e) => e.key === activeTab)
        if (index !== -1) {
          prev[index].answers = res.data
        }
        return [...prev]
      })
    } else {
      toast.error(res.message)
    }
  }

  /**
   * 答题结束后给答案选项标注颜色, 绿色是正确选项, 红色是错误的
   */
  const optionsExtraClass = useCallback(
    (quizId: string, optionId: string) => {
      if (!submitState) return ''
      const isCorrect = curAnsweredResult?.find((e) => e.id === quizId)?.correctOptions.includes(optionId)
      return isCorrect ? '[&>span:last-child]:text-green-5' : '[&>span:last-child]:text-red-5'
    },
    [submitState, curAnsweredResult]
  )

  /**
   * 答题卡的结果色, 绿色是正确选项, 红色是错误的
   */
  const quizResultColor = useCallback(
    (quizId: string) => (curAnsweredResult?.find((e) => e.id === quizId)?.result ? 'success' : 'error'),
    [curAnsweredResult]
  )

  return (
    <div className="flex flex-col h-dvh">
      <header>
        <div className="h-15 absolute inset-x-0 top-0 bg-transparent"></div>
        <nav className="flex gap-4 items-center justify-between fixed z-10 top-0 inset-x-0 h-15 px-8 py-3 bg-background/70 backdrop-blur shadow-md shadow-zinc-200/50">
          <span></span>
          <Select
            showSearch
            allowClear
            filterOption={false}
            disabled={startedState}
            placeholder="输入关键字进行搜索"
            notFoundContent={courseFetching ? <Spin size="small" /> : null}
            options={courseOptions}
            onSearch={debounceCourseFetch}
            onSelect={(v) => setCourseId(v)}
            style={{ width: '300px' }}
          />
          {session ? (
            <div className="flex gap-4">
              <Link href={PATHS.ADMIN_HOME}>
                <Button>后台管理</Button>
              </Link>
              <Button onClick={() => signOut()}>退出</Button>
            </div>
          ) : (
            <Link href={PATHS.AUTH_SIGN_IN}>
              <Button>登录</Button>
            </Link>
          )}
        </nav>
      </header>
      <div className="h-15 shrink-0"></div>
      <main className="relative flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col pl-5 pr-[400px] overflow-hidden">
          {tabList.length > 0 && (
            <div className="shrink-0 w-screen-md xl:w-screen-lg mx-a">
              <Tabs activeKey={activeTab} items={tabList} onChange={onTabChange} />
            </div>
          )}
          <div className="overflow-x-hidden overflow-y-auto w-full h-full scrollbar-hide">
            <Form form={form}>
              <List
                itemLayout="horizontal"
                dataSource={quizList}
                loading={loading}
                renderItem={(item, index) => (
                  <div key={item.id} data-id={item.id} className="w-screen-md xl:w-screen-lg mx-a">
                    <List.Item>
                      <List.Item.Meta
                        avatar={<span>{index + 1}：</span>}
                        title={<Typography>{item.title}</Typography>}
                        description={
                          <div className="flex flex-col gap-2">
                            <div>
                              <Tag color="blue" className="select-none">
                                {quizTypeName[item.type]}
                              </Tag>
                            </div>
                            <Form.Item name={['quiz', index]} valuePropName="checked">
                              {item.type === 'multiple' ? (
                                <Checkbox.Group
                                  disabled={submitState}
                                  onChange={(ids: string[]) => {
                                    const tuple = ids.map((id) => {
                                      return [
                                        id,
                                        item.answerOptions.findIndex((option) => option.id === id),
                                      ] as TupleAnswered
                                    })
                                    setAnswerMap((prev) => {
                                      if (!prev.has(item.id)) {
                                        return new Map(prev.set(item.id, tuple))
                                      } else {
                                        prev.delete(item.id)
                                        return new Map(prev.set(item.id, tuple))
                                      }
                                    })
                                  }}
                                >
                                  <Space direction="vertical">
                                    {item.answerOptions.map((op, idx) => (
                                      <Checkbox
                                        key={op.id}
                                        value={op.id}
                                        className={cn(optionsExtraClass(item.id, op.id))}
                                      >
                                        <span>{alpha[idx]}：</span>
                                        {op.content}
                                      </Checkbox>
                                    ))}
                                  </Space>
                                </Checkbox.Group>
                              ) : (
                                <Radio.Group
                                  disabled={submitState}
                                  onChange={(e) => {
                                    const value = e.target.value as string
                                    const tuple = [
                                      value,
                                      item.answerOptions.findIndex((option) => option.id === value),
                                    ] as TupleAnswered

                                    // 用map结构收集数据的话,更新时需要用 new Map
                                    setAnswerMap((prev) => {
                                      if (!prev.has(item.id)) {
                                        return new Map(prev.set(item.id, [tuple]))
                                      } else {
                                        prev.delete(item.id)
                                        return new Map(prev.set(item.id, [tuple]))
                                      }
                                    })

                                    // 如果用对象收集数据的话,更新时需要用解构的方式
                                    // setAnswerMap((prev) => {
                                    //   prev[item.id] = [obj]
                                    //   return { ...prev }
                                    // })
                                  }}
                                >
                                  <Space direction="vertical">
                                    {item.answerOptions.map((op, idx) => (
                                      <Radio
                                        key={op.id}
                                        value={op.id}
                                        className={cn(optionsExtraClass(item.id, op.id))}
                                      >
                                        <span>{alpha[idx]}：</span>
                                        {op.content}
                                      </Radio>
                                    ))}
                                  </Space>
                                </Radio.Group>
                              )}
                            </Form.Item>
                          </div>
                        }
                      />
                    </List.Item>
                  </div>
                )}
              />
            </Form>
          </div>
        </div>
        <div className="absolute top-5 right-2 w-sm">
          <Card
            loading={loading}
            type="inner"
            size="small"
            title="答题卡"
            extra={
              <div className="flex gap-2">
                <Button
                  onClick={handleResetAnswerData}
                  className="disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50"
                >
                  重做
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!startedState || submitState}
                  className="disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50"
                >
                  提交
                </Button>
              </div>
            }
            onClick={handleCardClick}
          >
            <Flex wrap gap="4px 0">
              {quizList?.map((q, index) => (
                <Tag
                  key={q.id}
                  ref={(el) => {
                    listTagRefs.current[index] = el
                  }}
                  // 如果提交了答题就设置红/绿, 否则设置蓝/灰
                  color={submitState ? quizResultColor(q.id) : answerMap.has(q.id) ? 'blue' : 'default'}
                  className="w-10 h-6 !text-center hover:cursor-pointer"
                >
                  {index + 1}
                </Tag>
              ))}
            </Flex>
          </Card>
        </div>
      </main>
    </div>
  )
}
