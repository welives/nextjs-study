'use client'

import * as React from 'react'
import { ModalForm, ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components'
import type { ProFormInstance, ActionType } from '@ant-design/pro-components'
import { matchSorter } from 'match-sorter'
import { getAll, createOne, updateOne } from '@/actions/category'

type CategoryProps = {
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
  record?: Api.CategoryListData
}

const formFields = {
  pid: {
    label: '上级分类',
    placeholder: '输入关键字进行搜索',
    rules: undefined,
  },
  name: {
    label: '分类名称',
    placeholder: '请输入分类名称',
    rules: [{ required: true, message: '请输入分类名称' }],
  },
  remark: {
    label: '备注',
    placeholder: '请输入备注',
    rules: undefined,
  },
}

export function CategoryModalForm(props: CategoryProps) {
  const formRef = React.useRef<ProFormInstance>()

  return (
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
        let res = void 0
        if (values.id) {
          res = await updateOne(values)
        } else {
          res = await createOne(values)
        }
        if (res) {
          props.tableRef.current?.reload()
          return true
        }
        return false
      }}
    >
      <ProFormText hidden={true} name="id" initialValue={props.record?.id} />
      <ProFormSelect
        labelCol={{ span: 4 }}
        width="md"
        name="pid"
        placeholder={formFields.pid.placeholder}
        label={formFields.pid.label}
        rules={formFields.pid.rules}
        initialValue={props.record?.pid}
        allowClear
        showSearch
        debounceTime={1000}
        request={async (values) => {
          const res = await getAll()
          const list = values.keyWords ? matchSorter(res, values.keyWords, { keys: ['name'] }) : res
          const currentChildIds = props.record?.id ? list.find((e) => e.id === props.record.id).childIds : []
          return list.map((e) => ({
            label: e.name,
            value: e.id,
            // 自己和后代不能选
            disabled: e.id === props.record?.id || currentChildIds.includes(e.id),
          }))
        }}
      />
      <ProFormText
        labelCol={{ span: 4 }}
        width="xl"
        name="name"
        placeholder={formFields.name.placeholder}
        label={formFields.name.label}
        rules={formFields.name.rules}
        initialValue={props.record?.name}
        fieldProps={{
          maxLength: 30,
          showCount: true,
        }}
      />
      <ProFormTextArea
        labelCol={{ span: 4 }}
        width="xl"
        name="remark"
        placeholder={formFields.remark.placeholder}
        label={formFields.remark.label}
        rules={formFields.remark.rules}
        initialValue={props.record?.remark}
        fieldProps={{
          maxLength: 200,
          showCount: true,
          autoSize: { minRows: 5 },
        }}
      />
    </ModalForm>
  )
}
