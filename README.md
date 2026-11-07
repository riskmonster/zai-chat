# Zai Chat MP

微信小程序优先的 AI 聊天智能体前端。

当前技术基线：

- Taro 4.3.2
- React 18
- TypeScript
- Sass
- Taroify
- Zustand
- FastAPI + PostgreSQL（后端独立仓库）
- OpenAPI 3.1 + SSE

## 开始

```bash
pnpm install
pnpm dev:weapp
```

生产构建：

```bash
pnpm build:weapp
```

将微信开发者工具项目目录指向本仓库，`project.config.json` 中的 `miniprogramRoot` 为 `./dist/weapp`。
微信产物为 `dist/weapp`，H5 产物为 `dist/h5`，两者互不覆盖。

## 接口契约

- [OpenAPI](./docs/api/openapi.yaml)
- [SSE 事件](./docs/api/sse-events.md)

重新生成普通 JSON API 客户端：

```bash
pnpm contract:check
```

## 验证

```bash
pnpm typecheck
pnpm lint
pnpm test:run
pnpm build:weapp
```

## 当前范围

- 已实现会话列表、聊天输入骨架、我的页面和自定义 tabbar。
- 已接入 Taroify 按需样式。
- 已生成 OpenAPI 客户端。
- 已实现微信 chunked SSE 传输、SSE parser 和增量 UTF-8 解码。
- 尚未实现微信登录、FastAPI 服务、PostgreSQL 存储和真实模型回复。
