'use client'

import * as React from 'react'
import Link from 'next/link'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Button, Space, Typography, Popconfirm, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import http from '@/lib/http'
import { deleteOne } from '@/actions/quiz'

export function QuizListPage() {
  const tableRef = React.useRef<ActionType>()

  const columns: ProColumns<Api.QuizListData>[] = [
    {
      title: '题目',
      dataIndex: 'title',
      align: 'center',
      ellipsis: true,
      width: 250,
    },
    {
      title: '所属课程',
      dataIndex: ['course', 'title'],
      align: 'center',
      ellipsis: true,
      width: 200,
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
          <Link href={`/admin/quiz/${record.id}`}>编辑</Link>
          <Popconfirm
            title="确定要删除吗?"
            onConfirm={async () => {
              const res = await deleteOne(record.id)
              if (!res.success) {
                message.error(res.message)
                return false
              }
              message.success(res.message)
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
    <ProTable<Api.QuizListData>
      rowKey="id"
      actionRef={tableRef}
      scroll={{ x: 1200 }}
      headerTitle={
        <Link href="/admin/quiz/new">
          <Button type="primary">添加试题</Button>
        </Link>
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
        const res = await http.get<Api.QuizListData[]>('/api/quiz', {
          page: values.current,
          limit: values.pageSize,
          keyword: values.keyword,
        })
        return {
          total: res.data?.length,
          success: res.success,
          data: res.data,
        }
      }}
    />
  )
}
