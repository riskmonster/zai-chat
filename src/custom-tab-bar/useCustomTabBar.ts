import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'

import {
  CUSTOM_TAB_BAR_ITEMS,
  getCurrentTabIndex,
  type CustomTabBarController,
} from './custom-tab-bar.model'

function readCurrentTabIndex(): number {
  const pages = Taro.getCurrentPages()
  const route = pages[pages.length - 1]?.route ?? ''
  return getCurrentTabIndex(route)
}

export function useCustomTabBar(): CustomTabBarController {
  const [selectedIndex, setSelectedIndex] = useState(readCurrentTabIndex)

  useEffect(() => {
    setSelectedIndex(readCurrentTabIndex())
  }, [])

  const handleSwitchTab = (index: number) => {
    const target = CUSTOM_TAB_BAR_ITEMS[index]
    if (!target) {
      return
    }
    setSelectedIndex(index)
    void Taro.switchTab({ url: target.pagePath })
  }

  return {
    selectedIndex,
    tabs: CUSTOM_TAB_BAR_ITEMS,
    handleSwitchTab,
  }
}
