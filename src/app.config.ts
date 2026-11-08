export default defineAppConfig({
  pages: ['pages/login/index', 'pages/chat/index', 'pages/chat/detail', 'pages/me/index'],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#f6f8f7',
    navigationBarTitleText: 'AI 聊天助手',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f6f8f7',
  },
  tabBar: {
    custom: true,
    color: '#6f7d78',
    selectedColor: '#087f68',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/chat/index',
        iconPath: 'assets/tabbar/chat.png',
        selectedIconPath: 'assets/tabbar/chat-active.png',
        text: '对话',
      },
      {
        pagePath: 'pages/me/index',
        iconPath: 'assets/tabbar/me.png',
        selectedIconPath: 'assets/tabbar/me-active.png',
        text: '我的',
      },
    ],
  },
})
