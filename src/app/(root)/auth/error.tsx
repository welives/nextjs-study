'use client'

import dynamic from 'next/dynamic'

/**
 * 局部错误页面
 */
export default dynamic(() => import('@/components/error'), { ssr: false })
