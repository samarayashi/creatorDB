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
│   ├── tsconfig.json       # Task2 專用配置
│   └── README.md
└── task3-database/         # 任務三：資料庫設計
    ├── tsconfig.json       # Task3 專用配置
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
- 96%+ 測試覆蓋率

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

### 全局操作

```bash
# 編譯所有任務
npm run build:all

# 清理所有編譯檔案
npm run clean:all
```

### Task 1 - 演算法任務

```bash
# 編譯
npm run task1:build

# 執行測試
npm run task1:test

# 執行測試覆蓋率
npm run task1:test:coverage

# 監視模式測試
npm run task1:test:watch

# 執行示範程式
npm run task1:demo

# 程式碼檢查
npm run task1:lint

# 格式化程式碼
npm run task1:format

# 清理編譯檔案
npm run task1:clean
```

## 🛠️ 技術棧

- **語言：** TypeScript 5.0
- **測試：** Jest 29.5
- **程式碼品質：** ESLint + Prettier
- **建置工具：** TypeScript Compiler
- **專案管理：** TypeScript Project References

## 📝 開發說明

### TypeScript 配置策略

本專案使用 **TypeScript Project References** 來管理多任務結構：

- **根目錄 `tsconfig.json`**：定義共用的編譯選項和專案引用
- **各任務 `tsconfig.json`**：繼承根配置，定義任務特定的設定

### 腳本命名規則

- **全局操作**：`操作:all` (例如：`build:all`, `clean:all`)
- **任務特定**：`task任務號:操作` (例如：`task1:test`, `task1:build`)

### 新增任務時的步驟

1. 創建 `taskN-名稱/` 目錄
2. 添加 `taskN-名稱/tsconfig.json` (繼承根配置)
3. 在根目錄 `tsconfig.json` 的 `references` 中添加新任務
4. 在 `package.json` 中添加相應的腳本

## 🎯 面試評估重點

1. **演算法設計與實作能力**
2. **程式碼除錯和問題分析能力**  
3. **資料庫設計和系統架構思維**
4. **程式碼品質和文件撰寫**
5. **測試設計和效能考量**

---

**CreatorDB Team** | MIT License 