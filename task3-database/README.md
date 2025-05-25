# Task 3: Database Schema Design - API Quota Management

## 🎯 Assignment Requirements

Design a **Headless API Service Quota Billing System** and complete the `UserTableScheme` design:

```typescript
// Interface to be implemented
type UserTableScheme = {
  userId: string;
  prepurchasedCredit: number;
  
  // Implementation required
  apiUsageHistory: ???
  ...
}
```

### Core Requirements
- ✅ **Credit Management** - Track prepurchased credits, deduct based on API endpoint usage
- ✅ **Usage Tracking** - Record detailed API call information for auditing
- ✅ **Historical Record Keeping** - Store monthly usage data for analysis reports
- ✅ **Monthly Analysis** - Allow users to view monthly aggregated API usage
- ✅ **Endpoint-Specific Quotas** - Different API endpoints have different credit costs

### API Endpoints & Costs
| Endpoint | Cost | Description |
|----------|------|-------------|
| `/submit-creators` | 1 credit | Submit creator information |
| `/discover-creators` | 2 credits | Discover creators (with filters) |
| `/get-creator-info` | 3 credits | Get detailed creator information |
| `/get-topic-items` | 1 credit | Get topic-related items |
| `/get-niche-items` | 1 credit | Get niche market items |
| `/get-hashtag-items` | 1 credit | Get hashtag-related items |

## ✅ Solution

### 1. Database Choice: PostgreSQL

**Selection Rationale:**
- **ACID Transaction Guarantees** - Ensures atomicity of credit deductions, prevents overdrafts
- **Complex Query Support** - Monthly analysis requires aggregation queries
- **Backward Compatibility** - Existing services predominantly use SQL
- **Partitioning Support** - Large volumes of API call records can be partitioned by month

#### 🤔 Why Not MongoDB?

While MongoDB offers schema-less design and sharding capabilities, it has limitations for this quota management system:

**1. Schema Design & Data Relationships**
- System has clear relational structure (users → api_calls → monthly_usage)
- Requires enforced foreign key constraints for data integrity
- MongoDB's schema-less nature adds complexity rather than benefits

**2. Transaction Consistency Requirements**
- Credit deduction + API call recording + monthly stats update must be atomic
- PostgreSQL's ACID guarantees are more mature and stable
- MongoDB's multi-document transactions are relatively new with higher performance overhead

**3. Query Pattern Suitability**
- Heavy aggregation queries (monthly, per-endpoint statistics)
- SQL's GROUP BY, JOIN operations are more intuitive and maintainable
- MongoDB's aggregation pipeline need more effort to maintain and extra cost

**4. Team & Ecosystem Factors**
- Backward compatibility considerations

**Conclusion**: This is a typical OLTP scenario where PostgreSQL excels in relational data, transaction consistency, and query convenience.

#### 📊 Partitioning Strategy

For large volumes of `api_calls` records, implement **monthly partitioning**:

```sql
-- Use pg_partman for automatic partition management
SELECT partman.create_parent(
  p_parent_table => 'public.api_calls',
  p_control => 'called_at',
  p_type => 'range',
  p_interval => '1 month',
  p_premake => 3,                    -- Create 3 months ahead
  p_start_partition => '2025-01-01'
);

-- Configure data retention policy
UPDATE partman.part_config 
SET retention = '24 months',           -- Retain 24 months
    retention_keep_table = false,      -- Auto-delete old partitions
    premake = 6                        -- Create 6 partitions ahead
WHERE parent_table = 'public.api_calls';
```

**Partitioning Benefits:**
- ✅ **Query Performance** - Most queries target recent data, partitioning significantly improves speed
- ✅ **Data Archival** - Old partitions can be moved to cold storage, reducing costs
- ✅ **Maintenance Convenience** - Independent maintenance of monthly data
- ✅ **Automated Management** - pg_partman provides fully automated partition creation and cleanup

### 2. Complete UserTableScheme Design

```typescript
export interface UserTableScheme {
  userId: string;
  prepurchasedCredit: number;
  createdAt: string;
  updatedAt: string;
  /** Assembled from monthly_usage table queries, not an actual DB field */
  apiUsageHistory: MonthlyUsageSummary[];
}

export interface MonthlyUsageSummary {
  month: string; // YYYY-MM
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

### 3. Database Schema Design

```sql
-- 1. Users Table - User basic information
CREATE TABLE users (
  user_id VARCHAR(50) PRIMARY KEY,
  prepurchased_credit INT NOT NULL DEFAULT 0 CHECK (prepurchased_credit >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. API Endpoints Table - Endpoint configuration management
CREATE TABLE api_endpoints (
  endpoint VARCHAR(100) PRIMARY KEY,
  current_cost SMALLINT NOT NULL CHECK (current_cost > 0),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. API Calls Table - Detailed call records (partitioned table)
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

-- 4. Monthly Usage Table - Monthly aggregation cache
CREATE TABLE monthly_usage (
  user_id VARCHAR(50) NOT NULL,
  month DATE NOT NULL, -- First day of month, e.g., '2025-01-01'
  endpoint VARCHAR(100) NOT NULL,
  call_count INT NOT NULL DEFAULT 0,
  total_cost INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (user_id, month, endpoint),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (endpoint) REFERENCES api_endpoints(endpoint)
);

-- 5. Credit Transactions Table - Credit change records
CREATE TABLE credit_transactions (
  tx_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) NOT NULL,
  delta INT NOT NULL, -- Positive for additions, negative for deductions
  reason VARCHAR(50) NOT NULL, -- 'api_deduction', 'manual_adjustment', 'refund'
  balance_before INT NOT NULL,
  balance_after INT NOT NULL,
  related_call_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### 4. Key Design Decisions

#### **Credit Transactions Table Design Rationale**

While theoretically possible to reconstruct transaction history through `api_calls` + `users`, the `credit_transactions` table provides:
- **Complete Business Support** - Credit purchases, refunds, customer service adjustments, and other non-API transactions
- **Audit Performance** - Quick balance consistency verification without large table scans
- **Transaction Integrity** - Records before/after state of each balance change

#### **apiUsageHistory Implementation Strategy**

**Decision: Relational query assembly, not an actual DB field**

```typescript
// Application layer implementation concept
async function getUserWithUsageHistory(userId: string): Promise<UserTableScheme> {
  // 1. Query user basic information
  const user = await db.query(`
    SELECT user_id, prepurchased_credit, created_at, updated_at
    FROM users WHERE user_id = $1
  `, [userId]);
  
  // 2. Query monthly usage history (DB-level JSON assembly)
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
  
  // 3. Assemble result
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

**Rationale:**
- ✅ **Avoid users table bloat** - Keep core table structure clean
- ✅ **Query flexibility** - Can query different time ranges as needed
- ✅ **Performance optimization** - Improve query speed through `monthly_usage` cache table

#### Atomic Credit Deduction Transaction Concept

**Transaction Flow:**
1. **Query endpoint cost** - Get current cost from `api_endpoints` table
2. **Check user balance** - Verify `prepurchased_credit` is sufficient
3. **Deduct user balance** - Atomically update `users` table
4. **Record API call** - Insert into `api_calls` table (with partitioning)
5. **Record credit transaction** - Insert into `credit_transactions` table (audit trail)
6. **Update monthly aggregation** - UPSERT `monthly_usage` table (performance cache)

**ACID Guarantees:**
- ✅ **Atomicity** - All operations complete within same transaction or rollback entirely
- ✅ **Consistency** - Balance changes fully recorded, supporting audit verification
- ✅ **Isolation** - Prevents concurrent deductions causing overdrafts

## 📁 File Structure

```
task3-database/
├── README.md    # This file - Assignment solution and complete design documentation
├── schema.sql   # PostgreSQL DDL file
└── types.ts     # TypeScript interface definitions
```