# ADR-0006：Taro feature-first 目录与模块边界

- 状态：Accepted
- 日期：2026-11-07

## 背景

Taro 要求 `src/app.*`、`src/pages` 和页面内 `*.config.ts`
遵循框架约定。与此同时，聊天、认证、传输、生成客户端和共享 UI 需要清晰的所有权及依赖方向。

## 决策

采用 Taro 路由约定加 React feature-first，并选择性使用 Feature-Sliced Design 的单向依赖和 public
API 思想。

```text
src/
  app.ts
  app.config.ts
  app.scss
  pages/
  features/
    auth/
    chat/
  shared/
    api/
    config/
    lib/
    ui/
      shell.ts
  generated/openapi/
  custom-tab-bar/
  assets/
```

不引入完整的 `entities`、`widgets` 或 `processes` 层。只有页面私有且不复用的 UI 才放回页面目录。

## Public API

每个 feature 通过 `public.ts` 显式导出跨模块契约。Public API 不是 `export *`
大型 barrel，内部文件默认私有。

基础组件与图标只通过 `shared/ui/shell.ts` 导出。交互型 View、同名 Hook 和 Model 的职责见 ADR-0007。

## 静态检查

- TypeScript Alias 通过 `eslint-import-resolver-typescript` 解析。
- `import/no-restricted-paths` 约束目录方向。
- `@typescript-eslint/no-restricted-imports` 约束框架、传输和内部路径导入。
- `pnpm lint:architecture` 通过 ESLint stdin 注入违规 import，证明规则会让构建失败。

## 结果

- 页面保持轻量，只负责路由生命周期和功能组合。
- Store 可独立测试，不持有 SSE 资源。
- 生成 DTO 在 API 边界被转换为领域模型。
- Shared 层可独立复用，不反向依赖业务 Store。
- 新 feature 可按相同范式增加，不需要扩展平铺的技术目录。
