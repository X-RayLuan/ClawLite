# ClawRouter 支付与账户管理模块 PRD

> **文档版本：** v1.0  
> **最后更新：** 2026-04-20  
> **负责人：** Clawlite PD  
> **状态：** 待评审

---

## 一、概述

### 1.1 项目背景

ClawRouter 是 ClawLite 产品的核心路由服务，用户通过付款获得 API 访问权限和账户余额。现有的支付系统已接入 Stripe，但用户端的账户余额、消费记录、充值记录管理界面不完整，需要在用户 Dashboard 上构建完整的**支付与账户管理中心**。

### 1.2 核心目标

| 目标 | 描述 |
|------|------|
| **余额可视化** | 用户可实时查看可用余额、冻结余额、总余额 |
| **充值能力** | 支持 Stripe 充值，支持 Promo Code，支持多档位金额 |
| **消费透明** | 用户可查看每笔 API 调用的用量明细和费用 |
| **流水可查** | 用户可查看完整的账户流水（充值/消费/退款/冻结） |
| **预警机制** | 余额不足、异常消费预警 |

### 1.3 范围

**本 PRD 范围：**

- 用户 Dashboard 账户模块（ClawRouter Dashboard）
- 账户余额管理（可用/冻结/总余额）
- 充值系统（Stripe 集成）
- 消费记录（API 调用明细）
- 账户流水（balance_transactions）
- 管理后台（管理员视角的账户管理）

**本 PRD 不涉及：**

- 计费引擎（计费逻辑在 ClawRouter 路由层，不在本模块范围）
- 退款流程（客服/管理员操作）
- 发票系统
- 订阅管理（SAAS 订阅）

---

## 二、系统现状

### 2.1 现有数据库表

#### `accounts` — 账户主表
```sql
id                  uuid primary key
email               text
plan                text default 'free'
billing_status      text default 'inactive'
credit_balance_usd  numeric(18,2) default 0   -- 总余额
created_at / updated_at
```

#### `balance_transactions` — 账户流水（不可变账本）
```sql
id               uuid primary key
account_id       uuid references accounts(id)
event_id         uuid              -- 关联 usage_events.id
tx_type          text              -- freeze | charge | recharge | refund
amount           numeric(18,2)     -- 正数=增加，负数=扣减
balance_before   numeric(18,2)
balance_after    numeric(18,2)
status           text              -- frozen | completed | released
description      text
metadata         jsonb
created_at       timestamptz
```

**tx_type 说明：**
| tx_type | 说明 | amount 符号 |
|---------|------|------------|
| `recharge` | 用户充值 | + |
| `freeze` | 请求执行前冻结预算 | -（不改变总余额） |
| `charge` | 请求结算正式扣款 | - |
| `refund` | 退款/返款 | + |

#### `recharge_orders` — 充值订单表
```sql
id                    uuid primary key
account_id            uuid references accounts(id)
order_type            text default 'stripe'
amount_usd            numeric(18,2)        -- 实际支付金额
credited_amount_usd   numeric(18,2)        -- 到账金额（含bonus）
provider              text default 'stripe'
stripe_session_id     text unique
promo_code            text
status                text default 'pending'  -- pending | completed | failed
metadata              jsonb
created_at / updated_at
```

#### `topup_transactions` — 旧版充值记录（兼容）
```sql
id               uuid primary key
account_id       uuid references accounts(id)
provider         text default 'stripe'
stripe_session_id text unique
amount_usd       numeric(18,2)
status           text default 'completed'
metadata         jsonb
created_at
```

#### `usage_events` — API 调用记录
```sql
id           uuid primary key
account_id   uuid references accounts(id)
api_key_id   uuid references api_keys(id)
request_id   text
model        text
tokens_in    bigint default 0
tokens_out   bigint default 0
cost         numeric(18,8)   -- 估算费用
status       text
error_code   text
created_at   timestamptz
```

### 2.2 现有 API 端点

| 端点 | 方法 | 用途 |
|------|------|------|
| `/api/clawrouter/account` | GET | 获取账户信息+充值记录(topup_transactions) |
| `/api/clawrouter/topup/checkout` | POST | 创建 Stripe 充值 Checkout Session |
| `/api/clawrouter/checkout` | POST | 创建 Stripe 新购 Checkout Session |
| `/api/stripe/webhook` | POST | Stripe 回调（处理支付成功/失败） |
| `/api/usage/summary` | GET | 用量汇总+余额（可用/冻结） |
| `/api/usage/records` | GET | 消费记录（usage_events+balance_transactions） |
| `/api/usage/by-model` | GET | 按模型分组的用量统计 |

### 2.3 现有前端页面

| 页面 | 路径 | 现状 |
|------|------|------|
| Dashboard 主页 | `/clawrouter/dashboard` | 有余额卡片，但消费记录是假数据 |
| 充值页 | `/clawrouter/dashboard/add-credits` | 仅有 $5 档位，支持 Promo Code |
| 结账结果页 | `/clawrouter/checkout` | 付款后展示 API Key |

---

## 三、产品功能规范

### 3.1 账户余额模块

#### 3.1.1 账户余额卡片（Dashboard 首页）

**布局位置：** Dashboard 顶部第一个卡片组

**数据来源：** `GET /api/usage/summary`

**展示字段：**
| 字段 | 说明 | 计算逻辑 |
|------|------|----------|
| 可用余额 | 用户可支配余额 | `credit_balance_usd - frozenBalanceUsd` |
| 冻结余额 | 执行中请求占用的预算 | `balance_transactions` 中 `tx_type=freeze AND status=frozen` 的 sum |
| 账户总余额 | 账户总资产 | `accounts.credit_balance_usd` |

**UI 规范：**
- 三列布局（Mobile 单列）
- 可用余额大字高亮显示（主色）
- 冻结余额灰色标注（说明：包含执行中请求）
- 卡片背景渐变，区分于其他统计卡片

**边界状态：**
| 状态 | UI 展示 |
|------|---------|
| 余额 = 0 | 显示 "$0.00" + 引导充值按钮 |
| 余额 < $1 | 余额数字变橙色，显示预警 |
| 余额 < $0.1 | 余额数字变红色，显示"余额不足"警告 |
| 冻结金额 > 0 | 显示"约 X.XX 美元正在处理中" |

#### 3.1.2 余额预警系统

**触发规则：**
| 条件 | 动作 |
|------|------|
| 余额 < $1.00 | Dashboard 顶部显示警告横幅 |
| 余额 < $0.10 | 警告横幅 + 禁止创建新请求（API 层拦截） |
| 余额 = 0 | 全屏提示充值 |

**UI 组件：** `<BalanceAlert />` 横幅组件，可关闭

---

### 3.2 充值中心

#### 3.2.1 充值页面（重构 `/add-credits`）

**Preset 金额档位（扩展）：**
| 档位 | USD | 状态 | 说明 |
|------|-----|------|------|
| Starter | $5 | ✅ 当前 | 含 $10 上游额度 |
| Basic | $10 | 🔜 下个 Sprint | - |
| Pro | $20 | 🔜 下个 Sprint | - |
| Team | $50 | 🔜 下个 Sprint | - |
| Enterprise | $100 | 🔜 下个 Sprint | - |
| Custom | 自定义 | 📋 规划中 | - |

**每个档位的展示：**
- 美元金额（大字）
- 到账金额（含 Bonus 说明）
- 是否推荐（Recommended badge）
- 促销标签（如有 active promo）

** Promo Code 字段：**
- 输入框 + 验证按钮
- 验证成功：显示优惠说明（减免金额/赠送比例）
- 验证失败：显示错误提示
- 支持 Enter 快捷提交

**支付流程：**
```
选择金额 → (可选)输入PromoCode → 验证PromoCode → 点击支付 
→ 跳转 Stripe Checkout → 支付成功/失败回调 
→ 返回 Dashboard（带 topup=success 参数）→ 页面刷新显示新余额
```

**Stripe 商品信息（metadata）：**
```json
{
  "kind": "clawrouter_topup" | "clawrouter_access",
  "account_id": "uuid",
  "amount_usd": "10",
  "promo_code": "SAVE10",
  "delivery_mode": "managed_topup" | "inventory_key"
}
```

#### 3.2.2 充值记录表

**展示位置：** Dashboard 主页「交易记录」区域

**数据来源：** 
- 新系统：`GET /api/clawrouter/account` → `recharge_orders`
- 旧系统兼容：`topup_transactions`

**表格列：**
| 列名 | 说明 | 格式 |
|------|------|------|
| 时间 | 充值时间 | `YYYY-MM-DD HH:mm` |
| 类型 | 充值 / 消费 / 退款 | Badge 色标 |
| 金额 | 发生金额 | `$+10.00` / `$-0.0023` |
| 余额变化 | 交易后余额 | `$90.00` |
| 渠道 | Stripe / Promo | - |
| 状态 | Completed / Pending / Failed | Badge |
| 操作 | 查看详情 | Link |

**筛选器：**
- 时间范围：最近7天 / 30天 / 90天 / 自定义
- 类型：全部 / 充值 / 消费 / 退款 / 冻结

**分页：** 每页 20 条，支持加载更多（Infinite Scroll）

---

### 3.3 消费记录模块

#### 3.3.1 API 用量明细表

**数据来源：** `GET /api/usage/records`

**表格列：**
| 列名 | 说明 | 格式 |
|------|------|------|
| 时间 | 请求时间 | `YYYY-MM-DD HH:mm:ss` |
| Key | API Key 前缀 | `clr_xxxx...` |
| 模型 | 调用的模型 | `gpt-4o` |
| 输入 Tokens | 消耗 | 数字 + 着色 |
| 输出 Tokens | 消耗 | 数字 |
| 费用 | 本次扣费 | `$0.0023` |
| 状态 | 成功/失败 | Badge |

**筛选器：**
- 时间范围
- API Key（下拉选择用户的所有 Key）
- 模型
- 状态

**导出功能：**
- CSV 导出（最多 1000 条）
- 时间范围选择器

#### 3.3.2 用量汇总卡片（Dashboard 首页）

**数据来源：** `GET /api/usage/summary`

**展示字段：**
| 字段 | 说明 |
|------|------|
| 总请求数 | `totalRequests` |
| 总输入 Tokens | `totalTokensIn` |
| 总输出 Tokens | `totalTokensOut` |
| 总费用 | `totalCost` |
| 今日费用 | 当日 0点~现在的 cost sum |
| 平均费用/请求 | `totalCost / totalRequests` |

---

### 3.4 账户流水模块（核心）

#### 3.4.1 统一流水视图

**数据来源：** `GET /api/usage/records` → `balance_transactions`

**流水类型说明：**
| tx_type | 描述 | 金额方向 | 说明文字示例 |
|---------|------|---------|-------------|
| `recharge` | 充值 | + | Stripe 充值 |
| `charge` | 消费扣款 | - | API 请求消费 |
| `freeze` | 预算冻结 | - (不变余额) | 请求执行中 |
| `refund` | 退款 | + | 退款到账 |

**表格列：**
| 列名 | 说明 |
|------|------|
| 时间 | `created_at` |
| 类型 | recharge / charge / freeze / refund（带颜色） |
| 金额 | 正数绿色，负数红色 |
| 余额 | 交易后的 `balance_after` |
| 关联事件 | 链接到 usage_event（charge 时可点） |
| 描述 | 消费：模型+Key前缀；充值：渠道+Promo |

**状态说明：**
| status | 含义 | UI |
|--------|------|----|
| `frozen` | 冻结中（请求执行中） | 黄色 |
| `completed` | 已完成 | 绿色 |
| `released` | 已释放（freeze 被取消） | 灰色 |

---

### 3.5 管理后台（Admin视角）

#### 3.5.1 管理员账户管理

**路径：** `/admin/customers/[id]/balance`

**功能：**
- 查看用户余额（可用/冻结/总计）
- 手动调整余额（+充值/-扣减）
- 备注调整原因（必填）
- 查看该用户所有交易流水
- 冻结/解冻用户账户

**手动调整 API：**
```
POST /api/admin/customers/[id]/balance
Body: { "action": "credit" | "debit", "amount": 10, "reason": "补偿" }
```

---

## 四、API 规格

### 4.1 现有 API 扩展

#### `GET /api/clawrouter/account` 扩展

**Response 新增字段：**
```json
{
  "ok": true,
  "account": {
    "id": "uuid",
    "email": "user@example.com",
    "plan": "clawrouter",
    "billingStatus": "active",
    "creditBalanceUsd": 100.00,
    "frozenBalanceUsd": 0.05,
    "availableBalanceUsd": 99.95,
    "activeApiKeys": 2
  },
  "rechargeOrders": [
    {
      "id": "uuid",
      "amountUsd": 10.00,
      "creditedAmountUsd": 11.00,
      "promoCode": "SAVE10",
      "status": "completed",
      "createdAt": "2026-04-20T10:00:00Z"
    }
  ],
  "topups": [...]  // 旧系统兼容
}
```

#### `GET /api/usage/records` 扩展

**Query Parameters：**
| 参数 | 类型 | 说明 |
|------|------|------|
| `type` | `recharge` \| `charge` \| `refund` \| `freeze` \| `all` | 流水类型筛选 |
| `startDate` | ISO8601 | 开始时间 |
| `endDate` | ISO8601 | 结束时间 |
| `limit` | number | 默认 50，最大 200 |
| `offset` | number | 分页偏移 |

**Response：**
```json
{
  "ok": true,
  "transactions": [
    {
      "id": "uuid",
      "txType": "charge",
      "amount": -0.0023,
      "balanceBefore": 99.95,
      "balanceAfter": 99.9477,
      "status": "completed",
      "description": "gpt-4o @ clr_ax2k",
      "eventId": "uuid",
      "createdAt": "2026-04-20T11:00:00Z"
    }
  ],
  "usageEvents": [...],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "totalTransactions": 128,
    "totalEvents": 342
  }
}
```

### 4.2 新增 API

#### `GET /api/recharges` — 充值订单列表

**Response：**
```json
{
  "ok": true,
  "orders": [
    {
      "id": "uuid",
      "amountUsd": 10.00,
      "creditedAmountUsd": 11.00,
      "promoCode": "SAVE10",
      "provider": "stripe",
      "stripeSessionId": "cs_xxx",
      "status": "completed",
      "createdAt": "2026-04-20T10:00:00Z"
    }
  ],
  "pagination": { "limit": 20, "offset": 0, "total": 5 }
}
```

#### `POST /api/admin/customers/[id]/balance` — 管理员调整余额

**Request：**
```json
{
  "action": "credit",
  "amount": 50.00,
  "reason": "客服补偿"
}
```

**Response：**
```json
{
  "ok": true,
  "newBalance": 149.95,
  "transactionId": "uuid"
}
```

---

## 五、前端组件清单

### 5.1 新增组件

| 组件名 | 路径 | 说明 |
|--------|------|------|
| `<BalanceCard />` | `components/balance/BalanceCard.tsx` | 余额展示主卡片 |
| `<BalanceAlert />` | `components/balance/BalanceAlert.tsx` | 余额预警横幅 |
| `<TransactionTable />` | `components/balance/TransactionTable.tsx` | 统一流水表格 |
| `<TransactionFilters />` | `components/balance/TransactionFilters.tsx` | 流水筛选器 |
| `<RechargePresetCard />` | `components/recharge/RechargePresetCard.tsx` | 充值档位卡片 |
| `<RechargeForm />` | `components/recharge/RechargeForm.tsx` | 充值表单（含 Promo） |
| `<UsageTable />` | `components/usage/UsageTable.tsx` | API 用量明细表 |
| `<UsageChart />` | `components/usage/UsageChart.tsx` | 用量趋势图表 |
| `<AdminBalanceAdjust />` | `components/admin/AdminBalanceAdjust.tsx` | 管理员调余额表单 |

### 5.2 页面改造清单

| 页面 | 改造内容 |
|------|---------|
| `/clawrouter/dashboard` | 替换占位消费记录为真实数据，添加余额卡片 |
| `/clawrouter/dashboard/add-credits` | 扩展多档位，展示 Promo Code 验证 |
| `/clawrouter/dashboard/transactions` | 新建：独立交易流水页（全部类型筛选） |
| `/clawrouter/dashboard/usage` | 已有页面，增强筛选和导出功能 |
| `/admin/customers/[id]/balance` | 新建：管理员余额管理页 |

---

## 六、技术实现要点

### 6.1 余额计算逻辑

```
可用余额 = accounts.credit_balance_usd 
         - SUM(balance_transactions WHERE tx_type='freeze' AND status='frozen').amount

注意：freeze 类型的 amount 为负数但不影响总余额，仅表示"占用"
```

### 6.2 freeze/charge 流程

```
请求进入 
  → freezeBalance() 冻结预算（新建 freeze 记录，status=frozen）
  → 请求完成 
      → 成功：chargeBalance() 扣款（新建 charge 记录，释放 freeze）
      → 失败：释放 freeze（status → released，不扣款）
```

### 6.3 幂等性设计

| 操作 | 幂等Key | 实现方式 |
|------|---------|---------|
| 充值 | `stripe_session_id` | recharge_orders 表 unique 约束 |
| 充值记账 | `recharge:{stripe_session_id}` | balance_transactions.metadata 存储 |
| 扣费 | `usage_event.id` | event_id 关联，同一 event 不会重复扣 |

### 6.4 Webhook 处理

Stripe Webhook `checkout.session.completed` 处理顺序：
1. `settleTopupCheckoutSession()` — 写入 topup_transactions（旧系统）
2. `addRechargeBalance()` — 写入 recharge_orders + balance_transactions（新系统）
3. `ensureManagedKeyDelivery()` — 发放库存 Key（如需要）
4. `sendClawLiteApiKeyEmail()` — 发送 Key 邮件

---

## 七、UI/UX 设计方向

### 7.1 设计语言

- **风格：** 与现有 ClawRouter Dashboard 一致（Warm Stone 色系）
- **卡片圆角：** `rounded-[24px]`
- **主色调：** Stone-900
- **强调色：** 
  - 充值/退款：Emerald/Sea 绿
  - 消费扣款：Stone 灰
  - 冻结：Amber 黄
  - 预警：Red 橙

### 7.2 响应式策略

- Mobile（< 768px）：单列布局，表格变卡片列表
- Tablet（768-1024px）：双列
- Desktop（> 1024px）：多列网格

### 7.3 加载状态

- 余额卡片：Skeleton Loader
- 流水表格：分页骨架屏 + 加载指示器
- 充值按钮：Loading spinner + "Opening Stripe..."

### 7.4 空状态

| 场景 | 文案 |
|------|------|
| 无充值记录 | "还没有充值记录" + 引导充值按钮 |
| 无消费记录 | "API 请求记录将显示在这里" |
| 无流水 | "账户流水将从第一笔交易开始记录" |

---

## 八、里程碑

| Phase | 内容 | 优先级 |
|-------|------|--------|
| **Phase 1** | 余额可视化（BalanceCard + 可用/冻结/总计） | P0 |
| **Phase 1** | 消费记录（usage_events 真实数据） | P0 |
| **Phase 1** | 充值页面多档位支持 | P0 |
| **Phase 2** | 统一流水视图（recharge/charge/refund/freeze） | P1 |
| **Phase 2** | Promo Code 验证增强 | P1 |
| **Phase 2** | 余额预警横幅 | P1 |
| **Phase 3** | 交易记录导出 CSV | P2 |
| **Phase 3** | 管理后台余额调整 | P2 |
| **Phase 3** | 用量趋势图表 | P2 |

---

## 九、依赖项

| 依赖 | 说明 |
|------|------|
| Stripe 账户 + API Key | 已配置 |
| Supabase 数据库 | 已配置 |
| `balance.ts` | 余额操作库（freeze/charge/refund） |
| `clawrouter-topups.ts` | 充值逻辑 |
| `stripe-rest.ts` | Stripe API 调用 |

---

## 十、风险与挑战

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Webhook 延迟导致余额更新慢 | 用户充值后余额不即时更新 | 页面引导刷新 + 乐观 UI |
| freeze 但不 charge（请求失败） | 余额冻结不释放 | 后台 Job 定时清理超时 freeze（> 30min） |
| 旧系统 `topup_transactions` 和新系统 `recharge_orders` 并存 | 数据不一致 | Webhook 同时写入两个表，API 层合并返回 |
| 多币种支持（未来） | 目前仅支持 USD | 设计时考虑 amount 类型为 numeric(18,2) |

---

## 附录

### A. 账务术语对照

| 业务术语 | 技术字段 |
|---------|---------|
| 充值 | `balance_transactions.tx_type='recharge'` |
| 消费 | `balance_transactions.tx_type='charge'` |
| 冻结 | `balance_transactions.tx_type='freeze'` |
| 退款 | `balance_transactions.tx_type='refund'` |
| 返利 | `recharge_orders.credited_amount_usd > amount_usd` |

### B. 相关文档

- [ClawRouter Architecture](./ARCHITECTURE.md)
- [ClawRouter Web API](./ARCHITECTURE-WEB.md)
- Stripe Dashboard: https://dashboard.stripe.com
