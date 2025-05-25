-- =====================================================
-- CreatorDB API Quota Management System
-- PostgreSQL Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. Users Table - User basic information
-- =====================================================
CREATE TABLE users (
  user_id VARCHAR(50) PRIMARY KEY,
  prepurchased_credit INT NOT NULL DEFAULT 0 CHECK (prepurchased_credit >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 2. API Endpoints Table - Endpoint configuration management
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
-- 3. API Calls Table - Detailed call records (partitioned table)
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

-- API Calls table indexes (essential for core queries)
-- Purpose: Query user API call history (high-frequency queries)
-- Use cases: getUserApiHistory(userId, dateRange), user dashboard
CREATE INDEX idx_api_calls_user_time ON api_calls(user_id, called_at DESC);

-- Purpose: Track specific request processing status (debugging essential)
-- Use cases: Customer support queries, API request tracking, troubleshooting
CREATE INDEX idx_api_calls_request_id ON api_calls(request_id) WHERE request_id IS NOT NULL;

-- Create basic partitions (production should use pg_partman for automation)
CREATE TABLE api_calls_2025_01 PARTITION OF api_calls
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE api_calls_2025_02 PARTITION OF api_calls
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE api_calls_2025_03 PARTITION OF api_calls
FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- =====================================================
-- 4. Monthly Usage Table - Monthly aggregation cache
-- =====================================================
CREATE TABLE monthly_usage (
  user_id VARCHAR(50) NOT NULL,
  month DATE NOT NULL, -- First day of month, e.g., '2025-01-01'
  endpoint VARCHAR(100) NOT NULL,
  call_count INT NOT NULL DEFAULT 0 CHECK (call_count >= 0),
  total_cost INT NOT NULL DEFAULT 0 CHECK (total_cost >= 0),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (user_id, month, endpoint),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (endpoint) REFERENCES api_endpoints(endpoint) ON UPDATE CASCADE
);

-- Monthly Usage table indexes (core business functionality)
-- Purpose: Query user monthly usage history (core business feature)
-- Use cases: getUserUsageHistory(userId), apiUsageHistory assembly, user billing
CREATE INDEX idx_monthly_usage_user_month ON monthly_usage(user_id, month DESC);


-- =====================================================
-- 5. Credit Transactions Table - Credit change records
-- =====================================================
CREATE TABLE credit_transactions (
  tx_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(50) NOT NULL,
  delta INT NOT NULL, -- Positive for additions, negative for deductions
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('api_deduction', 'manual_adjustment', 'refund', 'purchase')),
  balance_before INT NOT NULL CHECK (balance_before >= 0),
  balance_after INT NOT NULL CHECK (balance_after >= 0),
  related_call_id BIGINT, -- Related API call (optional)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(50), -- Operator (system or admin)
  
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Credit Transactions table indexes (audit essential)
-- Purpose: Query user credit change history (audit essential)
-- Use cases: getUserCreditHistory(userId), balance verification, customer support, reconciliation
CREATE INDEX idx_credit_tx_user_time ON credit_transactions(user_id, created_at DESC);

-- =====================================================
-- 6. Basic triggers: Auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_endpoints_updated_at 
  BEFORE UPDATE ON api_endpoints 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. Initial data: API Endpoints
-- =====================================================
INSERT INTO api_endpoints (endpoint, current_cost, description) VALUES
('/submit-creators', 1, 'Submit creator information'),
('/discover-creators', 2, 'Discover creators with filters'),
('/get-creator-info', 3, 'Get detailed creator information'),
('/get-topic-items', 1, 'Get topic-related items'),
('/get-niche-items', 1, 'Get niche-specific items'),
('/get-hashtag-items', 1, 'Get hashtag-related items');

-- =====================================================
-- 8. Test data (for development environment)
-- =====================================================
INSERT INTO users (user_id, prepurchased_credit) VALUES
('test-user-1', 100),
('test-user-2', 50),
('test-user-3', 200);
