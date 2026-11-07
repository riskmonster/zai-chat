import { View } from '@tarojs/components'

import './app-icon.scss'

export type AppIconName = 'send' | 'stop' | 'retry'

interface AppIconProps {
  name: AppIconName
  className?: string
}

export default function AppIcon({
  name,
  className = '',
}: AppIconProps) {
  return (
    <View className={`app-icon app-icon--${name} ${className}`.trim()}>
      <View className='app-icon__shape' />
    </View>
  )
}
