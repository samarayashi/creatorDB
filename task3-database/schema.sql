-- =====================================================
-- CreatorDB API Quota Management System
-- PostgreSQL Database Schema
-- =====================================================

-- 啟用 UUID 擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. Users Table - 使用者基本資訊
-- =====================================================
CREATE TABLE users (
  user_id VARCHAR(50) PRIMARY KEY,
  prepurchased_credit INT NOT NULL DEFAULT 0 CHECK (prepurchased_credit >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users 表索引
CREATE INDEX idx_users_credit ON users(prepurchased_credit);
CREATE INDEX idx_users_updated ON users(updated_at);

-- =====================================================
-- 2. API Endpoints Table - 端點配置管理
-- =====================================================
CREATE TABLE api_endpoints (
  endpoint VARCHAR(100) PRIMARY KEY,
  current_cost SMALLINT NOT NULL CHECK (current_cost > 0),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. API Calls Table - 詳細呼叫記錄（分區表）
-- =====================================================
CREATE TABLE api_calls (
  call_id BIGSERIAL,
  user_id VARCHAR(50) NOT NULL,
  endpoint VARCHAR(100) NOT NULL,
  cost SMALLINT NOT NULL,
  called_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_id VARCHAR(100),
  response_status SMALLINT,
  processing_time_ms INT,
  metadata JSONB,
  
  PRIMARY KEY (call_id, called_at),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (endpoint) REFERENCES api_endpoints(endpoint) ON UPDATE CASCADE
) PARTITION BY RANGE (called_at);

-- API Calls 表索引（會自動應用到所有分區）
CREATE INDEX idx_api_calls_user_time ON api_calls(user_id, called_at DESC);
CREATE INDEX idx_api_calls_endpoint_time ON api_calls(endpoint, called_at DESC);
CREATE INDEX idx_api_calls_request_id ON api_calls(request_id) WHERE request_id IS NOT NULL;
CREATE INDEX idx_api_calls_metadata ON api_calls USING GIN(metadata) WHERE metadata IS NOT NULL;

-- 建立基本分區（生產環境建議使用 pg_partman 自動管理）
CREATE TABLE api_calls_2025_01 PARTITION OF api_calls
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE api_calls_2025_02 PARTITION OF api_calls
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE api_calls_2025_03 PARTITION OF api_calls
FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- =====================================================
-- 4. Monthly Usage Table - 月度彙整快取
-- =====================================================
CREATE TABLE monthly_usage (
  user_id VARCHAR(50) NOT NULL,
  month DATE NOT NULL, -- 月初日期，如 '2025-01-01'
  endpoint VARCHAR(100) NOT NULL,
  call_count INT NOT NULL DEFAULT 0 CHECK (call_count >= 0),
  total_cost INT NOT NULL DEFAULT 0 CHECK (total_cost >= 0),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (user_id, month, endpoint),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (endpoint) REFERENCES api_endpoints(endpoint) ON UPDATE CASCADE
);

-- Monthly Usage 表索引
CREATE INDEX idx_monthly_usage_user_month ON monthly_usage(user_id, month DESC);
CREATE INDEX idx_monthly_usage_month ON monthly_usage(month);
CREATE INDEX idx_monthly_usage_endpoint ON monthly_usage(endpoint);

-- =====================================================
-- 5. Credit Transactions Table - 點數異動記錄
-- =====================================================
CREATE TABLE credit_transactions (
  tx_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(50) NOT NULL,
  delta INT NOT NULL, -- 正數為加值，負數為扣除
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('api_deduction', 'manual_adjustment', 'refund', 'purchase')),
  balance_before INT NOT NULL CHECK (balance_before >= 0),
  balance_after INT NOT NULL CHECK (balance_after >= 0),
  related_call_id BIGINT, -- 關聯的 API 呼叫（可選）
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(50), -- 操作者（系統或管理員）
  
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Credit Transactions 表索引
CREATE INDEX idx_credit_tx_user_time ON credit_transactions(user_id, created_at DESC);
CREATE INDEX idx_credit_tx_reason ON credit_transactions(reason);
CREATE INDEX idx_credit_tx_created_at ON credit_transactions(created_at DESC);

-- =====================================================
-- 6. 基本觸發器：自動更新 updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 應用到相關表
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_endpoints_updated_at 
  BEFORE UPDATE ON api_endpoints 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. 初始資料：API Endpoints
-- =====================================================
INSERT INTO api_endpoints (endpoint, current_cost, description) VALUES
('/submit-creators', 1, 'Submit creator information'),
('/discover-creators', 2, 'Discover creators with filters'),
('/get-creator-info', 3, 'Get detailed creator information'),
('/get-topic-items', 1, 'Get topic-related items'),
('/get-niche-items', 1, 'Get niche-specific items'),
('/get-hashtag-items', 1, 'Get hashtag-related items');

-- =====================================================
-- 8. 測試資料（開發環境用）
-- =====================================================
INSERT INTO users (user_id, prepurchased_credit) VALUES
('test-user-1', 100),
('test-user-2', 50),
('test-user-3', 200);

-- =====================================================
-- 9. 權限設定範例（根據實際需求調整）
-- =====================================================
-- CREATE ROLE app_user WITH LOGIN PASSWORD 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE ON users TO app_user;
-- GRANT SELECT ON api_endpoints TO app_user;
-- GRANT INSERT ON api_calls TO app_user;
-- GRANT SELECT, INSERT, UPDATE ON monthly_usage TO app_user;
-- GRANT INSERT ON credit_transactions TO app_user; 