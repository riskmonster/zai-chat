import type { ReactElement } from 'react'

import { CoverImage, CoverView } from '@/shared/ui/shell'

import { useCustomTabBar } from './useCustomTabBar'

import './index.scss'

export default function CustomTabBar(): ReactElement {
  const { selectedIndex, tabs, handleSwitchTab } = useCustomTabBar()

  return (
    <CoverView className='custom-tab-bar'>
      {tabs.map((item, index) => (
        <CoverView
          key={item.pagePath}
          className={`custom-tab-bar__item${selectedIndex === index ? ' is-active' : ''}`}
          onClick={() => {
            handleSwitchTab(index)
          }}
        >
          <CoverImage
            className='custom-tab-bar__icon'
            src={selectedIndex === index ? item.selectedIconPath : item.iconPath}
          />
          <CoverView className='custom-tab-bar__label'>{item.text}</CoverView>
        </CoverView>
      ))}
    </CoverView>
  )
}
