'use client'

import * as React from 'react'
import { ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-components'
import type { ProFormInstance, ActionType } from '@ant-design/pro-components'

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
  record?: App.API.CategoryListData
}

const formFields = {
  pid: {
    label: '上级分类',
    placeholder: '输入关键字进行搜索',
    rules: [{ message: '请选择上级分类' }],
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
        // confirmLoading: loading,
      }}
    >
      <ProFormText hidden={true} name="id" initialValue={props.record?.id} />
      <ProFormSelect
        labelCol={{ span: 3 }}
        width="md"
        name="pid"
        placeholder={formFields.pid.placeholder}
        label={formFields.pid.label}
        rules={formFields.pid.rules}
        initialValue={props.record?.pid}
        allowClear
        showSearch
        debounceTime={1000}
      />
      <ProFormText
        labelCol={{ span: 3 }}
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
    </ModalForm>
  )
}
