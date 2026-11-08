interface MePageActions {
  openSettings: () => void
}

export interface MePageController {
  actions: MePageActions
}

export const ME_PAGE_COPY = {
  avatar: 'AI',
  name: '聊天助手',
  caption: '微信登录接口待接入',
  panelTitle: '基础设置',
  openSettings: '打开设置',
  settingsPending: '设置页待实现',
  version: 'Taro React 技术基线 · 4.3.2',
} as const
