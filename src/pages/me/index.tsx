import Button from '@taroify/core/button'
import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'

import './index.scss'

export default function MePage() {
  return (
    <View className='me-page'>
      <View className='me-profile'>
        <View className='me-avatar'>AI</View>
        <View className='me-profile-copy'>
          <Text className='me-name'>聊天助手</Text>
          <Text className='me-caption'>微信登录接口待接入</Text>
        </View>
      </View>

      <View className='me-panel'>
        <Text className='me-panel-title'>基础设置</Text>
        <Button
          block
          variant='outlined'
          color='primary'
          onClick={() => Taro.showToast({ title: '设置页待实现', icon: 'none' })}
        >
          打开设置
        </Button>
      </View>

      <Text className='me-version'>Taro React 技术基线 · 4.3.2</Text>
    </View>
  )
}
