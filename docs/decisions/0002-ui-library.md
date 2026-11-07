# ADR-0002：采用 Taroify 作为 UI 组件库

- 状态：Accepted
- 日期：2026-11-07

## 21st MCP 调研

当前业务基线最匹配的交互模式集中在：

- 流式回答、停止生成和重新生成；
- 居中空态与建议问题；
- 自动增高输入框和单一发送/停止按钮；
- 会话列表按最近时间分组；
- 错误状态不打断当前输入。

21st 中的 `Agent Chat`、`Prompt Input`、`Streaming Chat Response`、`Chat Empty State` 和 `Conversation List` 提供了较完整的交互参考。

这些组件主要面向 React DOM、shadcn 和 Tailwind，不能直接运行于 Taro 微信小程序，因此只采用交互模式，不引入其 DOM 源码。

## GitHub MCP 调研

对比当前可运行于 Taro React 的组件库：

- [taroify/taroify](https://github.com/taroify/taroify)：约 1100 stars，MIT，2026-11-06 仍有更新，明确支持 Taro React、微信小程序和 H5。
- [jdf2e/nutui-react](https://github.com/jdf2e/nutui-react)：约 1200 stars，MIT，同样活跃，但组件体系更偏京东业务风格。

## 决策

采用：

- `@taroify/core`

首批引入的交互：

- `Button`：新建会话、发送/停止、设置。
- 发送/停止状态图标：使用项目自有 CSS 图形，避免 Taroify 图标在当前 Taro 4 + Vite + 微信运行时中触发 `Image` 兼容异常。
- 按需样式：只加载 Button 样式，避免加载整个组件库。
- 空态使用自有布局：Taroify 默认 Empty 插图在微信自定义组件样式隔离下难以压缩，会挤压移动端建议问题区域。

后续按需增加：

- `Empty`：仅在确认能完全覆盖默认插图尺寸后使用。
- `Skeleton`：会话和消息加载态。
- `Dialog`：删除会话确认。
- `Toast`：轻量错误提示。
- `SwipeCell`：会话列表左滑删除。

## 不采用

- 不直接引入 21st 的 shadcn DOM 组件。
- 不同时引入 NutUI，避免双组件库造成主题、体积和 API 分裂。
- 不使用 Taroify 全量样式入口，首版只按组件引入。
- 不直接导入 `@taroify/icons`；它仅作为 `@taroify/core` 的传递依赖存在。
