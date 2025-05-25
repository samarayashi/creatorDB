/**
 * CreatorDB API Quota Management System
 * TypeScript Type Definitions
 */

// =====================================================
// 作業要求的核心介面
// =====================================================

/**
 * 作業要求的 UserTableScheme 介面
 * 注意：apiUsageHistory 是透過查詢組裝的虛擬欄位，非實際 DB 欄位
 */
export interface UserTableScheme {
  userId: string;
  prepurchasedCredit: number;
  createdAt: string;
  updatedAt: string;
  /** 從 monthly_usage 表查詢組裝，非實際 DB 欄位 */
  apiUsageHistory: MonthlyUsageSummary[];
}

/**
 * 月度使用摘要
 */
export interface MonthlyUsageSummary {
  month: string; // '2025-01'
  totalCost: number;
  totalCalls: number;
  perEndpoint: Record<APIEndpoint, { calls: number; cost: number }>;
}

// =====================================================
// API 端點相關定義（與作業要求一致）
// =====================================================

/**
 * API 端點枚舉（與作業要求完全一致）
 */
export const enum APIEndpoint {
  // creator
  SubmitCreators = '/submit-creators',
  DiscoverCreators = '/discover-creators',
  GetCreatorInfo = '/get-creator-info',
  
  // keyword
  GetTopicItems = '/get-topic-items',
  GetNicheItems = '/get-niche-items',
  GetHashtagItems = '/get-hashtag-items',
}

/**
 * API 配額對應表（與作業要求一致）
 */
export const apiQuotaMap: Record<APIEndpoint, number> = {
  // creator
  [APIEndpoint.SubmitCreators]: 1,
  [APIEndpoint.DiscoverCreators]: 2,
  [APIEndpoint.GetCreatorInfo]: 3,
  
  // keyword
  [APIEndpoint.GetTopicItems]: 1,
  [APIEndpoint.GetNicheItems]: 1,
  [APIEndpoint.GetHashtagItems]: 1,
} as const;

// =====================================================
// 資料庫表格對應的 TypeScript 介面
// =====================================================

/**
 * Users 表對應介面
 */
export interface User {
  userId: string;
  prepurchasedCredit: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * API Endpoints 表對應介面
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
 * API Calls 表對應介面
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
 * Monthly Usage 表對應介面
 */
export interface MonthlyUsage {
  userId: string;
  month: string; // '2025-01-01' (月初日期)
  endpoint: APIEndpoint;
  callCount: number;
  totalCost: number;
  lastUpdated: string;
}

/**
 * Credit Transactions 表對應介面
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
 * 點數異動原因枚舉
 */
export type CreditTransactionReason = 
  | 'api_deduction'     // API 扣點
  | 'manual_adjustment' // 手動調整
  | 'refund'           // 退款
  | 'purchase';        // 購買

// =====================================================
// Service 層介面定義
// =====================================================

/**
 * 扣點交易結果
 */
export interface DeductCreditResult {
  success: boolean;
  newBalance: number;
  callId?: string;
  errorMessage?: string;
}

/**
 * 新增點數結果
 */
export interface AddCreditResult {
  success: boolean;
  newBalance: number;
  errorMessage?: string;
}

/**
 * API 呼叫請求參數
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
 * 新增點數請求參數
 */
export interface AddCreditRequest {
  userId: string;
  amount: number;
  reason?: CreditTransactionReason;
  createdBy?: string;
}

/**
 * 查詢使用者使用歷史請求參數
 */
export interface GetUserUsageHistoryRequest {
  userId: string;
  limit?: number; // 預設 12 個月
}

// =====================================================
// 查詢結果介面
// =====================================================

/**
 * 使用者詳細資訊（含使用歷史）
 */
export interface UserWithUsageHistory extends User {
  apiUsageHistory: MonthlyUsageSummary[];
}

/**
 * 使用者餘額查詢結果
 */
export interface UserBalance {
  userId: string;
  prepurchasedCredit: number;
  lastUpdated: string;
}

/**
 * API 使用統計
 */
export interface ApiUsageStats {
  totalCalls: number;
  totalCost: number;
  averageCostPerCall: number;
  mostUsedEndpoint: APIEndpoint;
  leastUsedEndpoint: APIEndpoint;
}

/**
 * 月度統計摘要
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

// =====================================================
// 錯誤處理相關
// =====================================================

/**
 * API 配額系統錯誤類型
 */
export enum QuotaErrorType {
  INSUFFICIENT_CREDIT = 'INSUFFICIENT_CREDIT',
  INVALID_ENDPOINT = 'INVALID_ENDPOINT',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

/**
 * 配額系統錯誤介面
 */
export interface QuotaError {
  type: QuotaErrorType;
  message: string;
  details?: Record<string, any>;
}

// =====================================================
// 資料庫查詢輔助類型
// =====================================================

/**
 * 分頁查詢參數
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 分頁查詢結果
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 日期範圍查詢參數
 */
export interface DateRangeParams {
  startDate: string;
  endDate: string;
}

/**
 * API 呼叫查詢過濾器
 */
export interface ApiCallFilter extends Partial<DateRangeParams> {
  userId?: string;
  endpoint?: APIEndpoint;
  responseStatus?: number;
  minCost?: number;
  maxCost?: number;
}

// =====================================================
// 實用工具類型
// =====================================================

/**
 * 建立使用者請求
 */
export interface CreateUserRequest {
  userId: string;
  initialCredit?: number;
}

/**
 * 更新 API 端點成本請求
 */
export interface UpdateEndpointCostRequest {
  endpoint: APIEndpoint;
  newCost: number;
  updatedBy: string;
}

/**
 * 批次操作結果
 */
export interface BatchOperationResult<T> {
  successful: T[];
  failed: Array<{
    item: T;
    error: string;
  }>;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

// =====================================================
// 匯出所有類型
// =====================================================

export type {
  // 核心介面
  UserTableScheme,
  MonthlyUsageSummary,
  
  // 資料庫表格介面
  User,
  ApiEndpoint,
  ApiCall,
  MonthlyUsage,
  CreditTransaction,
  
  // Service 層介面
  DeductCreditResult,
  AddCreditResult,
  ApiCallRequest,
  AddCreditRequest,
  GetUserUsageHistoryRequest,
  
  // 查詢結果介面
  UserWithUsageHistory,
  UserBalance,
  ApiUsageStats,
  MonthlyStats,
  
  // 錯誤處理
  QuotaError,
  
  // 輔助類型
  PaginationParams,
  PaginatedResult,
  DateRangeParams,
  ApiCallFilter,
  CreateUserRequest,
  UpdateEndpointCostRequest,
  BatchOperationResult,
};

export {
  // 枚舉
  APIEndpoint,
  QuotaErrorType,
  
  // 常數
  apiQuotaMap,
}; 