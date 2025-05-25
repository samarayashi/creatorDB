# Task 2 - JavaScript 非同步程式碼 Debug

## 🎯 任務目標
分析並修正一段有問題的 JavaScript 非同步程式碼

## ❌ 原始問題程式碼

```javascript
async function getYoutubeData(youtubeIds) {
  var promises = [];
  for (var i = 0; i < youtubeIds.length; i++) {
    var promise = new Promise(async (resolve, reject) => {
      try {
        var channelURL = `https://www.youtube.com/${youtubeIds[i]}`;
        var channelPage = await getPage(channelURL);
        var videosURL = `https://www.youtube.com/${youtubeIds[i]}/videos`;
        var videosPage = await getPage(videosURL);
        resolve({ channelPage, videosPage });
      } catch (e) {
        reject(e);
      }
    });
    promises.push(promise);
  }
  return await Promise.all(promises);
}
```

## 🔍 問題分析

### 核心問題：`var` 變數作用域陷阱

**問題：** 使用 `var i` 在 for 迴圈中，導致所有非同步操作都引用同一個變數

**結果：** 當 Promise 執行時，迴圈已結束，`i` 值為 `youtubeIds.length`，導致 `youtubeIds[i]` 為 `undefined`

**實際行為：**
```javascript
// 所有請求都變成：
// https://www.youtube.com/undefined
// https://www.youtube.com/undefined/videos
```

### 次要問題：
1. **不必要的 Promise 包裝** - `async` 函式已經回傳 Promise
2. **缺乏並行化** - 每個 ID 的兩個請求是序列執行
3. **容錯能力不足** - 任何一個請求失敗就會導致整個批次失敗

## ✅ 修正版本

```typescript
interface YoutubeDataResult {
  id: string;
  channelPage?: string;
  videosPage?: string;
  error?: string;
}

async function getYoutubeData(youtubeIds: string[]): Promise<YoutubeDataResult[]> {
  // ✅ 使用 map() 替代 for 迴圈，避免作用域問題
  const promises = youtubeIds.map(async (id): Promise<YoutubeDataResult> => {
    try {
      const channelURL = `https://www.youtube.com/${id}`;
      const videosURL = `https://www.youtube.com/${id}/videos`;

      // ✅ 並行執行兩個請求，提高效率
      const [channelPage, videosPage] = await Promise.all([
        getPage(channelURL),
        getPage(videosURL),
      ]);

      return { id, channelPage, videosPage };
    } catch (error) {
      // ✅ 個別錯誤處理，避免單點失敗影響整體
      return { 
        id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  return await Promise.all(promises);
}
```

## 🚀 執行測試

```bash
# 安裝依賴
npm install

# 執行示例
npm run task2:demo
```

## 💡 關鍵學習點

1. **避免 `var` 在迴圈中的作用域陷阱** → 使用 `let`/`const` 或 `Array.map()`
2. **避免不必要的 Promise 包裝** → `async` 函式已經是 Promise
3. **善用現代 JavaScript 語法** → `map()` 比 `for` 迴圈更安全且清晰
4. **實現並行化處理** → 使用 `Promise.all()` 同時執行多個請求
5. **加入容錯機制** → 個別錯誤處理，避免單點失敗影響整體

## 🔧 優化重點

- **並行化**：每個 ID 的 channel 和 videos 請求同時執行
- **容錯性**：單個請求失敗不會影響其他請求
- **型別安全**：使用 TypeScript 介面定義回傳結果
- **錯誤追蹤**：清楚標示哪個 ID 成功或失敗

## 📁 檔案結構

```
task2-debug/
├── README.md              # 本說明文件
├── src/
│   ├── original.js        # 原始問題程式碼
│   ├── fixed.ts          # 修正版本（並行化 + 容錯）
│   └── example.ts        # 執行示例
└── tests/
    └── debug.test.ts     # 完整測試（包含容錯測試）
``` 