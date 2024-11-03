'use client'

import * as React from 'react'
import Link from 'next/link'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Button, Space, Typography, Popconfirm, Table, TableColumnsType, Tag } from 'antd'
import { toast } from 'sonner'
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import http from '@/lib/http'
import { deleteOne } from '@/actions/quiz'

export function QuizListPage() {
  const tableRef = React.useRef<ActionType>()

  const columns: ProColumns<Api.QuizListData>[] = [
    {
      title: () => <Typography className="text-center">题目</Typography>,
      dataIndex: 'title',
      align: 'left',
      ellipsis: true,
    },
    {
      title: '所属课程',
      dataIndex: ['course', 'title'],
      align: 'center',
      ellipsis: true,
      width: 200,
    },
    {
      title: '章节',
      dataIndex: 'chapter',
      align: 'center',
      width: 180,
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

  const expandColumns: TableColumnsType<Api.QuizAnswerOption> = [
    {
      title: '是否正确答案',
      dataIndex: 'isCorrect',
      width: 100,
      align: 'center',
      render: (text, record) => (
        <Tag
          bordered={false}
          color={record.isCorrect ? 'success' : 'error'}
          icon={
            record.isCorrect ? <CheckCircleOutlined></CheckCircleOutlined> : <CloseCircleOutlined></CloseCircleOutlined>
          }
        />
      ),
    },
    {
      title: '候选答案',
      dataIndex: 'content',
      render: (text, record) => (
        <Typography.Text type={record.isCorrect ? 'success' : 'secondary'}>{text}</Typography.Text>
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
        const res = await http.get('/api/quiz', {
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
      expandable={{
        expandedRowRender: (record) => (
          <Table<Api.QuizAnswerOption>
            columns={expandColumns}
            pagination={false}
            dataSource={record.answerOptions.map((e) => ({ ...e, key: e.id }))}
          ></Table>
        ),
      }}
    />
  )
}
