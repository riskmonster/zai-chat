# ADR-0005：静态检查与质量门禁

- 状态：Accepted
- 日期：2026-11-07

## 决策

静态检查分为源码、测试、样式、格式和依赖五个层次。

### 源码

- ESLint 8.57.1：Taro 4.3.2 官方配置仍要求 ESLint 8。
- TypeScript ESLint 8.72.1：通过 pnpm override 替换 Taro 配置中的 6.21.0。
- 继承 `plugin:@typescript-eslint/strict-type-checked` 与
  `plugin:@typescript-eslint/stylistic-type-checked`。
- 启用 `projectService` 类型感知检查。
- 所有 warning 通过 `--max-warnings 0` 视为失败。
- CLI 统一启用 `--no-inline-config` 和 `--report-unused-disable-directives`。
- 核心规则包括 Promise 使用、类型导入、switch 穷尽、显式模块返回类型、禁止
  `any`、禁止 unsafe 调用、禁止 console、禁止嵌套三元和禁止 TODO/FIXME。
- React Hooks 规则统一为 error，包括依赖数组和 Hooks 调用顺序。
- 启用 `import/no-cycle` 与 `import/no-restricted-paths`。
- 使用 `eslint-import-resolver-typescript` 解析 `@/` alias，避免目录边界规则漏检。

命名规则：

- `@typescript-eslint/naming-convention` 管函数、变量、参数、类型、泛型、枚举成员和属性。
- 普通函数和变量使用 strictCamelCase，模块级常量允许 UPPER_CASE。
- React 组件使用 StrictPascalCase；自定义 Hook 必须匹配 `^use[A-Z][A-Za-z0-9]*$`。
- 布尔变量必须使用 `is/has/can/should/did/will` 前缀。
- TypeLike 使用 StrictPascalCase，并禁止接口 `I` 前缀。
- `react/function-component-definition` 要求具名组件使用 function declaration。
- 文件与目录命名由 `@ls-lint/ls-lint` 独立检查，避免再引入重复 ESLint 文件命名插件。

架构边界：

- Feature `model` 不依赖 API、传输、Store、UI、React、Taro 或 Zustand。
- Feature `store` 只包含同步状态，不依赖 API、Controller、UI 或页面。
- `shared` 不依赖 `features` 或 `pages`。
- 页面只使用 feature `public.ts`、shared UI 和 Taro 路由能力。
- 页面和展示组件不得导入生成的 OpenAPI 客户端或内部文件。
- `pnpm lint:architecture` 同时执行 ESLint 违规 import 探针和 View 编排扫描。
- 外部 Taro/Taroify 组件只能通过 `src/shared/ui/shell.ts` 引入。
- `.tsx` 不得导入 React 状态或 Effect Hook、Taro API、API、Store 或 Controller。
- 交互型组件必须存在同名 `use<Component>.ts` 和 `<Component>.model.ts`。

### TypeScript

- `strict: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- 应用和测试分别执行 `tsc --noEmit`。

### 测试

测试使用独立 pnpm workspace：

- Vitest 5.1.0
- Vite 8.3.6
- `@vitest/eslint-plugin` 1.6.27
- `eslint-plugin-testing-library` 7.16.2
- jsdom 29.1.1

测试静态检查继承相同的 strict/stylistic TypeScript 规则，并补充：

- `eslint-plugin-import` 与 TypeScript resolver。
- `--no-inline-config`。
- 禁止 focused tests、手工清理、容器查询和直接 DOM 节点访问。
- 优先使用可访问角色查询，并对 Vitest mock 使用显式函数类型。

### 样式

- Stylelint 17.16.0
- `stylelint-config-standard-scss` 17.0.0
- 支持 Taro `page` 选择器与项目 BEM 命名。
- 采用微信兼容的 legacy color function 语法。

### 格式

- Prettier 3.9.10
- `eslint-config-prettier` 10.1.8
- 统一 LF 行尾、2 空格、单引号、无分号、100 字符行宽和 always trailing comma。
- JSX 使用单引号，并在多属性场景每行一个属性。
- Markdown 使用 `proseWrap: always`。
- 启用 `checkIgnorePragma` 和 `embeddedLanguageFormatting: auto`。
- `src/generated/**`、`dist/**` 和锁文件不格式化。
- `src/index.html` 排除自动格式化，因为 Taro H5 依赖 `htmlWebpackPlugin.options.script` 单行占位符。

### 依赖与死代码

- Knip 6.44.2
- Taro 通过配置和约定加载的页面、插件和运行时依赖加入显式入口或忽略列表。
- 首版采用报告模式，避免框架动态加载造成误删。

### Git Hooks

- commit-msg：Commitlint。
- pre-commit：lint-staged。
- TS/TSX 执行 ESLint、测试规则和 Prettier。
- SCSS 执行 Stylelint 和 Prettier。
- JSON、Markdown、YAML、JS/MJS 执行 Prettier。
