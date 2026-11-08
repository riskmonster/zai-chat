import type { PropsWithChildren, ReactNode } from 'react'

import { clearAuthSession, getAuthAccessToken } from '@/features/auth/public'
import { configureApiClient } from '@/shared/api/openapi-request'

import '@taroify/core/button/style/index.js'
import '@taroify/core/textarea/style/index.js'
import '@taroify/icons/style/index.js'
import './app.scss'

configureApiClient({
  getAccessToken: getAuthAccessToken,
  onUnauthorized: clearAuthSession,
})

function App({ children }: PropsWithChildren): ReactNode {
  // children 是将要会渲染的页面
  return children
}

export default App
