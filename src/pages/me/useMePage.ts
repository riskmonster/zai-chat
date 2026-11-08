import Taro from '@tarojs/taro'

import { ME_PAGE_COPY, type MePageController } from './me-page.model'

export function useMePage(): MePageController {
  return {
    actions: {
      openSettings: () => {
        void Taro.showToast({ title: ME_PAGE_COPY.settingsPending, icon: 'none' })
      },
    },
  }
}
