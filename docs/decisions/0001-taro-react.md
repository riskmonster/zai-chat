# ADR-0001：使用 Taro React 重建小程序前端

- 状态：Accepted
- 日期：2026-11-07

## 决策

小程序前端使用 Taro 4.3.2 + React 18 + TypeScript + Sass + Taroify + Zustand。

## 原因

- 团队更熟悉 React。
- 当前聊天业务尚未实现，切换成本处于最低阶段。
- Taro 持续维护，支持 React 和微信小程序。
- Taro 微信端支持 `enableChunked`、`onChunkReceived` 和请求中止。
- 既有 OpenAPI/SSE 契约与前端框架无关，可以原样复用。

## 不采用

- 不继续使用 uni-app，避免团队长期维护 Vue 技术债。
- 不使用 Rax、mpvue 等停止维护方案。
- 不在首版引入 weapp-tailwindcss，避免额外 Node/Tailwind 版本约束。
- 不引入 TanStack Query 或 Redux，首版使用 Zustand 管理聊天和认证状态。

## 验证结果

- 官方 Taro React + TypeScript + Sass + Vite 模板创建成功。
- Taro 微信生产构建成功。
- Taroify Button 按需构建成功。
- 微信自定义 tabbar 产物生成。
- OpenAPI 客户端生成和契约检查成功。
- SSE 增量 UTF-8、SSE parser、Taro request chunk 运行时测试通过。
