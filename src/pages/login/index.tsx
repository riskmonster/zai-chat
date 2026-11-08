import type { ReactElement } from 'react'

import { Button, Checkbox, Text, View } from '@/shared/ui/shell'

import { LOGIN_PAGE_COPY } from './login-page.model'
import { useLogin } from './useLogin'

export default function LoginPage(): ReactElement {
  const { model, actions } = useLogin()

  return (
    <View>
      <View>
        <Text>{LOGIN_PAGE_COPY.title}</Text>
      </View>
      <View>
        <Text>{LOGIN_PAGE_COPY.description}</Text>
      </View>
      <View>
        <Checkbox
          checked={model.hasAcceptedPrivacy}
          onChange={actions.togglePrivacy}
        >
          {LOGIN_PAGE_COPY.privacy}
        </Checkbox>
      </View>
      {model.errorMessage.length > 0 ? (
        <View>
          <Text>{model.errorMessage}</Text>
        </View>
      ) : null}
      <View>
        <Button
          block
          color='primary'
          disabled={!model.canLogin}
          loading={model.isSubmitting}
          onClick={actions.login}
        >
          {model.isSubmitting ? LOGIN_PAGE_COPY.submitting : LOGIN_PAGE_COPY.login}
        </Button>
      </View>
    </View>
  )
}
