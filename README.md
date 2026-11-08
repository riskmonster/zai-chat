# Zai Chat MP

微信小程序优先的 AI 聊天智能体前端。

当前技术基线：

- Taro 4.3.2
- React 18.3.1
- TypeScript 5.9.3
- Sass 1.108.1
- Taroify
- Zustand
- 构建 Vite 4.5.14
- Vitest 5.1.0 + 测试 Vite 8.3.6
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
pnpm build:h5
```

将微信开发者工具项目目录指向本仓库，`project.config.json` 中的 `miniprogramRoot` 为
`./dist/weapp`。微信产物为 `dist/weapp`，H5 产物为 `dist/h5`，两者互不覆盖。

## 接口契约

- [OpenAPI](./docs/api/openapi.yaml)
- [SSE 事件](./docs/api/sse-events.md)

重新生成普通 JSON API 客户端：

```bash
pnpm contract:check
```

## 验证

```bash
pnpm contract:check
pnpm format:check
pnpm typecheck
pnpm test:typecheck
pnpm lint
pnpm lint:styles
pnpm test:run
pnpm toolchain:check
pnpm build:weapp
pnpm build:h5
```

小程序构建和测试使用两条隔离的 Vite 通道，详见
[ADR-0004](./docs/decisions/0004-toolchain-lanes.md)。

静态检查覆盖 TypeScript 严格模式、类型感知 ESLint、架构边界、Vitest/Testing
Library、SCSS、Prettier、Knip 和 Git hooks，详见
[ADR-0005](./docs/decisions/0005-static-analysis.md)。

## 当前范围

- 已实现会话列表、聊天输入骨架、我的页面和自定义 tabbar。
- 已接入 Taroify 按需样式。
- 已生成 OpenAPI 客户端。
- 已实现微信 chunked SSE 传输、SSE parser 和增量 UTF-8 解码。
- 尚未实现微信登录、FastAPI 服务、PostgreSQL 存储和真实模型回复。
