# FastAPI Backend

## 能力

- 微信 `code` 登录与 `users` upsert；
- Access JWT、refresh token 轮换和退出登录撤销；
- 当前用户默认会话的单条消息幂等写入；
- 当前用户消息游标分页读取；
- PostgreSQL 表结构由 Alembic 管理。

阶段一不调用 AI 模型，不创建 run，也不实现 SSE。完整会话和流式能力继续使用根目录 OpenAPI 中保留的后续契约。

## 环境

复制 `.env.example` 为 `.env`，至少配置：

```text
DATABASE_URL
WX_APP_ID
WX_APP_SECRET
JWT_SECRET
```

`WX_APP_SECRET` 只能存在于后端环境。未配置时登录接口返回
`503 WECHAT_NOT_CONFIGURED`，不会尝试伪造登录。

## 初始化

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.lock
.\.venv\Scripts\python.exe -m pip install -e .
.\.venv\Scripts\alembic.exe upgrade head
```

## 启动

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

OpenAPI 文档：`http://127.0.0.1:8000/docs`

## 验证

```powershell
cd backend
.\.venv\Scripts\python.exe -m ruff check app tests alembic
.\.venv\Scripts\python.exe -m ruff format --check app tests alembic
.\.venv\Scripts\pyright.exe --pythonpath .\.venv\Scripts\python.exe
.\.venv\Scripts\python.exe -m pytest -q
```

测试使用真实 PostgreSQL 连接和可替换的微信客户端，覆盖登录、JWT、消息幂等、用户隔离、refresh
token 轮换及退出撤销。
