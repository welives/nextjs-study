'use client'

import React, { useState, useMemo, useRef } from 'react'
import { Row, Col, Card, Button, Form, Input, Select, Spin, Radio, Checkbox, Tooltip, Space } from 'antd'
import type { FormListFieldData, FormInstance, FormListOperation } from 'antd'
import { ProCard, ProForm } from '@ant-design/pro-components'
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { ErrorBoundary } from 'react-error-boundary'
import { debounce } from 'radash'
import { useMount } from 'react-use'
import { matchSorter } from 'match-sorter'
import { QuizType } from '@/lib/schema'
import { getAll as getAllCourse } from '@/actions/course'
import { useBreakpoints } from '@/hooks'
import { cn } from '@/lib/utils'

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
  answer: {
    label: '内容',
    placeholder: '请输入内容',
    rules: [{ required: true, message: '请输入内容' }],
  },
}

type FormItemType = typeof Form.Item

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

export function CreateQuizPage() {
  const { isBelowXl } = useBreakpoints('xl')
  const [form] = Form.useForm()
  const [type, setType] = useState<QuizType>()
  const [fetching, setFetching] = useState(false)
  const fetchRef = useRef(0)
  const [courseOptions, setCourseOptions] = useState<CourseValueType[]>([])

  // 封装远程搜索课程选项的防抖函数
  const debounceCourseFetch = useMemo(() => {
    const loadOptions = (keyword?: string) => {
      fetchRef.current += 1
      const fetchId = fetchRef.current
      setCourseOptions([])
      setFetching(true)

      getAllCourse().then((options) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return
        }

        const res = keyword ? matchSorter(options, keyword, { keys: ['title'] }) : options
        setCourseOptions(res.map((e) => ({ key: e.id, label: e.title, value: e.id })))
        setFetching(false)
      })
    }
    return debounce({ delay: 500 }, loadOptions)
  }, [])

  // 页面加载时执行一次初始搜索
  useMount(debounceCourseFetch)

  const onSubmit = (values: any) => {
    console.log(values)
  }

  return (
    <ErrorBoundary fallback={<h2>出错啦!</h2>}>
      <ProCard>
        <ProForm
          layout="horizontal"
          form={form}
          autoComplete="off"
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
          <Form.Item
            labelCol={{ span: 4 }}
            wrapperCol={{ span: isBelowXl ? 20 : 12 }}
            name="type"
            label={formFields.type.label}
            rules={formFields.type.rules}
          >
            <Select
              allowClear
              placeholder={formFields.type.placeholder}
              options={[
                { label: '单选题', value: QuizType.SINGLE },
                { label: '多选题', value: QuizType.MULTIPLE },
                { label: '判断题', value: QuizType.JUDGEMENT },
              ]}
              onChange={(value: QuizType) => setType(value)}
            />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 4 }}
            wrapperCol={{ span: isBelowXl ? 20 : 12 }}
            name="course_id"
            label={formFields.course_id.label}
            rules={formFields.course_id.rules}
          >
            <Select
              showSearch
              allowClear
              filterOption={false}
              placeholder={formFields.course_id.placeholder}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              options={courseOptions}
              onSearch={debounceCourseFetch}
            ></Select>
          </Form.Item>
          <Form.Item
            labelCol={{ span: 4 }}
            wrapperCol={{ span: isBelowXl ? 20 : 12 }}
            name="title"
            label={formFields.title.label}
            rules={formFields.title.rules}
          >
            <Input placeholder={formFields.title.placeholder}></Input>
          </Form.Item>

          <Form.List name="options">
            {(fields, { add, remove }, { errors }) => {
              return type && <DynamicFormContent type={type} add={add} remove={remove} form={form} fields={fields} />
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
}

function DynamicFormContent({ type, fields, form, add, remove }: DynamicFormContentProps) {
  const { isBelowXl } = useBreakpoints('xl')
  const AddAnswerButton = () => (
    <Row>
      <Col offset={4} span={isBelowXl ? 20 : 12}>
        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
          添加候选答案
        </Button>
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
                      name={[name, 'correct']}
                      valuePropName="checked"
                      className="!mb-0"
                    >
                      {type !== QuizType.MULTIPLE ? (
                        <Radio
                          onChange={(e) => {
                            const currentNamepath = ['options', name, 'correct']
                            fields.map((field) => {
                              const namepath = ['options', field.name, 'correct']
                              if (currentNamepath.join('_') !== namepath.join('_')) {
                                form.setFieldValue(namepath, false)
                              }
                            })
                          }}
                        />
                      ) : (
                        <Checkbox />
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
              <Form.Item
                {...restField}
                name={[name, 'title']}
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
