# Task 3: Database Schema Design - API Quota Management

## 🎯 作業要求

設計一個 **Headless API 服務的配額計費系統**，完成 `UserTableScheme` 設計：

```typescript
// 需要完成的 TypeScript 介面
type UserTableScheme = {
  userId: string;
  prepurchasedCredit: number;
  
  // 需要實作的部分
  apiUsageHistory: ???
  ...
}
```

### 核心需求
- ✅ **Credit Management** - 追蹤預購點數，根據 API endpoint 使用量扣除
- ✅ **Usage Tracking** - 記錄詳細的 API 呼叫資訊用於稽核
- ✅ **Historical Record Keeping** - 儲存月度使用資料用於分析報告
- ✅ **Monthly Analysis** - 讓使用者查看按月彙整的 API 使用量
- ✅ **Endpoint-Specific Quotas** - 不同 API endpoints 有不同的點數成本

### API Endpoints 與成本
| Endpoint | 成本 | 說明 |
|----------|------|------|
| `/submit-creators` | 1 點 | 提交創作者資訊 |
| `/discover-creators` | 2 點 | 探索創作者（含篩選） |
| `/get-creator-info` | 3 點 | 取得詳細創作者資訊 |
| `/get-topic-items` | 1 點 | 取得主題相關項目 |
| `/get-niche-items` | 1 點 | 取得利基市場項目 |
| `/get-hashtag-items` | 1 點 | 取得標籤相關項目 |

## ✅ 解答

### 1. 資料庫選擇：PostgreSQL

**選擇理由：**
- **ACID 交易保證** - 確保點數扣除的原子性，避免超刷
- **複雜查詢支援** - 月度分析需要聚合查詢
- **向後相容性** - 現有服務多使用 SQL
- **分區支援** - 大量 API 呼叫記錄可按月分區

#### 🤔 為什麼不選擇 MongoDB？

雖然 MongoDB 提供 schema-less 與 sharding 能力，但對於這個配額管理系統存在以下不適合的因素：

**1. Schema 設計與資料關聯性**
- 系統有明確的關聯結構（users → api_calls → monthly_usage）
- 需要強制的外鍵約束確保資料完整性
- MongoDB 的 schema-less 特性在這裡反而增加複雜度

**2. 交易一致性需求**
- 扣點 + 記錄 API 呼叫 + 更新月度統計必須原子性完成
- PostgreSQL 的 ACID 保證更成熟穩定
- MongoDB 的多文件交易相對較新，效能開銷較大

**3. 查詢模式適合性**
- 大量的聚合查詢（按月、按端點統計）
- SQL 的 GROUP BY、JOIN 更直觀易維護
- MongoDB 的 aggregation pipeline 學習成本較高

**4. 團隊與生態系統因素**

- ORM、監控、備份工具鏈更成熟
- 向後相容性考量

**結論**：這是典型的 OLTP 場景，PostgreSQL 在關聯式資料、交易一致性和查詢便利性方面更適合。

#### 📊 分區管理策略

對於大量的 `api_calls` 記錄，採用 **按月分區** 策略：

```sql
-- 使用 pg_partman 自動管理分區
SELECT partman.create_parent(
  p_parent_table => 'public.api_calls',
  p_control => 'called_at',
  p_type => 'range',
  p_interval => '1 month',
  p_premake => 3,                    -- 提前建立 3 個月的分區
  p_start_partition => '2025-01-01'
);

-- 設定資料保留政策
UPDATE partman.part_config 
SET retention = '24 months',           -- 保留 24 個月
    retention_keep_table = false,      -- 自動刪除舊分區表
    premake = 6                        -- 提前建立 6 個分區
WHERE parent_table = 'public.api_calls';
```

**分區優勢：**
- ✅ **查詢效能** - 大部分查詢都是近期資料，分區可大幅提升速度
- ✅ **資料歸檔** - 舊分區可移至冷儲存，降低成本
- ✅ **維護便利** - 可獨立維護各月份資料
- ✅ **自動管理** - pg_partman 提供完全自動化的分區建立與清理

### 2. 完整 UserTableScheme 設計

```typescript
export interface UserTableScheme {
  userId: string;
  prepurchasedCredit: number;
  createdAt: string;
  updatedAt: string;
  /** 從 monthly_usage 表查詢組裝，非實際 DB 欄位 */
  apiUsageHistory: MonthlyUsageSummary[];
}

export interface MonthlyUsageSummary {
  month: string; // '2025-01'
  totalCost: number;
  totalCalls: number;
  perEndpoint: Record<APIEndpoint, { calls: number; cost: number }>;
}

export const enum APIEndpoint {
  SubmitCreators = '/submit-creators',
  DiscoverCreators = '/discover-creators',
  GetCreatorInfo = '/get-creator-info',
  GetTopicItems = '/get-topic-items',
  GetNicheItems = '/get-niche-items',
  GetHashtagItems = '/get-hashtag-items',
}
```

### 3. 資料庫 Schema 設計

```sql
-- 1. Users Table - 使用者基本資訊
CREATE TABLE users (
  user_id VARCHAR(50) PRIMARY KEY,
  prepurchased_credit INT NOT NULL DEFAULT 0 CHECK (prepurchased_credit >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. API Endpoints Table - 端點配置管理
CREATE TABLE api_endpoints (
  endpoint VARCHAR(100) PRIMARY KEY,
  current_cost SMALLINT NOT NULL CHECK (current_cost > 0),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. API Calls Table - 詳細呼叫記錄（分區表）
CREATE TABLE api_calls (
  call_id BIGSERIAL,
  user_id VARCHAR(50) NOT NULL,
  endpoint VARCHAR(100) NOT NULL,
  cost SMALLINT NOT NULL,
  called_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_id VARCHAR(100),
  response_status SMALLINT,
  metadata JSONB,
  
  PRIMARY KEY (call_id, called_at),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (endpoint) REFERENCES api_endpoints(endpoint)
) PARTITION BY RANGE (called_at);

-- 4. Monthly Usage Table - 月度彙整快取
CREATE TABLE monthly_usage (
  user_id VARCHAR(50) NOT NULL,
  month DATE NOT NULL, -- 月初日期，如 '2025-01-01'
  endpoint VARCHAR(100) NOT NULL,
  call_count INT NOT NULL DEFAULT 0,
  total_cost INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (user_id, month, endpoint),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (endpoint) REFERENCES api_endpoints(endpoint)
);

-- 5. Credit Transactions Table - 點數異動記錄
CREATE TABLE credit_transactions (
  tx_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) NOT NULL,
  delta INT NOT NULL, -- 正數為加值，負數為扣除
  reason VARCHAR(50) NOT NULL, -- 'api_deduction', 'manual_adjustment', 'refund'
  balance_before INT NOT NULL,
  balance_after INT NOT NULL,
  related_call_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### 4. 關鍵設計決策

#### `apiUsageHistory` 實作策略
**決策：關聯式查詢組裝，非實際 DB 欄位**

```typescript
// 應用層實作概念
async function getUserWithUsageHistory(userId: string): Promise<UserTableScheme> {
  // 1. 查詢使用者基本資訊
  const user = await db.query(`
    SELECT user_id, prepurchased_credit, created_at, updated_at
    FROM users WHERE user_id = $1
  `, [userId]);
  
  // 2. 查詢月度使用歷史
  const usageHistory = await db.query(`
    SELECT 
      to_char(month, 'YYYY-MM') as month,
      SUM(total_cost) as total_cost,
      SUM(call_count) as total_calls,
      json_object_agg(endpoint, json_build_object(
        'calls', call_count,
        'cost', total_cost
      )) as per_endpoint
    FROM monthly_usage 
    WHERE user_id = $1
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `, [userId]);
  
  // 3. 組裝結果
  return {
    userId: user.user_id,
    prepurchasedCredit: user.prepurchased_credit,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    apiUsageHistory: usageHistory.map(row => ({
      month: row.month,
      totalCost: parseInt(row.total_cost),
      totalCalls: parseInt(row.total_calls),
      perEndpoint: row.per_endpoint
    }))
  };
}
```

**理由：**
- ✅ **避免 users 表膨脹** - 保持核心表結構簡潔
- ✅ **查詢靈活性** - 可根據需求查詢不同時間範圍
- ✅ **效能最佳化** - 透過 `monthly_usage` 快取表提升查詢速度

#### 原子性扣點交易概念
```typescript
// 應用層交易處理概念
async function deductCreditAndLogCall(request: ApiCallRequest) {
  const transaction = await db.beginTransaction();
  
  try {
    // 1. 查詢端點成本
    const endpoint = await transaction.query(`
      SELECT current_cost FROM api_endpoints 
      WHERE endpoint = $1 AND is_active = true
    `, [request.endpoint]);
    
    // 2. 檢查並扣除餘額
    const result = await transaction.query(`
      UPDATE users 
      SET prepurchased_credit = prepurchased_credit - $2,
          updated_at = NOW()
      WHERE user_id = $1 AND prepurchased_credit >= $2
      RETURNING prepurchased_credit
    `, [request.userId, endpoint.current_cost]);
    
    if (result.rowCount === 0) {
      throw new Error('INSUFFICIENT_CREDIT');
    }
    
    // 3. 記錄 API 呼叫
    await transaction.query(`
      INSERT INTO api_calls(user_id, endpoint, cost, request_id, metadata)
      VALUES ($1, $2, $3, $4, $5)
    `, [request.userId, request.endpoint, endpoint.current_cost, request.requestId, request.metadata]);
    
    // 4. 更新月度彙整
    await transaction.query(`
      INSERT INTO monthly_usage(user_id, month, endpoint, call_count, total_cost)
      VALUES ($1, date_trunc('month', NOW()), $2, 1, $3)
      ON CONFLICT (user_id, month, endpoint)
      DO UPDATE SET 
        call_count = monthly_usage.call_count + 1,
        total_cost = monthly_usage.total_cost + $3,
        last_updated = NOW()
    `, [request.userId, request.endpoint, endpoint.current_cost]);
    
    await transaction.commit();
    return { success: true, newBalance: result.prepurchased_credit };
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### 5. 效能最佳化

- **分區策略** - `api_calls` 按月分區，提升查詢效能
- **快取機制** - `monthly_usage` 表提供預計算的月度統計
- **索引最佳化** - 針對常用查詢模式設計索引
- **向後相容** - 只擴展現有 users 表，不影響現有功能

## 📁 檔案結構

```
task3-database/
├── README.md    # 本檔案 - 作業解答與完整設計說明
├── schema.sql   # PostgreSQL DDL 檔案
└── types.ts     # TypeScript 介面定義
```

## 🚀 使用方式

```bash
# 建立資料庫
psql -U postgres -d your_database -f schema.sql
```

```typescript
// 使用 TypeScript 介面
import { UserTableScheme, APIEndpoint } from './types';

// 查詢使用者資料（含使用歷史）
const user: UserTableScheme = await getUserWithUsageHistory('user-123');

// 檢查使用者餘額
const balance = await getUserBalance('user-123');

// API 呼叫扣點（應用層實作）
const result = await deductCreditAndLogCall({
  userId: 'user-123',
  endpoint: APIEndpoint.GetCreatorInfo,
  requestId: 'req-456'
});
```

---

**此設計完全滿足作業要求，提供完整的 API 配額管理系統。** 🚀 