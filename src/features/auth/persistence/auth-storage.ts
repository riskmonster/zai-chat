import Taro from '@tarojs/taro'

export const authStorage = {
  getItem: (key: string): string | null => {
    const value: unknown = Taro.getStorageSync(key)
    return typeof value === 'string' && value.length > 0 ? value : null
  },
  setItem: (key: string, value: string): void => {
    Taro.setStorageSync(key, value)
  },
  removeItem: (key: string): void => {
    Taro.removeStorageSync(key)
  },
}
