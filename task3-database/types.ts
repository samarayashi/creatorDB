/**
 * CreatorDB API Quota Management System
 * TypeScript Type Definitions
 * 
 * Design Philosophy:
 * 1. Data Layer: Direct mapping to database table structures
 * 2. Application Layer: Assembled query results providing complete data structures for business logic
 * 3. Service Layer: Defines operation interfaces and result types
 */

// =====================================================
// Core Business Interfaces (Assignment Requirements)
// =====================================================

/**
 * Assignment-required UserTableScheme interface
 * Design: Application-layer data structure, apiUsageHistory assembled via relational queries
 * Benefits: Avoids users table bloat, maintains query flexibility
 */
export interface UserTableScheme {
  userId: string;
  prepurchasedCredit: number;
  createdAt: string;
  updatedAt: string;
  /** Virtual field assembled from monthly_usage table queries, not an actual DB field */
  apiUsageHistory: MonthlyUsageSummary[];
}

/**
 * Monthly usage summary
 * Design: Pre-calculated aggregated data for improved query performance
 */
export interface MonthlyUsageSummary {
  month: string; // '2025-01'
  totalCost: number;
  totalCalls: number;
  perEndpoint: Record<APIEndpoint, { calls: number; cost: number }>;
}

// =====================================================
// API Endpoint Related Definitions
// =====================================================

/**
 * API endpoint enumeration (fully consistent with assignment requirements)
 */
export const enum APIEndpoint {
  // creator endpoints
  SubmitCreators = '/submit-creators',
  DiscoverCreators = '/discover-creators',
  GetCreatorInfo = '/get-creator-info',
  
  // keyword endpoints
  GetTopicItems = '/get-topic-items',
  GetNicheItems = '/get-niche-items',
  GetHashtagItems = '/get-hashtag-items',
}

/**
 * API quota mapping (consistent with assignment requirements)
 */
export const apiQuotaMap: Record<APIEndpoint, number> = {
  // creator endpoints
  [APIEndpoint.SubmitCreators]: 1,
  [APIEndpoint.DiscoverCreators]: 2,
  [APIEndpoint.GetCreatorInfo]: 3,
  
  // keyword endpoints
  [APIEndpoint.GetTopicItems]: 1,
  [APIEndpoint.GetNicheItems]: 1,
  [APIEndpoint.GetHashtagItems]: 1,
} as const;

// =====================================================
// Data Layer Interfaces (Direct Database Table Mapping)
// =====================================================

/**
 * Users table interface
 * Design: Direct mapping of database table structure
 */
export interface User {
  userId: string;
  prepurchasedCredit: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * API Endpoints table interface
 * Design: Dynamic API cost configuration, supports operational adjustments
 */
export interface ApiEndpoint {
  endpoint: APIEndpoint;
  currentCost: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * API Calls table interface
 * Design: Detailed record of each API call, supports auditing and analysis
 */
export interface ApiCall {
  callId: string;
  userId: string;
  endpoint: APIEndpoint;
  cost: number;
  calledAt: string;
  requestId?: string;
  responseStatus?: number;
  processingTimeMs?: number;
  metadata?: Record<string, any>;
}

/**
 * Monthly Usage table interface
 * Design: Pre-calculated monthly statistics for improved query performance
 */
export interface MonthlyUsage {
  userId: string;
  month: string; // '2025-01-01' (first day of month)
  endpoint: APIEndpoint;
  callCount: number;
  totalCost: number;
  lastUpdated: string;
}

/**
 * Credit Transactions table interface
 * Design: Complete credit change audit trail, supports reconciliation and auditing
 */
export interface CreditTransaction {
  txId: string;
  userId: string;
  delta: number;
  reason: CreditTransactionReason;
  balanceBefore: number;
  balanceAfter: number;
  relatedCallId?: string;
  createdAt: string;
  createdBy?: string;
}

/**
 * Credit transaction reason enumeration
 */
export type CreditTransactionReason = 
  | 'api_deduction'     // API deduction
  | 'manual_adjustment' // Manual adjustment
  | 'refund'           // Refund
  | 'purchase';        // Purchase

// =====================================================
// Service Layer Interfaces (Business Logic Operations)
// =====================================================

/**
 * Credit deduction result
 * Design: Atomic operation result feedback
 */
export interface DeductCreditResult {
  success: boolean;
  newBalance: number;
  callId?: string;
  errorMessage?: string;
}

/**
 * Add credit result
 */
export interface AddCreditResult {
  success: boolean;
  newBalance: number;
  errorMessage?: string;
}

/**
 * API call request parameters
 * Design: Encapsulates all necessary information for API calls
 */
export interface ApiCallRequest {
  userId: string;
  endpoint: APIEndpoint;
  requestId?: string;
  responseStatus?: number;
  processingTimeMs?: number;
  metadata?: Record<string, any>;
}

/**
 * Add credit request parameters
 */
export interface AddCreditRequest {
  userId: string;
  amount: number;
  reason?: CreditTransactionReason;
  createdBy?: string;
}

// =====================================================
// Query and Response Interfaces
// =====================================================

/**
 * Get user usage history request parameters
 */
export interface GetUserUsageHistoryRequest {
  userId: string;
  limit?: number; // Default 12 months
}

/**
 * User with usage history (application layer composite)
 */
export interface UserWithUsageHistory extends User {
  apiUsageHistory: MonthlyUsageSummary[];
}

/**
 * User balance information
 */
export interface UserBalance {
  userId: string;
  prepurchasedCredit: number;
  lastUpdated: string;
}

// =====================================================
// Analytics and Statistics Interfaces
// =====================================================

/**
 * API usage statistics
 */
export interface ApiUsageStats {
  totalCalls: number;
  totalCost: number;
  averageCostPerCall: number;
  mostUsedEndpoint: APIEndpoint;
  leastUsedEndpoint: APIEndpoint;
}

/**
 * Monthly statistics
 */
export interface MonthlyStats {
  month: string;
  totalUsers: number;
  totalCalls: number;
  totalCost: number;
  topEndpoints: Array<{
    endpoint: APIEndpoint;
    calls: number;
    cost: number;
  }>;
}