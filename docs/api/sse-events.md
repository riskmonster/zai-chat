# SSE 事件契约

## 传输要求

- Endpoint：`GET /api/v1/runs/{runId}/events`
- Content-Type：`text/event-stream`
- HTTP 响应必须使用 `Transfer-Encoding: chunked`
- Nginx 必须关闭响应缓冲，并返回 `X-Accel-Buffering: no`
- 鉴权使用 Authorization 头，不把 token 放入 URL
- 每 15 秒发送一次 `heartbeat`
- 默认连接超时 120 秒，总生成超时由服务端控制

## Wire Format

```text
id: 12
event: delta
data: {"sequence":12,"type":"delta","runId":"run_x","messageId":"msg_a","data":{"text":"你好"}}

```

约束：

- `id` 等于事件 `sequence`；
- 每条 `data` 必须是单行 JSON；
- 客户端按 `sequence` 去重；
- 连接断开后使用 `Last-Event-ID` 或 `?after=<sequence>` 恢复；
- `done`、`error` 为终止事件，不再继续读取。

## 事件

### meta

首个业务事件，提供 run、消息、模型别名和 request ID。

### delta

内容增量。客户端只追加 `data.text`，不得根据 delta 修改持久化事实。

### usage

服务端内部 token 统计。客户端可忽略，不展示供应商计费细节。

### done

最终 run 状态：

- `completed`
- `cancelled`
- `failed`

`done` 到达后客户端应拉取最终消息或 run，确认落库。

### error

可恢复或不可恢复错误：

```json
{
  "code": "MODEL_UNAVAILABLE",
  "message": "模型暂时不可用",
  "retryable": true
}
```

供应商堆栈、内部 URL、密钥和原始请求不得下发给客户端。

### heartbeat

仅用于保活，不改变消息内容或 run 状态。

## run 状态机

```text
queued -> streaming -> completed
                   |-> cancelled
                   |-> failed
```

## 客户端恢复

- 首个 token 前断线：允许自动重连；
- 已收到 delta 后断线：不自动重发用户消息，只重连同一 run；
- 重连达到上限后切换为轮询 `GET /runs/{runId}`；
- 用户主动停止调用 `POST /runs/{runId}/cancel`；
- run 已完成或已取消时，SSE 应返回终止事件并关闭连接。

## 服务端职责

- 创建 run 后立即持久化 `queued`；
- 第一段输出前更新 `streaming`；
- 所有终止路径都必须落最终状态；
- 客户端断开后按产品策略继续完成生成或取消，不能不更新 run；
- SSE 事件与最终数据库内容必须一致。
