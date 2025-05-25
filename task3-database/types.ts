/**
 * CreatorDB API Quota Management System
 * TypeScript Type Definitions
 * 
 * 設計理念：
 * 1. 資料層：直接對應資料庫表格結構
 * 2. 應用層：組合查詢結果，提供業務邏輯所需的完整資料結構
 * 3. 服務層：定義操作介面和結果類型
 */

// =====================================================
// 核心業務介面（作業要求）
// =====================================================

/**
 * 作業要求的 UserTableScheme 介面
 * 設計思路：這是應用層的資料結構，apiUsageHistory 透過關聯查詢組裝
 * 優勢：避免 users 表膨脹，保持查詢靈活性
 */
export interface UserTableScheme {
  userId: string;
  prepurchasedCredit: number;
  createdAt: string;
  updatedAt: string;
  /** 從 monthly_usage 表查詢組裝的虛擬欄位，非實際 DB 欄位 */
  apiUsageHistory: MonthlyUsageSummary[];
}

/**
 * 月度使用摘要
 * 設計思路：預計算的聚合資料，提升查詢效能
 */
export interface MonthlyUsageSummary {
  month: string; // '2025-01'
  totalCost: number;
  totalCalls: number;
  perEndpoint: Record<APIEndpoint, { calls: number; cost: number }>;
}

// =====================================================
// API 端點相關定義
// =====================================================

/**
 * API 端點枚舉（與作業要求完全一致）
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
 * API 配額對應表（與作業要求一致）
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
// 資料層介面（直接對應資料庫表格）
// =====================================================

/**
 * Users 表對應介面
 * 設計思路：保持資料庫表結構的直接映射
 */
export interface User {
  userId: string;
  prepurchasedCredit: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * API Endpoints 表對應介面
 * 設計思路：動態配置 API 成本，支援運營調整
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
 * 設計思路：詳細記錄每次 API 呼叫，支援稽核和分析
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
 * 設計思路：預計算的月度統計，提升查詢效能
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
 * 設計思路：完整的點數異動軌跡，支援對帳和稽核
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
// 服務層介面（業務邏輯操作）
// =====================================================

/**
 * 扣點交易結果
 * 設計思路：原子性操作的結果回饋
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
 * 設計思路：封裝 API 呼叫的所有必要資訊
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
// 應用層組合介面
// =====================================================

/**
 * 使用者詳細資訊（含使用歷史）
 * 設計思路：應用層組合查詢結果
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

// =====================================================
// 統計分析介面
// =====================================================

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
// 錯誤處理
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
// 輔助工具類型
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