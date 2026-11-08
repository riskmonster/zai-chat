# 技术架构

## 产品边界

当前阶段实现微信小程序登录、默认会话单条消息持久化和消息回读。AI 模型、流式回复、多会话、run 状态机保持为后续能力，不在两表切片中伪装实现。

## 技术栈

- 前端：Taro 4.3.2、React 18、TypeScript、Sass、Taroify、Zustand。
- 后端：FastAPI、SQLAlchemy 2 Async、asyncpg、Alembic。
- 数据库：PostgreSQL，数据库名 `zai-wp-chat`。
- 契约：`docs/api/openapi.yaml` 是 JSON API 事实源，SSE 契约独立维护。

## 数据模型

阶段一只创建 `users` 和 `messages` 两张业务表。表名使用复数，避免 PostgreSQL 的 `user`
关键字。阶段一默认令 `messages.conversation_id = users.id`，未来引入 `conversations`
表时可直接以该 ID 补建默认会话。

`users` 保存微信 `openid`、隐私授权版本、token 版本和单个 refresh token 哈希。`messages` 使用
`(user_id, conversation_id, client_message_id)` 唯一约束实现幂等写入。微信 `session_key` 不入库。

## 认证

小程序调用 `Taro.login()` 获取一次性 code，FastAPI 调用微信 `jscode2session` 换取 `openid`。Access
token 使用短期 JWT；refresh token 使用高熵随机值，数据库只保存 SHA-256。退出登录时递增
`token_version`，使旧 access token 立即失效。

所有消息查询必须带 JWT 中的 `user_id`。默认会话 ID 由服务端从当前用户派生，客户端不得提交 `userId`。

## 接口分层

- 普通 JSON 接口统一使用 `/api/v1` 和 envelope。
- 阶段一消息接口为 `/api/v1/messages`，不包含 run 或 SSE 语义。
- 完整会话接口和 `/runs/*/events` 等契约保留，待 `conversations`、`runs` 和模型适配层落地后启用。

## 前端编排

- 页面只组合 feature public API 和 shared UI。
- `View + use同名Hook + Model` 保持三层结构。
- 网络调用进入 auth/chat application 层，Store 不执行网络副作用。
- `/messages` 阶段一响应只更新消息状态，不启动 run SSE。

## 运维与安全

- 微信 AppSecret、JWT 密钥和数据库密码只进入后端环境变量。
- 日志不得输出 Authorization、code、refresh token、openid 或消息正文。
- Alembic 是表结构唯一迁移入口，禁止通过数据库管理 UI 手工维护表结构。
