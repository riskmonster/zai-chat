import { CoverImage, CoverView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'

import './index.scss'

const TABS = [
  {
    pagePath: '/pages/chat/index',
    iconPath: '../assets/tabbar/chat.png',
    selectedIconPath: '../assets/tabbar/chat-active.png',
    text: '对话'
  },
  {
    pagePath: '/pages/me/index',
    iconPath: '../assets/tabbar/me.png',
    selectedIconPath: '../assets/tabbar/me-active.png',
    text: '我的'
  }
]

function getCurrentIndex() {
  const pages = Taro.getCurrentPages()
  const route = pages[pages.length - 1]?.route || ''
  return route.includes('pages/me/index') ? 1 : 0
}

export default function CustomTabBar() {
  const [selected, setSelected] = useState(getCurrentIndex)

  useEffect(() => {
    setSelected(getCurrentIndex())
  }, [])

  const switchTab = (index: number) => {
    setSelected(index)
    Taro.switchTab({ url: TABS[index].pagePath })
  }

  return (
    <CoverView className='custom-tab-bar'>
      {TABS.map((item, index) => (
        <CoverView
          key={item.pagePath}
          className={`custom-tab-bar__item${selected === index ? ' is-active' : ''}`}
          onClick={() => switchTab(index)}
        >
          <CoverImage
            className='custom-tab-bar__icon'
            src={selected === index ? item.selectedIconPath : item.iconPath}
          />
          <CoverView className='custom-tab-bar__label'>{item.text}</CoverView>
        </CoverView>
      ))}
    </CoverView>
  )
}
