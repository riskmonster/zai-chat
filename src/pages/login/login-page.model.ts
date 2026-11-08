export const PRIVACY_VERSION = '2026-11'

interface LoginPageModel {
  hasAcceptedPrivacy: boolean
  isSubmitting: boolean
  errorMessage: string
  canLogin: boolean
}

interface LoginPageActions {
  togglePrivacy: (checked: boolean) => void
  login: () => void
}

export interface LoginPageController {
  model: LoginPageModel
  actions: LoginPageActions
}

export const LOGIN_PAGE_COPY = {
  title: 'AI 聊天助手',
  description: '使用微信登录后即可开始对话。当前基础版本会保存你发送的消息。',
  privacy: '我已阅读并同意隐私政策',
  login: '微信授权登录',
  submitting: '正在登录',
  retry: '登录失败，请重试',
} as const
