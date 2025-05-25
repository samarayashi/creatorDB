# CreatorDB Backend Engineer Interview Test

這個專案包含了 CreatorDB 後端工程師面試的三個技術任務。

## 📁 專案結構

```
creatorDB/
├── package.json              # 共用配置和腳本
├── tsconfig.json            # 共用 TypeScript 配置
├── task1-algorithm/         # 任務一：演算法實作
│   ├── src/
│   │   ├── shared/          # 共用類型和工具
│   │   ├── algorithms/      # 演算法實作
│   │   ├── fillMissingMetrics.ts
│   │   └── index.ts
│   ├── tests/              # 測試文件
│   ├── examples/           # 使用範例
│   ├── tsconfig.json       # Task1 專用配置
│   └── README.md           # 詳細說明
├── task2-debug/            # 任務二：程式碼除錯
│   └── README.md
└── task3-database/         # 任務三：資料庫設計
    └── README.md
```

## 🎯 任務概覽

### Task 1 - Algorithm: Fill in Missing Daily Metrics
**狀態：✅ 已完成**

實作一個高效能的演算法來填補社群媒體創作者的缺失每日指標資料。

**特色：**
- 支援二分查找和雙指針兩種演算法
- 根據資料量自動選擇最佳策略
- 完整的 TypeScript 型別定義
- 100% 測試覆蓋率

**詳細說明：** [task1-algorithm/README.md](./task1-algorithm/README.md)

### Task 2 - Debug: YouTube Data Fetcher
**狀態：📋 待實作**

分析並修正 YouTube 資料抓取程式碼中的問題。

**詳細說明：** [task2-debug/README.md](./task2-debug/README.md)

### Task 3 - Database Schema Design
**狀態：📋 待實作**

設計一個支援 API 配額計算的資料庫架構。

**詳細說明：** [task3-database/README.md](./task3-database/README.md)

## 🚀 快速開始

### 安裝依賴
```bash
npm install
```

### Task 1 - 演算法任務

```bash
# 執行測試
npm test

# 執行測試覆蓋率
npm run test:coverage

# 執行示範程式
npm run dev

# 編譯 TypeScript
npm run build
```

### 開發工具

```bash
# 程式碼檢查
npm run lint

# 格式化程式碼
npm run format

# 清理編譯檔案
npm run clean
```

## 🛠️ 技術棧

- **語言：** TypeScript 5.0
- **測試：** Jest 29.5
- **程式碼品質：** ESLint + Prettier
- **建置工具：** TypeScript Compiler

## 📝 開發說明

每個任務都有獨立的目錄結構，但共用根目錄的配置文件：

- `package.json` - 包含所有任務的依賴和腳本
- `tsconfig.json` - 基礎 TypeScript 配置
- 各任務可以有自己的 `tsconfig.json` 來覆蓋特定設定

## 🎯 面試評估重點

1. **演算法設計與實作能力**
2. **程式碼除錯和問題分析能力**  
3. **資料庫設計和系統架構思維**
4. **程式碼品質和文件撰寫**
5. **測試設計和效能考量**

---

**CreatorDB Team** | MIT License 