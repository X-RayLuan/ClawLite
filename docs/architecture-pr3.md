# PR3 Phase 1 架构文档 — Clawlite 计费与 EZRouter Key 池

## 1. 数据库 Schema

### ezrouter_key_pool 表

Key 池表，管理所有 EZRouter API Key。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid | PK |
| name | text | Key 名称 |
| plaintext_key | text | EZRouter API Key（加密存储） |
| key_prefix | text | Key 前缀（用于安全展示，如 `sk-xxx…`） |
| status | text | 状态：`active` / `inactive` / `expired` |
| current_balance | numeric | 当前余额（USD） |
| face_value | numeric | 面值（USD） |
| request_count | int | 请求计数 |
| last_used_at | timestamptz | 最后使用时间 |
| ms_token | text | msToken 缓存 |
| token_expires_at | timestamptz | msToken 过期时间 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### balance_transactions 表

账户余额变动流水。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid | PK |
| account_id | uuid | FK → accounts.id |
| type | text | 变动类型：`freeze` / `unfreeze` / `charge` / `refund` / `recharge` |
| amount | numeric | 变动金额（USD） |
| balance_before | numeric | 变动前余额 |
| balance_after | numeric | 变动后余额 |
| related_event_id | uuid | 关联 usage_events.id |
| idempotency_key | text | 幂等键 |
| notes | jsonb | 附加数据 |
| created_at | timestamptz | 创建时间 |

### recharge_orders 表

充值订单表，对接 Stripe。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid | PK |
| account_id | uuid | FK → accounts.id |
| stripe_session_id | text | Stripe Checkout Session ID |
| stripe_payment_intent | text | Stripe Payment Intent ID |
| amount_usd | numeric | 充值金额（USD） |
| credits_added | numeric | 增加的点数 |
| status | text | 状态：`pending` / `completed` / `failed` / `refunded` |
| completed_at | timestamptz | 完成时间 |
| metadata | jsonb | 附加元数据 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

---

## 2. API 规范

### 客户 API

#### `GET /api/usage/summary`
返回当前账户的用量汇总。

**响应：**
```json
{
  "totalTokensIn": 123456,
  "totalTokensOut": 78910,
  "totalCost": 12.34,
  "remainingBalance": 87.66,
  "monthTotal": 50000,
  "monthCost": 5.00
}
```

#### `GET /api/usage/records`
返回消费明细列表（分页）。

**查询参数：**

| 参数 | 类型 | 说明 |
|---|---|---|
| page | int | 页码，默认 1 |
| limit | int | 每页条数，默认 20 |
| startTime | ISO8601 | 起始时间（可选） |
| endTime | ISO8601 | 结束时间（可选） |
| model | string | 按模型过滤（可选） |

**响应：**
```json
{
  "data": [
    {
      "id": "uuid",
      "model": "gpt-4o",
      "tokensIn": 100,
      "tokensOut": 200,
      "cost": 0.05,
      "createdAt": "2026-04-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

#### `GET /api/usage/by-model`
返回各模型的消耗统计。

**响应：**
```json
{
  "data": [
    { "model": "gpt-4o", "tokensIn": 50000, "tokensOut": 30000, "cost": 10.00 },
    { "model": "claude-3-opus", "tokensIn": 20000, "tokensOut": 15000, "cost": 8.00 }
  ]
}
```

---

### 管理后台 API

#### `GET /api/admin/ezrouter-keys`
返回 Key 池列表。

**响应：**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Production Key 1",
      "keyPrefix": "sk-xxx…",
      "status": "active",
      "currentBalance": 10.50,
      "faceValue": 50.00,
      "requestCount": 1234,
      "lastUsedAt": "2026-04-01T00:00:00Z",
      "tokenExpiresAt": "2026-04-02T00:00:00Z"
    }
  ]
}
```

#### `POST /api/admin/ezrouter-keys`
添加新 Key。

**请求体：**
```json
{
  "name": "Production Key 1",
  "plaintextKey": "sk-ezr-xxxxx",
  "faceValue": 50.00
}
```

#### `PATCH /api/admin/ezrouter-keys/:id`
更新 Key 状态。

**请求体：**
```json
{
  "status": "inactive"
}
```

#### `DELETE /api/admin/ezrouter-keys/:id`
删除 Key。

#### `GET /api/admin/customers`
返回客户列表（含余额）。

**响应：**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Customer A",
      "email": "a@example.com",
      "balance": 100.00,
      "totalSpent": 50.00
    }
  ]
}
```

#### `PATCH /api/admin/customers/:id/balance`
手动调整客户余额。

**请求体：**
```json
{
  "amount": 20.00,
  "type": "add",
  "notes": "人工补偿"
}
```

#### `GET /api/admin/usage`
返回全局消费统计。

**响应：**
```json
{
  "totalTokensIn": 1000000,
  "totalTokensOut": 800000,
  "totalCost": 500.00,
  "activeAccounts": 50,
  "period": "2026-04"
}
```

#### `GET /api/admin/recharge-orders`
返回充值订单列表。

**响应：**
```json
{
  "data": [
    {
      "id": "uuid",
      "accountId": "uuid",
      "amountUsd": 50.00,
      "creditsAdded": 5000,
      "status": "completed",
      "completedAt": "2026-04-01T00:00:00Z"
    }
  ]
}
```

---

### 内部 API

#### `POST /api/internal/ezrouter/route`
请求路由：选择可用 Key 并调用 EZRouter。

**请求体：**
```json
{
  "accountId": "uuid",
  "model": "gpt-4o",
  "prompt": "Hello",
  "stream": false
}
```

**响应：** 返回 EZRouter 原始响应。

#### `POST /api/internal/ezrouter/refresh-token`
刷新指定 Key 的 msToken。

**请求体：**
```json
{
  "keyId": "uuid"
}
```

---

## 3. 扣费流程

```
请求进入
  │
  ├─ 1. 校验 Clawlite API Key（鉴权）
  │
  ├─ 2. 查询 account + 余额
  │
  ├─ 3. 余额充足？
  │     ├─ 否 → 返回 HTTP 402 Payment Required
  │     └─ 是 → 继续
  │
  ├─ 4. 预扣费（冻结）
  │     ├─ 记录 balance_transactions (type='freeze')
  │     └─ 原子扣减 account.balance
  │
  ├─ 5. 调用 EZRouter API
  │
  ├─ 6. 记录 usage_events
  │     ├─ tokensIn / tokensOut / cost / model
  │     └─ 关联 account_id
  │
  ├─ 7. 实际扣费（解冻余款）
  │     ├─ 计算实际消耗金额
  │     ├─ 记录 balance_transactions (type='charge' + 'unfreeze')
  │     └─ 更新 account.balance
  │
  └─ 8. 返回 EZRouter 响应给客户
```

**异常处理：**

- EZRouter 调用失败 → 解冻全部预扣金额（type=`unfreeze`），返回错误
- 超时 → 同失败处理
- 幂等保证：通过 idempotency_key 防止重复扣费

---

## 4. Key 池选择策略

```
输入：model, account_id

1. [过滤] 从 ezrouter_key_pool 中筛选 status = 'active' 的 Key

2. [过滤] 筛选 current_balance > 0 的 Key（余额耗尽不分配）

3. [权重计算] 对剩余 Key 计算负载权重：
   weight = request_count / uptime_seconds
   （uptime = now() - created_at，排除刚创建的 Key 避免除零）

4. [选择] 选择 weight 最低的 Key（请求数最少 + 存活最久 = 最空闲）

5. [Token 检查] 检查 token_expires_at：
   ├─ 已过期或接近过期（如 5 分钟内）→ 先调用 /refresh-token
   └─ 正常 → 直接使用 ms_token

6. [调用] 使用选中的 plaintext_key + ms_token 调用 EZRouter

7. [更新] 调用完成后更新：
   ├─ request_count += 1
   └─ last_used_at = now()
```

**Key 状态流转：**

```
active    → (余额耗尽) → inactive
active    → (Key 过期) → expired
inactive  → (手动激活) → active
expired   → (重新配置) → active
```

---

## 5. 技术要点

### 幂等性
- 扣费流程使用 `idempotency_key` 防止重复扣费
- 同一 `idempotency_key` 的重复请求直接返回上次结果

### 事务一致性
- 预扣费和实际扣费均在数据库事务内完成
- 使用 `balance_transactions` 流水记录保证可审计性

### 安全性
- `plaintext_key` 加密存储（AES-256-GCM 或类似）
- API 响应中永远只返回 `key_prefix`（如 `sk-xxx…`）
- 内部 API 仅允许内网访问

### Stripe 对接
- 使用 Stripe Checkout Session 生成充值页面
- Webhook 接收支付完成事件，更新 `recharge_orders.status`
- 点数按配置汇率折算（如 $1 = 100 credits）
