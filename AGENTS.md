# AGENTS.md

## 项目定位

- 产品：微信小程序优先的 AI 聊天智能体。
- 技术栈：Taro 4.3.2 + React 18 + TypeScript + Sass + Taroify + Zustand。
- 后端：FastAPI + PostgreSQL，通过 OpenAPI/SSE 契约对接。
- 当前阶段：技术基线验证和页面骨架，尚未接入真实后端。

## 必须遵守

- 微信小程序是第一目标，H5 只保证可编译。
- 不直接调用模型供应商，不把任何密钥写入 `TARO_APP_*`。
- 普通 JSON API 使用 OpenAPI 生成客户端和 `@/services/openapi-request`。
- SSE 只使用 `@/services/sse`，不得塞入普通 JSON 请求适配器。
- `src/service/**` 是生成物，禁止手改。
- 契约事实源：`docs/api/openapi.yaml`、`docs/api/sse-events.md`。
- 状态使用显式状态机，不用多个布尔值表达聊天运行状态。
- 新组件优先使用 Taro 组件和 Taroify 按需组件。
- 不新增第二套状态库、样式框架或跨端框架。

## 目录

```text
src/pages/chat/       会话列表和聊天详情
src/pages/me/         我的
src/custom-tab-bar/   微信自定义 tabbar
src/services/         普通请求和 SSE 适配
src/store/            Zustand 状态
src/service/          OpenAPI 生成代码
docs/api/             API/SSE 契约
```

## 命令

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test:run
pnpm contract:check
pnpm build:weapp
pnpm build:h5
```

Windows 使用 `pnpm.cmd`。

## 交付门禁

1. `pnpm contract:check`
2. `pnpm typecheck`
3. `pnpm lint`
4. `pnpm test:run`
5. `pnpm build:weapp`
6. 微信开发者工具 Console 无新增错误
7. 自定义 tabbar、Taroify、聊天输入区和安全区可见
