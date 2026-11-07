import Button from '@taroify/core/button'
import { Text, Textarea, View } from '@tarojs/components'
import { useState } from 'react'

import './detail.scss'

export default function ChatDetailPage() {
  const [draft, setDraft] = useState('')

  return (
    <View className='chat-detail-page'>
      <View className='chat-detail-messages'>
        <View className='chat-detail-welcome'>
          <Text className='chat-detail-name'>AI 助手</Text>
          <Text className='chat-detail-copy'>
            消息与流式回复接口接入后，会在这里实时显示。
          </Text>
        </View>
      </View>

      <View className='chat-composer'>
        <Textarea
          className='chat-composer-input'
          value={draft}
          maxlength={2000}
          autoHeight
          placeholder='输入消息'
          onInput={event => setDraft(event.detail.value)}
        />
        <View className='chat-composer-footer'>
          <Text className='chat-composer-count'>{draft.length}/2000</Text>
          <Button
            size='small'
            shape='round'
            color='primary'
            disabled={!draft.trim()}
          >
            发送
          </Button>
        </View>
      </View>
    </View>
  )
}
