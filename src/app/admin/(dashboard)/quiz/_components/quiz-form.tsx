'use client'

import React, { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Row, Col, Card, Button, Form, Input, Select, Spin, Radio, Checkbox, Tooltip, Space } from 'antd'
import type { FormListFieldData, FormInstance, FormListOperation } from 'antd'
import { ProCard, ProForm, ProFormText } from '@ant-design/pro-components'
import { PlusOutlined, CloseCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { ErrorBoundary } from 'react-error-boundary'
import { toast } from 'sonner'
import { debounce } from 'radash'
import { useMount } from 'react-use'
import { matchSorter } from 'match-sorter'
import hash from 'hash-sum'

import { useBreakpoints } from '@/hooks'
import { QuizType } from '@/lib/schema'
import { cn } from '@/lib/utils'
import { getAllCourse } from '@/actions/course'
import { createOne, updateOne } from '@/actions/quiz'
import { CreateQuizData, UpdateQuizData } from '@/dto'

interface CourseValueType {
  key?: string
  label: React.ReactNode
  value: string | number
}

const formFields = {
  type: {
    label: '试题类型',
    placeholder: '请选择试题类型',
    rules: [{ required: true, message: '请选择试题类型' }],
  },
  course_id: {
    label: '所属课程',
    placeholder: '输入关键字进行搜索',
    rules: [{ required: true, message: '请选择所属课程' }],
  },
  title: {
    label: '题目',
    placeholder: '请输入题目',
    rules: [{ required: true, message: '请输入题目' }],
  },
  chapter: {
    label: '章节',
    placeholder: '请输入章节',
    rules: void 0,
  },
  remark: {
    label: '备注',
    placeholder: '请输入备注',
    rules: void 0,
  },
  answer: {
    label: '内容',
    placeholder: '请输入内容',
    rules: [{ required: true, message: '请输入内容' }],
  },
}

type FormItemType = typeof Form.Item

/**
 * 把FormItem封装一层解决 `findDOMNode is deprecated` 警告
 * @see https://ant-design.antgroup.com/components/tooltip-cn#%E4%B8%BA%E4%BD%95%E5%9C%A8%E4%B8%A5%E6%A0%BC%E6%A8%A1%E5%BC%8F%E4%B8%AD%E6%9C%89%E6%97%B6%E5%80%99%E4%BC%9A%E5%87%BA%E7%8E%B0-finddomnode-is-deprecated-%E8%BF%99%E4%B8%AA%E8%AD%A6%E5%91%8A
 */
const FormListItemTrigger = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<FormItemType> & Omit<FormListFieldData, 'name'>
>((props, ref) => {
  const { key, children, ...rest } = props
  return (
    <div ref={ref}>
      <Form.Item {...rest}>{children}</Form.Item>
    </div>
  )
})

interface QuizFormProps {
  initialData: Api.QuizListData | null
}

/**
 * 试题表单页
 */
export function QuizForm({ initialData }: QuizFormProps) {
  const { isBelowXl } = useBreakpoints('xl')
  const router = useRouter()
  const [form] = Form.useForm()
  const [type, setType] = useState<QuizType>()
  const [courseOptions, setCourseOptions] = useState<CourseValueType[]>([])
  const [fetching, setFetching] = useState(false)
  const fetchRef = useRef(0)
  // 按照接口提交的格式构造数据并生成 hashkey
  const answerOptionsHashKey = useRef(
    hash(initialData?.answerOptions.map((e) => ({ id: e.id, content: e.content, is_correct: e.isCorrect })))
  )

  // 封装远程搜索课程选项的防抖函数
  const debounceCourseFetch = useMemo(() => {
    const loadOptions = (keyword?: string) => {
      fetchRef.current += 1
      const fetchId = fetchRef.current
      setCourseOptions([])
      setFetching(true)

      getAllCourse().then((res) => {
        if (fetchId !== fetchRef.current) return

        if (!res.success) {
          toast.error(res.message)
        } else {
          const data = res.data ?? []
          const options = keyword ? matchSorter(data, keyword, { keys: ['title'] }) : data
          setCourseOptions(options.map((e) => ({ key: e.id, label: e.title, value: e.id })))
          setFetching(false)
        }
      })
    }
    return debounce({ delay: 500 }, loadOptions)
  }, [])

  // 页面加载时执行一次初始搜索
  useMount(() => {
    debounceCourseFetch()
    setType(initialData?.type)
  })

  const onSubmit = async (values: CreateQuizData & UpdateQuizData) => {
    if (values.options.every((e) => !e.is_correct)) {
      toast.error('请选择至少一个正确答案')
      return false
    }
    if (values.id) {
      const newHashKey = hash(values.options)
      // 如果答案部分没有改动的话就不传给后端
      if (newHashKey === answerOptionsHashKey.current) {
        values.options = []
      }
      const res = await updateOne(values)
      if (!res.success) {
        toast.error(res.message)
        return false
      }
      toast.success(res.message)
      router.back()
    } else {
      const res = await createOne(values)
      if (!res.success) {
        toast.error(res.message)
        return false
      }
      toast.success(res.message)
      setType(void 0)
      form.resetFields()
    }
    return true
  }

  return (
    <ErrorBoundary fallback={<h2>出错啦!</h2>}>
      <ProCard
        title={
          <div className="flex gap-4 items-center">
            <span className="flex gap-2 hover:cursor-pointer hover:text-blue" onClick={() => router.back()}>
              <ArrowLeftOutlined />
              返回
            </span>
            <h3 className="m-0">{initialData ? initialData.title : '添加试题'}</h3>
          </div>
        }
      >
        <ProForm
          autoComplete="off"
          layout="horizontal"
          form={form}
          onFinish={onSubmit}
          submitter={{
            resetButtonProps: {
              onClick: () => {
                setType(void 0)
                form.resetFields()
              },
            },
            render: (props, doms) => (
              <Row>
                <Col span={isBelowXl ? 24 : 18} className="text-center">
                  <Space>{doms}</Space>
                </Col>
              </Row>
            ),
          }}
        >
          <ProFormText hidden={true} name="id" initialValue={initialData?.id} />
          <Form.Item
            labelCol={{ span: 4 }}
            wrapperCol={{ span: isBelowXl ? 20 : 12 }}
            name="type"
            label={formFields.type.label}
            rules={formFields.type.rules}
            initialValue={initialData?.type}
          >
            <Select
              allowClear
              placeholder={formFields.type.placeholder}
              options={[
                { label: '单选题', value: QuizType.SINGLE },
                { label: '多选题', value: QuizType.MULTIPLE },
                { label: '判断题', value: QuizType.JUDGEMENT },
              ]}
              onSelect={(value: QuizType) => setType(value)}
            />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 4 }}
            wrapperCol={{ span: isBelowXl ? 20 : 12 }}
            name="course_id"
            label={formFields.course_id.label}
            rules={formFields.course_id.rules}
            initialValue={initialData?.courseId}
          >
            <Select
              showSearch
              allowClear
              filterOption={false}
              placeholder={formFields.course_id.placeholder}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              options={courseOptions}
              onSearch={debounceCourseFetch}
            />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 4 }}
            wrapperCol={{ span: isBelowXl ? 20 : 12 }}
            name="title"
            label={formFields.title.label}
            rules={formFields.title.rules}
            initialValue={initialData?.title}
          >
            <Input placeholder={formFields.title.placeholder}></Input>
          </Form.Item>
          <Form.Item
            labelCol={{ span: 4 }}
            wrapperCol={{ span: isBelowXl ? 20 : 12 }}
            name="chapter"
            label={formFields.chapter.label}
            rules={formFields.chapter.rules}
            initialValue={initialData?.chapter}
          >
            <Input placeholder={formFields.chapter.placeholder}></Input>
          </Form.Item>
          <Form.Item
            labelCol={{ span: 4 }}
            wrapperCol={{ span: isBelowXl ? 20 : 12 }}
            name="remark"
            label={formFields.remark.label}
            rules={formFields.remark.rules}
            initialValue={initialData?.remark}
          >
            <Input placeholder={formFields.remark.placeholder}></Input>
          </Form.Item>

          <Form.List
            name="options"
            //! 官方文档说应该始终在 Form.List 组件设置初始值进行回显, 其内部的子字段不应该设置初始值
            initialValue={initialData?.answerOptions.map((e) => ({
              id: e.id,
              content: e.content,
              is_correct: e.isCorrect,
            }))}
            rules={[
              {
                async validator(_, options) {
                  if (!options || options.length < 1) {
                    return Promise.reject(new Error('候选答案不能为空'))
                  }
                  return true
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => {
              return (
                type && (
                  <DynamicFormContent
                    type={type}
                    add={add}
                    remove={remove}
                    form={form}
                    fields={fields}
                    errors={errors}
                    isNew={!initialData}
                  />
                )
              )
            }}
          </Form.List>
        </ProForm>
      </ProCard>
    </ErrorBoundary>
  )
}

interface DynamicFormContentProps {
  type: QuizType
  fields: FormListFieldData[]
  form: FormInstance
  add: FormListOperation['add']
  remove: FormListOperation['remove']
  errors?: React.ReactNode[]
  isNew?: boolean
}

/**
 * 动态表单部分
 */
function DynamicFormContent({ type, fields, form, add, remove, errors, isNew = true }: DynamicFormContentProps) {
  const { isBelowXl } = useBreakpoints('xl')
  const AddAnswerButton = () => (
    <Row>
      <Col offset={4} span={isBelowXl ? 20 : 12}>
        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
          添加候选答案
        </Button>
        <Form.ErrorList errors={errors} className="text-red-5 mt-2" />
      </Col>
    </Row>
  )
  return (
    <div className="flex gap-6 flex-col mb-8">
      {fields.map(({ key, name, ...restField }) => (
        <Row key={key} className="flex-1">
          <Col offset={4} span={isBelowXl ? 20 : 12}>
            <Card
              className={cn(`has-[:checked]:border-violet`)}
              size="small"
              title={
                <div className="flex items-center gap-4">
                  <span>候选答案 {name + 1}</span>
                  <Tooltip title="设为正确答案">
                    <FormListItemTrigger
                      {...restField}
                      key={key}
                      name={[name, 'is_correct']}
                      valuePropName="checked"
                      className="!mb-0"
                      {...(isNew ? { initialValue: false } : null)}
                    >
                      {type === QuizType.MULTIPLE ? (
                        <Checkbox />
                      ) : (
                        <Radio
                          onChange={(e) => {
                            const currentNamepath = ['options', name, 'is_correct']
                            fields.map((field) => {
                              const namepath = ['options', field.name, 'is_correct']
                              if (currentNamepath.join('_') !== namepath.join('_')) {
                                form.setFieldValue(namepath, false)
                              }
                            })
                          }}
                        />
                      )}
                    </FormListItemTrigger>
                  </Tooltip>
                </div>
              }
              extra={
                <Tooltip title="移除此项">
                  <CloseCircleOutlined onClick={() => remove(name)} className="ml-10 !text-red" />
                </Tooltip>
              }
            >
              <ProFormText hidden={true} name={[name, 'id']} />
              <Form.Item
                {...restField}
                name={[name, 'content']}
                rules={formFields.answer.rules}
                label={formFields.answer.label}
                className="!mb-0"
              >
                <Input.TextArea placeholder={formFields.answer.placeholder} autoSize={{ minRows: 3, maxRows: 5 }} />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      ))}
      {type !== QuizType.JUDGEMENT ? <AddAnswerButton /> : fields.length < 2 ? <AddAnswerButton /> : null}
    </div>
  )
}
