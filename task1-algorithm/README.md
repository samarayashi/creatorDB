# 填補缺失每日指標演算法

用於填補社群媒體創作者的缺失每日指標資料。支援兩種最佳化策略：二分查找和雙指針，並能根據資料量自動選擇最佳演算法。

## 🚀 功能特色

- **智慧演算法選擇**：根據資料量和目標天數自動選擇最佳演算法
- **雙演算法支援**：
  - 二分查找：適合小資料集，時間複雜度 O(m × log n)
  - 雙指針：適合大資料集，時間複雜度 O(m + n)
- **高度可配置**：支援任意天數配置（不限於 7 天）
- **型別安全**：完整的 TypeScript 型別定義
- **完整測試**：涵蓋率 100%，包含效能測試
- **零依賴**：純 TypeScript 實作，無外部依賴

## 📦 安裝

```bash
npm install fill-missing-metrics
```

## 🎯 快速開始

```typescript
import { fillMissingMetrics, Metric } from 'fill-missing-metrics';

// 準備資料（必須按日期升序排列）
const data: Metric[] = [
  {
    date: 1738800000000,           // -6d
    averageLikesCount: 120,
    followersCount: 208,
    averageEngagementRate: 0.02
  },
  {
    date: 1739068800000,           // -3d
    averageLikesCount: 130,
    followersCount: 210,
    averageEngagementRate: 0.022
  },
  {
    date: 1739328000000,           // 0d (today)
    averageLikesCount: 150,
    followersCount: 220,
    averageEngagementRate: 0.025
  }
];

// 填補缺失的 7 天資料
const result = fillMissingMetrics(data);
console.log(result.length); // 7

// 自訂天數
const monthlyData = fillMissingMetrics(data, 30);
console.log(monthlyData.length); // 30
```

## 📊 演算法說明

### 填補邏輯

對於每個缺失的日期：

1. **尋找最近的可用日期**（可以是過去或未來）
2. **距離相同時偏好較早的日期**
3. **使用最近日期的指標值，但保持目標日期**

### 演算法選擇策略

系統會根據以下條件自動選擇最佳演算法：

```typescript
// 當 m × log(n) > (m + n) 時選擇雙指針
// 其中 m = 目標天數，n = 原始資料筆數
```

### 🎯 實際使用建議

根據實際業務場景分析，**社群媒體創作者的指標填補通常是「少資料補多天數」的情況**：
- 原始資料：通常只有幾筆到幾十筆記錄
- 目標天數：通常需要填補 7-30 天的完整資料

在這種情況下，**雙指針演算法 (Two Pointers) 是更優的選擇**：
- 時間複雜度 O(m + n) 在 m >> n 時表現優異
- 記憶體使用更少，實作更簡潔
- 對於典型的業務場景（如 3 筆資料填補 30 天），效能明顯優於二分查找

如果你的使用場景符合上述特徵，建議直接使用：
```typescript
import { fillMissingMetricsTwoPointers } from 'fill-missing-metrics';

// 直接使用雙指針演算法，避免選擇邏輯的額外開銷
const result = fillMissingMetricsTwoPointers(data, 30);
```

## 🔧 API 參考

### 主要函式

#### `fillMissingMetrics(data, daysCount?)`

自動選擇最佳演算法填補缺失資料。

```typescript
function fillMissingMetrics(
  data: readonly Metric[],
  daysCount: number = 7
): Metric[]
```

**參數：**
- `data`: 已有的指標資料陣列（必須按日期升序）
- `daysCount`: 要生成的天數（預設 7 天）

**回傳：** 包含完整天數的指標陣列

#### `fillMissingMetricsBinary(data, daysCount?)`

強制使用二分查找演算法。

#### `fillMissingMetricsTwoPointers(data, daysCount?)`

強制使用雙指針演算法。**建議在典型業務場景中優先使用**。

### 型別定義

```typescript
type Metric = {
  date: number;                    // UTC 時間戳記（午夜零點）
  averageLikesCount: number;       // 平均按讚數
  followersCount: number;          // 追蹤者數量
  averageEngagementRate: number;   // 平均互動率
};
```


## 🧪 測試

```bash
# 執行所有測試
npm test

# 執行測試並生成覆蓋率報告
npm run test:coverage

# 監視模式
npm run test:watch
```

測試涵蓋：
- ✅ 基本功能測試
- ✅ 邊界情況處理
- ✅ 演算法一致性驗證
- ✅ 效能基準測試
- ✅ 資料完整性檢查

## 🎨 示範

執行示範程式：

```bash
npm run task1:demo
```


## 📝 設計理念

### 1. 效能優先
- 根據資料特性動態選擇最佳演算法
- 避免不必要的記憶體分配
- 最小化時間複雜度

### 2. 實務導向
- 針對「少資料補多天數」的典型場景最佳化
- 提供直接使用雙指針演算法的選項
- 保留演算法選擇邏輯以應對特殊情況