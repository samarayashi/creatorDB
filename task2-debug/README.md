# Task 2 - JavaScript Async Code Debugging

## 🎯 Core Problem Analysis

### Main Bug: `var` Variable Scope Trap
The original code uses `var i` in a for loop, causing a **function scope sharing** issue:

**Execution Timeline:**
1. **Loop Phase (Synchronous)**: `i = 0, 1, 2` sequentially creates 3 Promises, each immediately starts the first request ✅
2. **Loop End**: `i++` makes `i = 3`, condition `3 < 3` is false, loop ends
3. **Async Phase**: When the first `await` completes and prepares the second request, **all Promises share the same `i` which is now 3**
4. **Result**: `youtubeIds[3] = undefined`, all `videosURL` become `undefined/videos`

**Actual Test Results:**
- ✅ `channelURL`: Correctly gets respective YouTube IDs  
- ❌ `videosURL`: All become `undefined/videos`

## 🚀 Solution Design

### Core Architecture: `map()` + `Promise.all()` + `try-catch`

**Why choose `map()` over `let`/`const`?**
While `let`/`const` could theoretically solve the scope issue, I chose `map()` because:
- Each callback function has independent parameter scope, fundamentally avoiding closure issues
- Aligns with modern JavaScript functional programming practices
- More concise code with clearer semantics

### Error Handling Design

**Considered `Promise.allSettled` vs `Promise.all` + `try-catch`:**
- `Promise.allSettled`: Also viable, can handle detailed error information
- **Final choice: `Promise.all` + individual `try-catch`**:
  - For this scenario, only need to know which YouTube ID caused errors
  - Failed IDs usually fail for both channel and videos pages, no need to distinguish specific request failures
  - Based on requirement simplicity considerations

### Parallelization + Error Handling
```typescript
const promises = youtubeIds.map(async (id): Promise<YoutubeDataResult> => {
  try {
    // Parallel execution of two requests per YouTube ID
    const [channelPage, videosPage] = await Promise.all([
      getPage(channelURL),
      getPage(videosURL),
    ]);
    return { id, channelPage, videosPage };
  } catch (error) {
    // Individual error handling to prevent single point failures
    return { id, error: error.message };
  }
});

return await Promise.all(promises); // Outer layer won't fail entirely due to individual failures
```
**Key Design:**
- Inner parallelization: Two requests per ID execute simultaneously
- Individual try-catch: Ensures outer `Promise.all` won't fail entirely due to single ID failure

### Real-world Issue: 404 Error Detection
During testing, discovered that even invalid YouTube IDs return HTTP 200 but with 404 page content. Added content validation:
```typescript
function isValidYoutubePage(content: string): boolean {
  return !content.includes('404 Not Found') && !content.includes('/error?src=404');
}
```

## 📊 Execution & Testing

### Run Examples
```bash
npm run task2:demo        # Complete example (with real network requests)
npm run task2:test        # Unit tests
```

### Test Coverage
- **Basic functionality**: Normal YouTube ID processing
- **Error handling**: Partial failures don't affect other requests
- **Edge cases**: Empty arrays, complete failures
- **404 detection**: Invalid YouTube ID identification
- **Parallelization verification**: Confirm fetch call counts and order

## 📁 File Structure
```
task2-debug/
├── src/
│   ├── test-original-behavior.js  # Original problematic code
│   ├── fixed.ts                   # Fixed version (core implementation)
│   └── example.ts                 # Execution examples (real network requests)
└── tests/
    └── debug.test.ts              # Complete test suite
```