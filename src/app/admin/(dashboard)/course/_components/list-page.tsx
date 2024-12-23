'use client'

import * as React from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Space, Button, Typography, Popconfirm } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { toast } from 'sonner'
import http from '@/lib/http'
import { deleteOne } from '@/actions/course.action'
import { useSettingStore } from '@/store'
import { CourseModalForm } from './modal-form'

export function CourseListPage() {
  const tableRef = React.useRef<ActionType>()
  const isAdmin = useSettingStore.getState().isAdmin

  const columns: ProColumns<Api.CourseListData>[] = [
    {
      title: '课程名称',
      dataIndex: 'title',
      align: 'center',
      ellipsis: true,
      width: 250,
    },
    {
      title: '考试类型',
      dataIndex: ['category', 'name'],
      align: 'center',
      ellipsis: true,
      width: 200,
    },
    {
      title: () => <Typography className="text-center">课程描述</Typography>,
      dataIndex: 'description',
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
    isAdmin
      ? {
          title: '操作',
          dataIndex: 'option',
          valueType: 'option',
          fixed: 'right',
          align: 'center',
          width: 120,
          render: (dom, record) => (
            <Space>
              <CourseModalForm
                tableRef={tableRef}
                title="编辑课程"
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
        }
      : {},
  ]
  return (
    <ProTable<Api.CourseListData>
      rowKey="id"
      actionRef={tableRef}
      scroll={{ x: 1200 }}
      headerTitle={
        isAdmin && (
          <CourseModalForm tableRef={tableRef} title="新增课程" trigger={<Button type="primary">新增课程</Button>} />
        )
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
        const res = await http.get('/api/course', {
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
