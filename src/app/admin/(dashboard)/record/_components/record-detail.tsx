'use client'

import { useState } from 'react'
import { useRouter, notFound } from 'next/navigation'
import { List, Typography, Tag, Checkbox, Radio, Space, Spin } from 'antd'
import { ProCard } from '@ant-design/pro-components'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useMount } from 'react-use'

import { QuizType } from '@/lib/schema'
import { cn } from '@/lib/utils'
import { getOne } from '@/actions/test-record.action'

interface PageProps {
  id: string
}

interface RecordData {
  id: string
  title: string
  type: QuizType
  answerOptions: {
    id: string
    content: string
    isCorrect: boolean
  }[]
  answeredIds: string[]
}

const quizTypeName = {
  single: '单选题',
  multiple: '多选题',
  judgement: '判断题',
} as const

const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function RecordDetailPage({ id }: PageProps) {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [recordData, setRecordData] = useState<RecordData[]>()
  const [title, setTitle] = useState('')

  useMount(async () => {
    const res = await getOne(id)
    console.log(res)
    if (!res.success || !res.data) notFound()
    setRecordData(res.data.quizzes)
    setTitle(res.data.title)
    setIsMounted(true)
  })
  if (!isMounted) return <Spin />

  return (
    <ProCard
      title={
        <div className="flex gap-4 items-center">
          <span className="flex gap-2 hover:cursor-pointer hover:text-blue" onClick={() => router.back()}>
            <ArrowLeftOutlined />
            返回
          </span>
          <h3 className="m-0">{title}</h3>
        </div>
      }
    >
      <List
        itemLayout="horizontal"
        dataSource={recordData}
        renderItem={(item, index) => (
          <div key={item.id} data-id={item.id} className="w-screen-md xl:w-screen-lg mx-a">
            <List.Item>
              <List.Item.Meta
                avatar={<span>{index + 1}：</span>}
                title={<Typography>{item.title}</Typography>}
                description={
                  <div className="flex flex-col gap-2">
                    <div>
                      <Tag color="blue" className="select-none">
                        {quizTypeName[item.type]}
                      </Tag>
                    </div>
                    {item.type === 'multiple' ? (
                      <Checkbox.Group disabled value={item.answeredIds}>
                        <Space direction="vertical">
                          {item.answerOptions.map((op, idx) => (
                            <Checkbox
                              key={op.id}
                              value={op.id}
                              className={cn(
                                op.isCorrect ? '[&>span:last-child]:text-green-5' : '[&>span:last-child]:text-red-5'
                              )}
                            >
                              <span>{alpha[idx]}：</span>
                              {op.content}
                            </Checkbox>
                          ))}
                        </Space>
                      </Checkbox.Group>
                    ) : (
                      <Radio.Group disabled value={item.answeredIds[0]}>
                        <Space direction="vertical">
                          {item.answerOptions.map((op, idx) => (
                            <Radio
                              key={op.id}
                              value={op.id}
                              className={cn(
                                op.isCorrect ? '[&>span:last-child]:text-green-5' : '[&>span:last-child]:text-red-5'
                              )}
                            >
                              <span>{alpha[idx]}：</span>
                              {op.content}
                            </Radio>
                          ))}
                        </Space>
                      </Radio.Group>
                    )}
                  </div>
                }
              />
            </List.Item>
          </div>
        )}
      />
    </ProCard>
  )
}
