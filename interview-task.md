# CreatorDB Backend Engineer Interview Test

## 1. Algorithm - Fill in Missing Daily Metrics

You are working on a social media analytics platform. The system provides an API that returns a creator’s recent metric data. The API returns **at most 7 metric entries** and **at least 1 metric entry**, sorted in ascending order by date. However, the entries might **not cover 7 consecutive days** due to missing data in the database.

Your task is to implement a function:
```ts
fillMissingMetrics(data: Metric[]): Metric[]
```
that fills in the missing days so that the result contains exactly 7 days of data, from 6 days ago up to today.

### 🧾 Input

- `data`: an array of up to 7 `Metric` objects, **sorted by date (ascending)**:

```ts
type Metric = {
  date: number; // UTC timestamp at midnight
  averageLikesCount: number;
  followersCount: number;
  averageEngagementRate: number;
};
```

The function should generate entries for the date range:
```ts
[today - 6d, ..., today]
```

where "today" is the current date at midnight UTC.
```ts
new Date().setUTCHours(0, 0, 0, 0)
```

### ✅ Fill-in Logic

For each missing day:

1. Look for the nearest available date (this can be from either the past or future).
2. If two dates are equally distant, prefer the older date (i.e., the earlier date).
3. Fill the missing days by using the nearest date according to the rules above.
4. Return a list of exactly 7 metrics, one for each day in the target date range, sorted in ascending order.

### 📘 Example Input

```ts
const example1 = [
  { date: 1738368000000, averageLikesCount: 100, followersCount: 200, averageEngagementRate: 0.01 },
  { date: 1738540800000, averageLikesCount: 105, followersCount: 202, averageEngagementRate: 0.012 },
  { date: 1738713600000, averageLikesCount: 110, followersCount: 205, averageEngagementRate: 0.015 },
  { date: 1738800000000, averageLikesCount: 120, followersCount: 208, averageEngagementRate: 0.02 },
  { date: 1739068800000, averageLikesCount: 130, followersCount: 210, averageEngagementRate: 0.022 },
  { date: 1739155200000, averageLikesCount: 140, followersCount: 215, averageEngagementRate: 0.023 },
  { date: 1739328000000, averageLikesCount: 150, followersCount: 220, averageEngagementRate: 0.025 },
];

// Today is 1739328000000
```

### 🎯 Expected Output

An array of 7 metrics for dates:
```ts
[-6d, -5d, -4d, -3d, -2d, -1d, 0d]
```

Example Output from `example1`:
```ts
[
  { date: ..., data from -6d },  // -6d → original
  { date: ..., data from -6d },  // -5d → fallback to -6d
  { date: ..., data from -3d },  // -4d → fallback to -3d
  { date: ..., data from -3d },  // -3d → original
  { date: ..., data from -2d },  // -2d → original
  { date: ..., data from -2d },  // -1d → fallback to -2d
  { date: ..., data from  0d }   //  0d → original
]
```

## 2. Debug

### Problematic Code
```ts
async function getPage(url) {
  var response = await fetch(url);
  var data = await response.text();
  return data;
}

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
  var results = await Promise.all(promises);
  return results;
}

var youtubeIds = ['@darbbq', '@oojimateru', '@homemeat_clip'];
getYoutubeData(youtubeIds);
```

### Issue

The `i` variable is not scoped inside the closure of the `Promise` due to `var`, which leads to unexpected index values when the async operations run. Use `let` instead of `var`, or refactor to use `Array.prototype.map`.

### Suggested Fix

Use `let` or map-based promise collection:
```ts
const promises = youtubeIds.map(async (id) => {
  const channelURL = `https://www.youtube.com/${id}`;
  const videosURL = `https://www.youtube.com/${id}/videos`;

  const [channelPage, videosPage] = await Promise.all([
    getPage(channelURL),
    getPage(videosURL),
  ]);

  return { id, channelPage, videosPage };
});
```

## 3. Database Schema Design

### Requirements

- Credit Management
- Usage Tracking
- Historical Record Keeping
- Monthly Analysis
- Endpoint-Specific Quotas

### Schema Suggestion (SQL)

```ts
type UserTableScheme = {
  userId: string;
  prepurchasedCredit: number;
  apiUsageHistory: {
    date: string; // YYYY-MM-DD
    endpoint: APIEndpoint;
    cost: number;
  }[];
};
```

To normalize in a relational schema:
- `users(user_id, prepurchased_credit)`
- `api_usage(user_id, timestamp, endpoint, cost)`
- `api_endpoints(endpoint, cost_per_call)`

### Enum

```ts
const enum APIEndpoint {
  SubmitCreators = '/submit-creators',
  DiscoverCreators = '/discover-creators',
  GetCreatorInfo = '/get-creator-info',
  GetTopicItems = '/get-topic-items',
  GetNicheItems = '/get-niche-items',
  GetHashtagItems = '/get-hashtag-items',
}

const apiQuotaMap: Record<APIEndpoint, number> = {
  [APIEndpoint.SubmitCreators]: 1,
  [APIEndpoint.DiscoverCreators]: 2,
  [APIEndpoint.GetCreatorInfo]: 3,
  [APIEndpoint.GetTopicItems]: 1,
  [APIEndpoint.GetNicheItems]: 1,
  [APIEndpoint.GetHashtagItems]: 1,
};
```
