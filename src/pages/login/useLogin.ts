import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'

import { authController } from '@/features/auth/public'
import { toAppError } from '@/shared/lib/errors'

import { LOGIN_PAGE_COPY, PRIVACY_VERSION, type LoginPageController } from './login-page.model'

export function useLogin(): LoginPageController {
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useDidShow(() => {
    if (authController.getSession() !== null) {
      void Taro.switchTab({ url: '/pages/chat/index' })
    }
  })

  const togglePrivacy = (checked: boolean) => {
    setHasAcceptedPrivacy(checked)
    if (checked) {
      setErrorMessage('')
    }
  }

  const login = () => {
    if (!hasAcceptedPrivacy || isSubmitting) {
      return
    }
    setIsSubmitting(true)
    setErrorMessage('')
    void authController
      .loginWithWechat(PRIVACY_VERSION)
      .then(async () => Taro.switchTab({ url: '/pages/chat/index' }))
      .catch((error: unknown) => {
        setErrorMessage(toAppError(error, 'REQUEST_FAILED').message || LOGIN_PAGE_COPY.retry)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  return {
    model: {
      hasAcceptedPrivacy,
      isSubmitting,
      errorMessage,
      canLogin: hasAcceptedPrivacy && !isSubmitting,
    },
    actions: {
      togglePrivacy,
      login,
    },
  }
}
