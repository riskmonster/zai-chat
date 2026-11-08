export interface CustomTabItem {
  pagePath: string
  iconPath: string
  selectedIconPath: string
  text: string
}

interface CustomTabBarActions {
  handleSwitchTab: (index: number) => void
}

export interface CustomTabBarController extends CustomTabBarActions {
  selectedIndex: number
  tabs: readonly CustomTabItem[]
}

export const CUSTOM_TAB_BAR_ITEMS: readonly CustomTabItem[] = [
  {
    pagePath: '/pages/chat/index',
    iconPath: '../assets/tabbar/chat.png',
    selectedIconPath: '../assets/tabbar/chat-active.png',
    text: '对话',
  },
  {
    pagePath: '/pages/me/index',
    iconPath: '../assets/tabbar/me.png',
    selectedIconPath: '../assets/tabbar/me-active.png',
    text: '我的',
  },
]

export function getCurrentTabIndex(route: string): number {
  return route.includes('pages/me/index') ? 1 : 0
}
