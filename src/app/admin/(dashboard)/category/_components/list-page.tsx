'use client'

import * as React from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Space, Button, Typography, Popconfirm, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import http from '@/lib/http'
import { deleteOne } from '@/actions/category'
import { CategoryModalForm } from './modal-form'

export function CategoryListPage() {
  const tableRef = React.useRef<ActionType>()

  const columns: ProColumns<Api.CategoryListData>[] = [
    {
      title: '分类名',
      dataIndex: 'name',
      align: 'center',
      ellipsis: true,
      width: 250,
    },
    {
      title: '上级分类',
      dataIndex: ['parent', 'name'],
      align: 'center',
      ellipsis: true,
      width: 250,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      align: 'center',
      width: 180,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      align: 'center',
      width: 200,
      render: (dom, record) => (
        <Space>
          <CategoryModalForm
            tableRef={tableRef}
            title="编辑分类"
            trigger={<Typography.Link>编辑</Typography.Link>}
            record={record}
          />
          <Popconfirm
            title="确定要删除吗?"
            onConfirm={async () => {
              const res = await deleteOne(record.id)
              if (res) {
                message.success('删除成功')
                tableRef.current?.reload()
              }
            }}
          >
            <Typography.Link type="danger">删除</Typography.Link>
          </Popconfirm>
        </Space>
      ),
    },
  ]
  return (
    <ProTable<Api.CategoryListData>
      rowKey="id"
      actionRef={tableRef}
      headerTitle={
        <CategoryModalForm tableRef={tableRef} title="新增分类" trigger={<Button type="primary">新增分类</Button>} />
      }
      search={false}
      options={{
        fullScreen: false,
        density: false,
        setting: false,
        search: {
          addonBefore: <SearchOutlined />,
          style: { width: 400 },
          enterButton: '搜索',
          placeholder: '请输入关键字',
          allowClear: true,
        },
      }}
      debounceTime={500}
      columns={columns}
      request={async (values) => {
        const params = { ...values }
        delete params.current
        const res = await http.get<Api.CategoryListData[]>('/api/category', { ...params, page: values.current })
        return {
          total: res.data?.length,
          success: res.success,
          data: res.data,
        }
      }}
    />
  )
}
