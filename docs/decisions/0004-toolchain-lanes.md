# ADR-0004：构建与测试双工具链

- 状态：Accepted
- 日期：2026-11-07

## 背景

Taro 4.3.2 是最新正式版，但其 Vite Runner 仍要求 Vite 4。Vitest 5.1.0 是最新版本，要求 Vite
6.4、7 或 8。两者不能共享同一个 Vite 版本。

## 决策

使用两个彼此隔离的运行通道。

### 小程序构建通道

- Node.js 24.16.0
- Taro 4.3.2
- Vite 4.5.14
- `@vitejs/plugin-react` 4.7.0
- React 18.3.1

### 测试通道

- Node.js 24.16.0
- Vitest 5.1.0
- Vite 8.3.6
- jsdom 29.1.1

测试依赖和测试源码位于独立 `tests` pnpm workspace。Vitest 缓存写入
`.cache/vitest`，不与 Taro 构建缓存混用。

## 不采用

- 不使用 pnpm override 强迫 Taro 4.3.2 使用 Vite 8。
- 不将 Vite 8 的 Rolldown 行为引入微信小程序生产构建。
- 不把 Vitest 5 安装到根 workspace，避免其 peer 依赖与 Taro 的 Vite 4 冲突。

## 验收

- `pnpm toolchain:check` 必须输出构建区 Vite 4.5.14、测试区 Vite 8.3.6、Vitest 5.1.0。
- `pnpm test:typecheck`、`pnpm test:run` 使用测试 workspace。
- `pnpm build:weapp`、`pnpm build:h5` 使用根构建 workspace。
