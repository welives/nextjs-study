'use client'

import * as React from 'react'
import Link from 'next/link'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import http from '@/lib/http'

export function RecordListPage() {
  const tableRef = React.useRef<ActionType>()

  const columns: ProColumns<Api.RecordListData>[] = [
    {
      title: '标题',
      dataIndex: 'title',
      align: 'center',
      ellipsis: true,
      width: 200,
    },
    {
      title: '用户',
      dataIndex: ['user', 'username'],
      align: 'center',
      ellipsis: true,
      width: 200,
    },
    {
      title: '正确率',
      dataIndex: 'ratio',
      valueType: (item) => ({ type: 'percent', precision: 0 }),
      align: 'center',
      ellipsis: true,
      hideInSearch: true,
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
          <Link href={`/admin/record/${record.id}`}>查看</Link>
        </Space>
      ),
    },
  ]
  return (
    <ProTable<Api.RecordListData>
      rowKey="id"
      actionRef={tableRef}
      scroll={{ x: 1200 }}
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
        const res = await http.get('/api/record', {
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
