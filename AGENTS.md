# AGENTS.md

## 项目定位

- 产品：微信小程序优先的 AI 聊天智能体。
- 技术栈：Taro 4.3.2 + React 18 + TypeScript + Sass + Taroify + Zustand。
- 后端：FastAPI + PostgreSQL，通过 OpenAPI/SSE 契约对接。
- 当前阶段：技术基线验证和页面骨架，尚未接入真实后端。

## 必须遵守

- 微信小程序是第一目标，H5 只保证可编译。
- 不直接调用模型供应商，不把任何密钥写入 `TARO_APP_*`。
- 普通 JSON API 使用 OpenAPI 生成客户端和 `@/shared/api/openapi-request`。
- SSE 只使用 `@/shared/api/sse`，不得塞入普通 JSON 请求适配器。
- `src/generated/openapi/**` 是生成物，禁止手改。
- 契约事实源：`docs/api/openapi.yaml`、`docs/api/sse-events.md`。
- 状态使用显式状态机，不用多个布尔值表达聊天运行状态。
- Store 只保存可序列化状态与同步 transition，网络与 SSE 副作用进入 feature application 层。
- 页面只组合 feature public API、shared UI 和 Taro 路由生命周期。
- 基础组件统一从 `@/shared/ui/shell` 引入，禁止业务模块直接导入 Taro/Taroify UI 包。
- 交互型 View 必须采用 `View + use同名Hook + Model` 三层结构。
- View 只做 JSX 编排，不得持有 `useState`、`useEffect`、Taro API 或 Controller 调用。
- 组件 Props、局部状态、动作、常量和纯函数统一放入同名 `*.model.ts`。
- `model` 表示类型与纯逻辑层；`Modal` 只表示弹窗组件，不作为通用目录名。
- 不新增自定义样式、视觉常量或手写图标；优先编排 Taroify/Taro 组件能力。
- 本轮样式文件版本冻结，仅允许逻辑与组件编排改造。
- ESLint 使用 TypeScript ESLint `strict-type-checked` 与
  `stylistic-type-checked`，所有 warning 均按失败处理。
- 禁止内联 `eslint-disable`；lint 命令统一启用 `--no-inline-config`。
- 源码禁止 `console.*`、`any`、不安全调用、隐式返回边界类型和嵌套三元表达式。
- Prettier 使用严格统一配置；提交前必须通过 `pnpm format:check`。
- 命名规则必须通过 `@typescript-eslint/naming-convention`，不得用注释绕过。
- React 组件函数使用 PascalCase，自定义 Hook 使用 `use` + 大写字母开头。
- 普通函数、参数和变量使用 strictCamelCase；布尔变量必须以 `is/has/can/should/did/will` 开头。
- 类型、接口、枚举和泛型参数使用 StrictPascalCase，接口禁止 `I` 前缀。
- 交互组件使用 `PascalCase.tsx`、`usePascalCase.ts`、`PascalCase.model.ts`。
- 普通模块使用 kebab-case；Taro 路由 `index.tsx`、`detail.tsx` 是框架例外。
- 文件名和目录名必须通过 `pnpm lint:names`，不得引入第二套文件命名插件。
- Model 不得依赖 React、Taro、Zustand、OpenAPI DTO 或传输层。
- 不得跨 feature 导入内部文件；跨功能组合放在 `src/pages`。
- 新组件优先使用 Taro 组件和 Taroify 按需组件。
- 不新增第二套状态库、样式框架或跨端框架。

## 目录

```text
src/pages/                  Taro 路由与页面组合
src/features/chat/          聊天 API、模型、Controller、Store 和 UI
src/features/auth/          认证模型、Store 和持久化适配
src/shared/api/             普通请求与通用 SSE 传输
src/shared/ui/              无业务含义的共享 UI
src/shared/ui/shell.ts      外部基础组件唯一导出口
src/shared/lib/             错误、ID 等通用能力
src/generated/openapi/      OpenAPI 生成代码
src/custom-tab-bar/         微信自定义 tabbar
docs/api/                   API/SSE 契约
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
6. `pnpm format:check`
7. 微信开发者工具 Console 无新增错误
8. 自定义 tabbar、Taroify、聊天输入区和安全区可见
