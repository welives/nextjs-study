'use client'

import * as React from 'react'
import { message } from 'antd'
import { ModalForm, ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components'
import type { ProFormInstance, ActionType } from '@ant-design/pro-components'
import { ErrorBoundary } from 'react-error-boundary'
import { matchSorter } from 'match-sorter'
import { createOne, updateOne } from '@/actions/course'
import { getAll } from '@/actions/category'

type CourseProps = {
  /**
   * modal标题
   */
  title: string
  /**
   * modal触发控件
   */
  trigger: JSX.Element
  /**
   * 表格实例
   */
  tableRef: React.MutableRefObject<ActionType | undefined>
  /**
   * 回显数据
   */
  record?: Api.CourseListData
}

const formFields = {
  cate_id: {
    label: '考试类型',
    placeholder: '输入关键字进行搜索',
    rules: [{ required: true, message: '请选择考试类型' }],
  },
  title: {
    label: '课程名称',
    placeholder: '请输入课程名称',
    rules: [{ required: true, message: '请输入课程名称' }],
  },
  description: {
    label: '课程描述',
    placeholder: '请输入课程描述',
    rules: undefined,
  },
}

export function CourseModalForm(props: CourseProps) {
  const formRef = React.useRef<ProFormInstance>()

  return (
    <ErrorBoundary fallback={<h2>出错啦!</h2>}>
      <ModalForm
        formRef={formRef}
        width="50%"
        layout="horizontal"
        title={props.title}
        trigger={props.trigger}
        modalProps={{
          destroyOnClose: true,
        }}
        onFinish={async (values) => {
          const formData = new FormData()
          for (const key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
              formData.append(key, values[key])
            }
          }
          let res
          if (values.id) {
            res = await updateOne(formData)
          } else {
            res = await createOne(formData)
          }
          if (!res.success) {
            message.error(res.message)
            return false
          }
          message.success(res.message)
          props.tableRef.current?.reload()
          return true
        }}
      >
        <ProFormText hidden={true} name="id" initialValue={props.record?.id} />
        <ProFormSelect
          labelCol={{ span: 4 }}
          width="md"
          name="cate_id"
          placeholder={formFields.cate_id.placeholder}
          label={formFields.cate_id.label}
          rules={formFields.cate_id.rules}
          initialValue={props.record?.category.id}
          allowClear
          showSearch
          debounceTime={1000}
          request={async (values) => {
            const res = await getAll()
            const list = values.keyWords ? matchSorter(res, values.keyWords, { keys: ['name'] }) : res
            return list.map((e) => ({ label: e.name, value: e.id }))
          }}
        />
        <ProFormText
          labelCol={{ span: 4 }}
          width="xl"
          name="title"
          placeholder={formFields.title.placeholder}
          label={formFields.title.label}
          rules={formFields.title.rules}
          initialValue={props.record?.title}
          fieldProps={{
            maxLength: 30,
            showCount: true,
          }}
        />
        <ProFormTextArea
          labelCol={{ span: 4 }}
          width="xl"
          name="description"
          placeholder={formFields.description.placeholder}
          label={formFields.description.label}
          rules={formFields.description.rules}
          initialValue={props.record?.description}
          fieldProps={{
            maxLength: 200,
            showCount: true,
            autoSize: { minRows: 5 },
          }}
        />
      </ModalForm>
    </ErrorBoundary>
  )
}