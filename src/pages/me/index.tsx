import type { ReactElement } from 'react'

import { Button, Text, View } from '@/shared/ui/shell'

import { ME_PAGE_COPY } from './me-page.model'
import { useMePage } from './useMePage'

import './index.scss'

export default function MePage(): ReactElement {
  const { actions } = useMePage()

  return (
    <View className='me-page'>
      <View className='me-profile'>
        <View className='me-avatar'>{ME_PAGE_COPY.avatar}</View>
        <View className='me-profile-copy'>
          <Text className='me-name'>{ME_PAGE_COPY.name}</Text>
          <Text className='me-caption'>{ME_PAGE_COPY.caption}</Text>
        </View>
      </View>

      <View className='me-panel'>
        <Text className='me-panel-title'>{ME_PAGE_COPY.panelTitle}</Text>
        <Button
          block
          variant='outlined'
          color='primary'
          onClick={actions.openSettings}
        >
          {ME_PAGE_COPY.openSettings}
        </Button>
      </View>

      <Text className='me-version'>{ME_PAGE_COPY.version}</Text>
    </View>
  )
}
