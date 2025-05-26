# Task 2 - JavaScript 非同步程式碼 Debug

## 🎯 核心問題分析

### 主要 Bug：`var` 變數作用域陷阱
原始程式碼使用 `var i` 在 for 迴圈中，造成**函數作用域共享**問題：

**執行時序：**
1. **迴圈階段（同步）**：`i = 0, 1, 2` 依序創建 3 個 Promise，每個立即開始第一個請求 ✅
2. **迴圈結束**：`i++` 使 `i = 3`，條件 `3 < 3` 為 false，迴圈結束
3. **非同步階段**：當第一個 `await` 完成，準備第二個請求時，**所有 Promise 共享的 `i` 已經是 3**
4. **結果**：`youtubeIds[3] = undefined`，所有 `videosURL` 都變成 `undefined/videos`

**實際測試結果：**
- ✅ `channelURL`: 正確取得各自的 YouTube ID  
- ❌ `videosURL`: 全部變成 `undefined/videos`

## 🚀 解決方案設計思路

### 核心架構選擇：`map()` + `Promise.all()` + `try-catch`

**為什麼選擇 `map()` 而非 `let`/`const`？**
雖然理論上可用 `let`/`const` 解決作用域問題，但我選擇 `map()` 的原因：
- 每個回調函數都有獨立的參數作用域，從根本避免閉包問題
- 符合現代 JavaScript 函數式程式設計習慣
- 程式碼更簡潔且語意清晰

### 容錯機制設計考量

**考慮過 `Promise.allSettled` vs `Promise.all` + `try-catch`：**
- `Promise.allSettled`：也是可行的選擇，同樣能處理細節的錯誤資訊
- **最終選擇 `Promise.all` + 個別 `try-catch`**：
  - 對於這個場景，只需要知道哪個 YouTube ID 產生錯誤即可
  - 錯誤的 ID 通常 channel 和 videos 頁面都會錯，不需要區分具體是哪個請求失敗
  - 這裡主要是基於需求簡潔性的考量

### 並行化優化 + 容錯處理
```typescript
const promises = youtubeIds.map(async (id): Promise<YoutubeDataResult> => {
  try {
    // 每個 YouTube ID 的兩個請求並行執行
    const [channelPage, videosPage] = await Promise.all([
      getPage(channelURL),
      getPage(videosURL),
    ]);
    return { id, channelPage, videosPage };
  } catch (error) {
    // 個別錯誤處理，避免單點失敗影響整體
    return { id, error: error.message };
  }
});

return await Promise.all(promises); // 最外層不會因為個別失敗而全部失敗
```
**關鍵設計：**
- 內層並行化：每個 ID 的兩個請求同時執行
- 個別 try-catch：確保最外層 `Promise.all` 不會因為單個 ID 失敗而全部失敗

### 實際遇到的問題：404 錯誤檢測
在實際測試過程中發現，即使無效的 YouTube ID 也會回傳 HTTP 200，但內容為 404 頁面。因此自行加入內容驗證機制：
```typescript
function isValidYoutubePage(content: string): boolean {
  return !content.includes('404 Not Found') && !content.includes('/error?src=404');
}
```

## 📊 執行與測試

### 執行示例
```bash
npm run demo:ori          # problematic code 
npm run task2:demo:new    # Fixed version
npm run task2:test        # Unit tests
```

### 測試涵蓋範圍
- **基本功能**：正常 YouTube ID 處理
- **容錯機制**：部分失敗不影響其他請求
- **邊界條件**：空陣列、全部失敗
- **404 檢測**：無效 YouTube ID 識別
- **並行化驗證**：確認 fetch 呼叫次數和順序

## 📁 檔案結構
```
task2-debug/
├── src/
│   ├── original.js       # 原始問題程式碼
│   ├── fixed.ts         # 修正版本（核心實現）
│   └── example.ts       # 執行示例（真實網路請求）
└── tests/
    └── debug.test.ts    # 完整測試套件
```
