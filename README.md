# CreatorDB Backend Engineer Interview Test

This project contains three technical tasks for the CreatorDB Backend Engineer interview.

## 📋 Original Task Description

For complete task details, please refer to: [CreatorDB Backend Engineer Interview Test](https://hackmd.io/@e201o3jKTT6IRzMwsvEDyA/BkY1fgcxeg)

## 📁 Project Structure

```
creatorDB/
├── package.json              # Project configuration and scripts
├── tsconfig.json            # TypeScript configuration
├── task1-algorithm/         # Task 1: Algorithm Implementation
├── task2-debug/            # Task 2: Code Debugging
└── task3-database/         # Task 3: Database Schema Design
```

## 🎯 Task Overview

### [Task 1 - Algorithm: Fill in Missing Daily Metrics](./task1-algorithm/README.md)
Implement an efficient algorithm to fill missing daily metrics data for social media creators.
**Core Feature:** Fill incomplete metric data to complete 7-day dataset

### [Task 2 - Debug: YouTube Data Fetcher](./task2-debug/README.md)
Analyze and fix asynchronous processing issues in YouTube data fetching code.
**Core Issue:** Promise constructor antipattern and incorrect async handling logic.

### [Task 3 - Database Schema Design](./task3-database/README.md)
Design a database schema that supports API quota management.
**Core Requirements:** Credit management, usage tracking, historical records, and monthly analytics.

## 🚀 Quick Start

### Installation & Running
```bash
npm install

# Task 1 - Algorithm
npm run task1:test          # Run tests
npm run task1:demo          # Run demonstration

# Task 2 - Debug
npm run task2:demo          # Run fixed version
npm run task2:demo:original # Run original problematic version
```
