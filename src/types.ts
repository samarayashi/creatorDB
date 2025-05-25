/**
 * 社群媒體創作者的每日指標資料結構
 */
export type Metric = {
  /** UTC 時間戳記（午夜零點） */
  date: number;
  /** 平均按讚數 */
  averageLikesCount: number;
  /** 追蹤者數量 */
  followersCount: number;
  /** 平均互動率 */
  averageEngagementRate: number;
};

/** 一天的毫秒數 */
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
