# CreatorDB Backend Engineer Interview Test

這個專案包含了 CreatorDB 後端工程師面試的三個技術任務。

## 📋 原始任務說明

完整的任務說明請參考：[CreatorDB Backend Engineer Interview Test](https://hackmd.io/@e201o3jKTT6IRzMwsvEDyA/BkY1fgcxeg)

## 📁 專案結構

```
creatorDB/
├── package.json              # 專案配置和腳本
├── tsconfig.json            # TypeScript 配置
├── task1-algorithm/         # 任務一：演算法實作
├── task2-debug/            # 任務二：程式碼除錯
└── task3-database/         # 任務三：資料庫設計
```

## 🎯 任務概覽

### [Task 1 - Algorithm: Fill in Missing Daily Metrics](./task1-algorithm/README.md)
實作一個高效能的演算法來填補社群媒體創作者的缺失每日指標資料。
**核心功能：** 將不完整的指標資料填補成完整的 7 天資料

### [Task 2 - Debug: YouTube Data Fetcher](./task2-debug/README.md)
分析並修正 YouTube 資料抓取程式碼中的非同步處理問題。
**核心問題：** Promise constructor antipattern 和錯誤的非同步處理邏輯。

### [Task 3 - Database Schema Design](./task3-database/README.md)
設計一個支援 API 配額計算的資料庫架構。
**核心需求：** 信用額度管理、使用量追蹤、歷史記錄保存和月度分析。

## 🚀 快速開始

### 
```bash
npm install

# Task 1 - 演算法
npm run task1:test          # 執行測試
npm run task1:demo          # 執行示範

# Task 2 - Debug
npm run task2:demo:ori      # Run original problematic version
npm run task2:demo:new      # Run fixed version
npm run task2:test
```

## 🛠️ 技術棧

- **語言：** TypeScript 5.0
- **測試：** Jest 29.5

