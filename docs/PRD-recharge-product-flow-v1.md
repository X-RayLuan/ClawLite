# ClawLite 产品流程优化 PRD

**文档版本：** v1.0
**日期：** 2026-04-21
**状态：** 草案

---

## 1. 背景与目标

### 1.1 现状描述

当前 ClawLite 产品流程如下：

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | 用户支付 $5 | 购买"inventory access" |
| 2 | Stripe webhook 触发 | `kind: "clawrouter_access"` |
| 3 | 系统分配 ezrounter key | 从 inventory_keys 库存池分配 |
| 4 | 用户收到 API key | 通过邮件发送 |
| 5 | 安装器配置 | 用户在安装器中输入 API key |

**关键问题：**
- 充值金额 ($5) 与实际价值 ($10 credited) 不匹配，用户理解成本高
- 流程绕过了账户余额体系，inventory key 和账户余额是两个独立系统
- 安装器需要手动输入 API key，流程繁琐
- 没有充分利用 ClawRouter 账户余额系统

### 1.2 目标

统一产品流程到**账户余额体系**，简化用户体验：

1. **充值即充值**：用户充值多少，账户余额增加多少（不再有 double bonus 逻辑）
2. **安装器自动化**：安装器可获取账户关联的 API key，无需用户手动输入
3. **统一 key 管理**：所有 key（managed key / inventory key）统一通过 `account_key_deliveries` 管理
4. **定价标准化**：支持 $5 / $10 / $20 / $50 / $100 快速选择

---

## 2. 核心概念定义

### 2.1 账户余额系统 (Credit Balance)

- **账户** (`accounts` 表)：用户主账户，包含 `credit_balance_usd` 字段
- **充值订单** (`recharge_orders` 表)：记录每次充值，含实际金额和赠送金额
- **余额变动记录** (`balance_transactions` 表)：每笔余额变动的流水

### 2.2 Key 交付系统 (Key Delivery)

两种 delivery mode：

| 类型 | 说明 | 来源 |
|------|------|------|
| `managed_key` | 账户下自动创建的 API key | 系统自动创建 |
| `inventory_key` | 从库存池分配的第三方 key | 人工/批量采购入库 |

### 2.3 Stripe 定价

| 价格 | Price ID | 用途 |
|------|----------|------|
| $5 | `price_1TOIkpLnt527OBZb4upTT9X2` | 可能保留（小额试用） |
| $10 | `price_1TOIkpLnt527OBZb4upTT9X2` | ⚠️ 与 $5 相同，需确认正确 ID |
| $20 | `price_1TOIlsLnt527OBZbSRb1ZhbT` | 标准充值 |
| $50 | `price_1TOIpTLnt527OBZbAxPozkF5` | 大额充值 |
| $100 | `price_1TOIpyLnt527OBZbk3oeb51n` | 高级充值 |

---

## 3. 新产品流程

### 3.1 充值流程（用户视角）

```
用户选择充值金额 ($10/$20/$50/$100)
    ↓
跳转 Stripe Checkout
    ↓
支付完成
    ↓
Stripe webhook 触发
    ↓
账户余额增加（等于实际支付金额）
    ↓
用户收到充值成功通知
    ↓
安装器自动获取账户 API key（或用户可在 dashboard 查看 key）
```

### 3.2 安装器激活流程（优化后）

```
安装器启动 → 环境检测
    ↓
账户连接（扫描 QR code 或输入 setup token）
    ↓
系统返回账户 API key → 安装器自动写入配置
    ↓
启动 gateway
    ↓
完成
```

---

## 4. 技术改动清单

### 4.1 前端改动

#### A. 充值页面 (`/clawrouter/dashboard/add-credits`)

**现状：** 所有金额按钮中只有 $5 可用，其他显示 "Coming soon"

**改动：**
1. 所有金额按钮启用（$5 / $10 / $20 / $50 / $100）
2. 每个金额对应正确的 Stripe Price ID
3. 移除 promo code 后的金额 double bonus 显示（原本 $5 付完变 $10）

**代码位置：**
```
ClawLite/src/app/clawrouter/dashboard/add-credits/page.tsx
```

**改动点：**
- `PRICE_IDS` 常量：各金额对应的 Price ID
- 前端发送 `priceId` 到后端
- 金额按钮不再有 `enabled: false` 状态

#### B. 账户余额展示

在 dashboard 中展示：
- 当前余额
- 充值记录
- Key 列表

#### C. 安装器引导优化

安装器需要支持：
- 扫描 QR code 连接账户（vs 手动输入 API key）
- 自动获取账户关联的 managed key
- 写入配置并启动

### 4.2 后端改动

#### A. Stripe Checkout API (`/api/clawrouter/topup/checkout`)

**现状：** 使用 inline `price_data` 动态创建 price

**改动：** 优先使用预创建 Price ID

```typescript
// 优先使用 price_id（预创建的 Stripe price）
if (priceId) {
  lineItems["line_items[0][price]"] = priceId;
} else {
  // 回退到动态创建（向后兼容）
  lineItems["line_items[0][price_data][unit_amount]"] = String(Math.round(amount * 100));
}
```

#### B. Stripe Webhook (`/api/stripe/webhook`)

**现状：** `kind: "clawrouter_access"` 时有 special double bonus 逻辑

**改动：**
1. 移除 `clawrouter_access` 的 special bonus 逻辑
2. 所有充值统一走 `clawrouter_topup` 流程
3. 金额直接 credited 到账户余额（`addRechargeBalance`）

**改动前后对比：**

| 场景 | 现状 | 改动后 |
|------|------|--------|
| $5 充值 | credited $10（double） | credited $5 |
| $5 充值 | 从库存池分配 inventory key | 不分配 key（用户已有账户余额） |
| $10/20/50/100 充值 | 充值到余额 | 充值到余额（无变化） |

#### C. 移除 inventory key 分配逻辑

`assignInventoryKeyToAccount` 函数在 `$5 access purchase` 场景下的调用需要移除或重估。

**原因：**
- 新流程中，用户充值直接获得余额，不需要额外分配 key
- inventory key 分配逻辑应仅用于特殊的"赠送 key"场景

### 4.3 数据库改动

暂无新表结构改动。现有表结构支持新流程：

- `accounts.credit_balance_usd` - 账户余额 ✅
- `recharge_orders` - 充值订单 ✅
- `balance_transactions` - 余额流水 ✅
- `account_key_deliveries` - Key 交付记录 ✅
- `api_keys` - API keys ✅

---

## 5. 改动优先级

### Phase 1：充值页面（本次改动范围）

| 优先级 | 改动项 | 状态 |
|--------|--------|------|
| P0 | 前端启用 $10/$20/$50/$100 按钮 | ✅ 已完成 |
| P0 | 后端支持 priceId 参数 | ✅ 已完成 |
| P1 | 确认 $10 Price ID（当前与 $5 相同） | ⏳ 待确认 |

### Phase 2：Webhook 逻辑调整

| 优先级 | 改动项 | 状态 |
|--------|--------|------|
| P1 | 统一 `clawrouter_topup` 处理逻辑 | ⏳ 待开发 |
| P1 | 移除 `clawrouter_access` 的 special bonus | ⏳ 待开发 |
| P2 | 移除 inventory key 分配（$5 场景） | ⏳ 待评估 |

### Phase 3：安装器优化

| 优先级 | 改动项 | 状态 |
|--------|--------|------|
| P2 | 安装器自动获取账户 key | ⏳ 待开发 |
| P2 | QR code 账户连接 | ⏳ 待开发 |

---

## 6. 用户体验变化

### 6.1 充值流程

**Before：**
- 只有 $5 可选（显示 "Coming soon" 在其他金额）
- $5 支付后获得 $10 余额 + 一个 inventory key

**After：**
- $5/$10/$20/$50/$100 都可以选
- 充值多少，余额增加多少
- 用户收到充值成功通知

### 6.2 安装器激活

**Before：**
1. 用户在安装器中选择 "Connect to ClawRouter"
2. 跳转网页完成 $5 购买
3. 等待邮件收到 API key
4. 回到安装器手动输入 API key
5. 完成配置

**After：**
1. 用户在安装器中选择 "Connect to ClawRouter"
2. 扫描 QR code 授权账户
3. 安装器自动获取 API key 并写入配置
4. 完成（无需手动输入 key）

---

## 7. 风险与注意事项

### 7.1 Price ID 确认

⚠️ **重要**：当前 $10 的 Price ID 与 $5 相同（`price_1TOIkpLnt527OBZb4upTT9X2`），需要确认：
- 是否 Stripe 后台配置错误？
- 还是故意让 $5/$10 共用同一个 price？

### 7.2 向后兼容

- 已有的 `$5 purchase + inventory key` 流程需要保持兼容
- 已有账户的 inventory key 不受影响

### 7.3 余额 vs Key

- 账户余额用于支付 API 请求费用
- API key 用于身份认证
- 两个概念独立但关联

---

## 8. 测试要点

1. ✅ 各金额 ($5/$10/$20/$50/$100) Stripe Checkout 创建成功
2. ✅ Stripe webhook 触发后余额正确增加
3. ✅ 余额变动记录 (`balance_transactions`) 正确
4. ✅ 充值订单 (`recharge_orders`) 正确创建
5. ✅ 邮件通知正确发送
6. ✅ 重复支付（同一 stripe session）不会重复充值
7. ✅ 安装器能正确获取账户关联的 key

---

## 9. 附录：现有代码文件

| 文件 | 说明 |
|------|------|
| `ClawLite/src/app/clawrouter/dashboard/add-credits/page.tsx` | 充值页面（已修改） |
| `ClawLite/src/app/api/clawrouter/topup/checkout/route.ts` | Checkout API（已修改） |
| `ClawLite/src/app/api/stripe/webhook/route.ts` | Stripe Webhook |
| `ClawLite/src/lib/recharge.ts` | 余额充值逻辑 |
| `ClawLite/src/lib/clawrouter-delivery.ts` | Key 交付逻辑 |
| `ClawLite/src/lib/clawrouter-keys.ts` | API Key 管理 |
| `ClawLite/src/lib/clawrouter-checkout.ts` | Checkout Session 管理 |

---

## 10. 需要检查和修改的位置清单

以下位置包含与 "$5 充值" 或 "inventory access" 相关的产品描述和逻辑，需要逐一检查和修改。

### 10.1 ClawLite 网站端

#### A. `/clawrouter/dashboard/add-credits` 页面
- **文件**: `ClawLite/src/app/clawrouter/dashboard/add-credits/page.tsx`
- **当前状态**: ✅ 已修改 - 启用所有金额按钮
- **需检查内容**: 
  - "$5" 按钮的 "Best" 标签是否还合适
  - UI 文案是否有 "5=10" 或类似暗示

#### B. Checkout API - 产品描述
- **文件**: `ClawLite/src/app/api/clawrouter/topup/checkout/route.ts`
- **行号**: 第 53-60 行
- **当前内容**:
  ```typescript
  "line_items[0][price_data][product_data][name]": isInventoryAccessPurchase
    ? "ClawRouter Access – Inventory Key"
    : `ClawRouter Credits – $${amount}`,
  "line_items[0][price_data][product_data][description]": isInventoryAccessPurchase
    ? "Purchase one inventory API key with $10 upstream value."
    : promoCode
      ? `Promo code entered: ${promoCode}`
      : "Top up your ClawRouter account balance.",
  ```
- **问题**: `isInventoryAccessPurchase` 判断逻辑是 `amount === 5`，但现在 $5 不再有特殊待遇
- **建议**: 移除 `isInventoryAccessPurchase` 分支，统一使用 `clawrouter_topup` 描述

#### C. Installer Activation Purchase API
- **文件**: `ClawLite/src/app/api/installer/activation/purchase/route.ts`
- **行号**: 第 46 行
- **当前内容**:
  ```typescript
  "metadata[delivery_mode]": "inventory_key",
  ```
- **说明**: 购买完成后 delivery_mode 为 inventory_key，意味着分配 inventory key
- **问题**: 如果不再需要分配 inventory key，需要修改此处逻辑

#### D. Installer Activation Provision API
- **文件**: `ClawLite/src/app/api/installer/activation/provision/route.ts`
- **行号**: 第 49-83 行
- **当前逻辑**:
  - 优先查找 `inventory_key` delivery mode 的 key
  - 如果没有 inventory key，回退到 managed key
  - 如果用户未付费，阻塞 provisioning
- **问题**: 
  - `kind === "clawrouter_access"` 判断已过时（现在没有 $5 double bonus）
  - inventory key 分配逻辑需要重新评估

#### E. Installer Activation Inject Config API
- **文件**: `ClawLite/src/app/api/installer/activation/inject-config/route.ts`
- **行号**: 第 41-51 行
- **当前逻辑**: 优先使用 `inventory_key`，其次 `managed_key`
- **问题**: 同上，inventory key 优先逻辑需要重新评估

#### F. Stripe Webhook Handler
- **文件**: `ClawLite/src/app/api/stripe/webhook/route.ts`
- **行号**: 第 95-160 行 (`checkout.session.completed` → `kind === "clawrouter_access"`)
- **当前逻辑**:
  1. `creditedAmountUsd = paidAmountUsd === 5 ? 10 : paidAmountUsd` → ✅ 已移除
  2. 调用 `settleTopupCheckoutSession` 充值余额
  3. 调用 `assignInventoryKeyToAccount` 分配 inventory key
  4. 调用 `ensureClawRouterApiKey` 创建 managed key
  5. 发送邮件
- **问题**: 
  - `assignInventoryKeyToAccount` 在新流程中可能不再需要
  - inventory key 库存可能已售罄

#### G. clawrouter-topups.ts - reconcile 逻辑
- **文件**: `ClawLite/src/lib/clawrouter-topups.ts`
- **行号**: 第 144 行
- **当前逻辑**:
  ```typescript
  const amountUsd = session?.metadata?.kind === "clawrouter_access" && paidAmountUsd === 5 ? 10 : paidAmountUsd;
  ```
- **状态**: ✅ 已移除 double bonus 逻辑

#### H. Checkout Session 详情页
- **文件**: `ClawLite/src/app/clawrouter/checkout/page.tsx`
- **说明**: 显示 checkout session 状态，需检查是否有 "$5 得 $10" 相关文案
- **需检查内容**: 页面中所有涉及金额的描述

#### I. Pricing 页面
- **文件**: `ClawLite/src/app/pricing/page.tsx`
- **当前状态**: ✅ 无 $5 相关内容（只有 $0 / Usage-based / $500）

### 10.2 ClawLite-Installer 安装器端

#### A. API Key 引导步骤
- **文件**: `ClawLite-Installer/src/renderer/src/steps/ApiKeyGuideStep.tsx`
- **说明**: 用户在此步骤输入 API key 或选择 Provider
- **当前流程**: 用户手动输入第三方 API key（如 Google/OpenAI/Anthropic）
- **问题**: 如果要支持"连接 ClawRouter 账户并自动获取 key"，需要新增选项

#### B. 安装器 Activation 流程
- **文件**: `ClawLite-Installer/src/main/services/onboarder.ts`
- **说明**: 处理 provider 选择、API key 写入、配置文件生成
- **相关逻辑**:
  - Provider 选择（Google/OpenAI/Anthropic/MiniMax/GLM）
  - Telegram bot 配置
  - OpenClaw 配置写入
- **问题**: 
  - 当前不支持 "clawrouter" 作为 provider
  - 没有自动从账户获取 managed key 的逻辑

#### C. 安装器与官网 activation API 交互
- **文件**: `ClawLite-Installer/src/main/ipc-handlers.ts`
- **说明**: 安装器通过 IPC 调用 `onboard.run()` 等
- **相关路径**: `onboard.run` → `onboarder.ts`

### 10.3 需要确认的产品决策

1. **Inventory Key 是否还保留？**
   - 如果保留，什么场景下分配？
   - 如果不保留，移除所有 `assignInventoryKeyToAccount` 调用

2. **$5 充值是否还存在？**
   - 如果存在，$5 的用途是什么？（小额试用？试用后引导大额充值？）
   - 如果不存在，移除 $5 价格按钮

3. **安装器 activation 流程**
   - 是否需要支持"扫码连接 ClawRouter 账户"？
   - 还是保持当前手动输入 API key 的方式？

---

## 11. 修改优先级建议

| 优先级 | 文件 | 改动内容 |
|--------|------|----------|
| P0 | `topup/checkout/route.ts` | 移除 `isInventoryAccessPurchase` 分支，统一描述 |
| P0 | `stripe/webhook/route.ts` | 移除 `assignInventoryKeyToAccount` 调用（或条件化） |
| P1 | `add-credits/page.tsx` | UI 文案检查，确保无 "5=10" 暗示 |
| P1 | `installer/activation/purchase/route.ts` | delivery_mode 改为 managed_topup |
| P2 | `installer/activation/provision/route.ts` | inventory_key 优先逻辑移除 |
| P2 | `installer/activation/inject-config/route.ts` | 同上 |
| P2 | 安装器新增 | 支持 clawrouter provider 和自动 key 获取 |