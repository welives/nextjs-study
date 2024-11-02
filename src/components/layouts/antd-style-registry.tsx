'use client'

import * as React from 'react'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { App, ConfigProvider, ConfigProviderProps } from 'antd'
import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import { useSettingStore } from '@/store'
import { locales } from '@/constants'

import 'antd/dist/reset.css'

/**
 * 根据官方文档，封装antd的包裹组件 @see https://ant-design.antgroup.com/docs/react/use-with-next-cn
 */

export function AntdStyleRegistry({ children }: React.PropsWithChildren) {
  const defaultLocale = useSettingStore.getState().defaultLocale
  const [locale, setLocale] = React.useState<ConfigProviderProps['locale']>(zhCN)
  React.useEffect(() => {
    if (defaultLocale === locales[0]) {
      setLocale(enUS)
      dayjs.locale('en')
    } else {
      setLocale(zhCN)
      dayjs.locale('zh-cn')
    }
  }, [defaultLocale])

  return (
    <AntdRegistry>
      <ConfigProvider locale={locale}>
        <App className="h-dvh bg-background text-foreground">{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  )
}
