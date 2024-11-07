'use client'

import * as React from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Space, Button, Typography, Popconfirm } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { toast } from 'sonner'
import http from '@/lib/http'
import { deleteOne } from '@/actions/category.action'
import { CategoryModalForm } from './modal-form'

export function CategoryListPage() {
  const tableRef = React.useRef<ActionType>()

  const columns: ProColumns<Api.CategoryListData>[] = [
    {
      title: '分类名',
      dataIndex: 'name',
      align: 'center',
      ellipsis: true,
      width: 200,
    },
    {
      title: '上级分类',
      dataIndex: ['parent', 'name'],
      align: 'center',
      ellipsis: true,
      width: 200,
    },
    {
      title: () => <Typography className="text-center">备注</Typography>,
      dataIndex: 'remark',
      align: 'left',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      align: 'center',
      hideInSearch: true,
      width: 180,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      align: 'center',
      width: 120,
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
              if (!res.success) {
                toast.error(res.message)
                return false
              }
              toast.success(res.message)
              tableRef.current?.reload()
              return true
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
      scroll={{ x: 1200 }}
      headerTitle={
        <CategoryModalForm tableRef={tableRef} title="新增分类" trigger={<Button type="primary">新增分类</Button>} />
      }
      search={false}
      options={{
        fullScreen: false,
        density: false,
        setting: false,
        search: {
          autoComplete: 'off',
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
        const res = await http.get('/api/category', {
          page: values.current,
          limit: values.pageSize,
          keyword: values.keyword,
        })
        return {
          success: res.success,
          total: res.data.count,
          data: res.data.rows,
        }
      }}
    />
  )
}
