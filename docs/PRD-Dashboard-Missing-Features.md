# ClawRouter Dashboard PRD - 待实现功能

> 版本：v1.0
> 日期：2026-04-24
> 状态：草稿

---

## 一、功能现状总览

| 功能 | 状态 | 路径 |
|------|------|------|
| Dashboard（概览） | ✅ 已完成 | /clawrouter/dashboard |
| API Keys | ❌ 待实现 | href=null |
| Quick Start | ❌ 待实现 | href=null |
| Models | ❌ 待实现 | href=null |
| Usage | ✅ 已完成 | /dashboard/usage |
| Transactions | ✅ 已完成 | /clawrouter/dashboard/transactions |
| Add Credits | ✅ 已完成 | /clawrouter/dashboard/add-credits |
| Affiliate | ❌ 待实现 | href=null |
| Profile | ❌ 待实现 | href=null |

---

## 二、API Keys（密钥管理页面）

### 2.1 背景与目标
当前 `/clawrouter/dashboard` 首页只有单个 API Key 的展示，没有独立的密钥管理页面。用户需要一个专门的页面来管理多个 API Key。

### 2.2 功能需求

**页面路径**：`/clawrouter/dashboard/api-keys`

**功能列表**：
- 列出当前账户下所有 API Key（id、名称、前缀、状态、创建时间、最后使用时间）
- 创建新的 API Key
- 展示/隐藏/复制单个密钥（调用 `/api/clawrouter/keys/[keyId]/reveal`）
- 撤销（revoke）已有 Key
- 删除已有 Key
- 区分 active / revoked / inactive 状态

**API 依赖**：
- `GET /api/clawrouter/keys` — 列出所有 key
- `POST /api/clawrouter/keys` — 创建新 key
- `GET /api/clawrouter/keys/[keyId]/reveal` — 获取明文（已有）
- `DELETE /api/clawrouter/keys/[keyId]` — 删除 key（需新增）
- `PATCH /api/clawrouter/keys/[keyId]` — 修改 key 状态（revoke/activate）（需新增）

**国际化**：所有 UI 文字使用 `content.downloads.apiKey` 或 `content.dashboard.apiKeys` 中的字段

**多语言**：需在 `content.ts` 的 dashboard 中添加 apiKeys 相关的翻译

---

## 三、Quick Start（快速上手）

### 3.1 背景与目标
新用户首次登录后需要一个引导流程，帮助他们快速了解如何使用 ClawLite。包括配置步骤和下一步推荐操作。

### 3.2 功能需求

**页面路径**：`/clawrouter/dashboard/quick-start`

**功能列表**：
- 分步骤展示上手流程（至少 4 步）：
  1. 下载安装程序（跳转 /downloads）
  2. 配置 API Key（跳转 /clawrouter/dashboard/api-keys）
  3. 选择并配置 Channel（如 Telegram）
  4. 发送第一条消息
- 每个步骤包含：标题、描述、可操作按钮
- 完成状态追踪（已完成步骤标记 ✓）
- 进度条显示整体完成度

**UI 要求**：
- 垂直步骤列表，左侧有连接线
- 已完成步骤高亮显示
- 未完成步骤显示为灰色

---

## 四、Models（可用模型列表）

### 4.1 背景与目标
用户需要一个清晰的页面来了解当前 ClawLite 支持哪些 AI 模型、各模型的定价和可用配额。

### 4.2 功能需求

**页面路径**：`/clawrouter/dashboard/models`

**功能列表**：
- 展示所有可用 AI 模型（名称、提供商、价格）
- 展示用户当前账户对各模型的访问权限（entitlements）
- 按提供商分组展示（OpenAI、Anthropic、MiniMax 等）
- 区分可用/不可用/即将上线状态
- 模型详情（上下文窗口、输入输出价格、速率限制）

**数据来源**：
- entitlements 表：当前用户各模型的访问权限
- entitlements 表的 model_allowlist 字段
- 可能需要新的 API：`GET /api/clawrouter/models`

**国际化**：模型名称使用官方名称，描述文字从 content.ts 读取

---

## 五、Usage（用量统计）

### 5.1 背景与目标
用户需要详细了解自己的 API 使用情况，包括请求次数、Token 消耗和费用。

**状态**：✅ 已完成，路径 `/dashboard/usage`

**备注**：该页面位于 `/dashboard/usage` 而非 `/clawrouter/dashboard/usage`，后续应统一路径或做重定向。

---

## 六、Transactions（交易记录）

### 6.1 背景与目标
用户需要查看账户的所有资金变动记录，包括充值、消费和退款。

**状态**：✅ 已完成，路径 `/clawrouter/dashboard/transactions`

---

## 七、Affiliate（推荐计划）

### 7.1 背景与目标
ClawLite 提供推荐奖励计划，用户可以通过推荐新用户获得积分奖励。该页面展示推荐情况和佣金收益。

### 7.2 功能需求

**页面路径**：`/clawrouter/dashboard/affiliate`

**功能列表**：
- 展示用户的专属推荐链接/推荐码
- 展示推荐统计（推荐人数、成功转化人数）
- 展示预估收益/已支付佣金
- 推荐排行榜（Top 推荐人）
- 一键复制推荐链接
- 推广素材下载（Banner 等）

**数据需求**：
- 推荐人关系存储（可能在 accounts 表或独立表）
- 佣金计算逻辑
- API：`GET /api/clawrouter/affiliate`（需新增）
- API：`POST /api/clawrouter/affiliate/claim`（领取佣金）（需新增）

**UI 组件**：
- 推荐链接卡片（带复制按钮）
- 统计数字展示（推荐数、收益）
- 佣金列表/历史记录

---

## 八、Profile（账户设置）

### 8.1 背景与目标
用户需要一个页面管理自己的账户信息、通知设置和安全设置。

### 8.2 功能需求

**页面路径**：`/clawrouter/dashboard/profile`

**功能列表**：
- 基本信息（邮箱、账户 ID、注册时间）
- 修改显示名称
- 修改密码（如果使用邮箱登录）
- 通知偏好设置（邮件通知、推送通知）
- API Key 管理（跳转 /clawrouter/dashboard/api-keys）
- 账户安全（登录历史、设备管理）
- 删除账户（危险操作，需二次确认）
- 退出登录

**API 依赖**：
- `GET /api/clawrouter/account` — 获取账户信息（已有）
- `PATCH /api/clawrouter/account` — 更新账户信息（需新增）
- `GET /api/clawrouter/account/notifications` — 获取通知设置
- `PATCH /api/clawrouter/account/notifications` — 更新通知设置

---

## 九、实施优先级

| 优先级 | 功能 | 原因 |
|--------|------|------|
| P0 | API Keys | 高频核心功能，用户主要痛点 |
| P1 | Models | 用户必须了解可用模型才能使用 |
| P1 | Quick Start | 提升新用户转化率 |
| P2 | Affiliate | 商业增长驱动力 |
| P2 | Profile | 账户管理基础功能 |

---

## 十、技术注意事项

- 所有页面使用 `LangProvider` + `useLang()` 获取当前语言
- 所有 UI 文字从 `getContentForLang(lang)` 获取，支持 en/zh/es/ja/ko 五种语言
- 新增 API 端点需要在 `src/app/api/clawrouter/` 下创建
- 数据库 schema 参考：`supabase/migrations/20260404_create_clawrouter_access_tables.sql`
- 遵循现有组件样式（Tailwind + 设计系统）
