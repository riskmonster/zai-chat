# ADR-0007：基础组件 Shell 与 View 三层编排

- 状态：Accepted
- 日期：2026-11-07

## 目的

统一基础组件入口、View 交互边界和类型归属，避免业务 View 直接绑定外部组件库、持有复杂交互逻辑或内联类型。

## 基础组件

- `src/shared/ui/shell.ts` 是 Taro 与 Taroify 基础组件的唯一入口。
- Shell 只允许显式 re-export，不包含业务组件、默认样式或业务行为。
- 业务代码不得直接导入 `@tarojs/components`、`@taroify/core/*` 或 `@taroify/icons/*`。
- 按需样式仍在应用组合根集中注册。
- 不新增自定义视觉组件替代成熟组件库能力。

## View 三层

交互型 View 使用同目录三层结构：

```text
ComponentName/
  ComponentName.tsx
  useComponentName.ts
  ComponentName.model.ts
```

- View：只解构 Hook 返回值和组合外部组件，不持有 React 状态、Effect、Taro API 或 Controller。
- Hook：集中管理局部状态、派生状态、事件处理、Effect 和页面能力调用。
- Model：集中 Props、State、Action、ViewModel、常量和纯函数，不依赖 React、Taro 或 Zustand。

纯展示叶子组件可以省略空 Hook，但仍有交互逻辑时必须提取同名 Hook。

## 状态边界

- 远程业务状态继续由 Feature Store、API 和 Controller 管理。
- 输入草稿、提交锁、当前 tab 等局部 UI 状态进入同名 Hook。
- View 不直接读取 Store 或调用 Controller。
- 同一业务状态不使用多个布尔值表达。

## 命名

- 统一使用 `model` 表示纯类型与常量层。
- `Modal` 仅表示弹窗组件，不作为通用类型目录。
- 组件文件与 Hook 文件使用同一语义名称，例如 `ChatComposer.tsx` 与 `useChatComposer.ts`。

## 样式约束

- 本轮只做组件与逻辑编排，不新增或修改 SCSS。
- 不手写图标、视觉装饰或重复样式来替代组件库能力。
- 图标优先使用组件库图标；若当前平台存在已验证兼容问题，必须通过 ADR 和运行时验收单独记录例外。

## 静态门禁

- 禁止业务模块绕过 Shell 导入外部 UI 包。
- 禁止 `.tsx` 直接导入 React 状态 Hook。
- 禁止 View 直接导入 Store、API、Controller 或 Taro API。
- 架构故障注入必须覆盖上述规则。
