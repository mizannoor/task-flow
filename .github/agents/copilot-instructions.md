# TaskFlow Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-01

## Active Technologies
- JavaScript ES2022+ (React 18+) + React, Dexie.js, Tailwind CSS, uuid (002-task-management)
- IndexedDB via Dexie.js (client-side only) (002-task-management)
- JavaScript ES2022+ (React 19.x) + React 19, Tailwind CSS, Dexie.js (existing) (003-kanban-view)
- IndexedDB via Dexie.js (existing infrastructure) (003-kanban-view)
- JavaScript ES2022+ (React 18+) + React, Tailwind CSS, Dexie.js (existing stack) (004-todays-focus-view)
- IndexedDB via Dexie.js (existing - no schema changes needed) (004-todays-focus-view)
- JavaScript ES2022+ (React 18+) + React Context API, Dexie.js (IndexedDB), Tailwind CSS (005-time-tracking)
- IndexedDB via Dexie.js - extends existing Task table with timer fields (005-time-tracking)
- JavaScript ES2022+ (React 18+) + React Context API, Dexie.js (IndexedDB), Recharts (NEW), Tailwind CSS (006-personal-analytics)
- IndexedDB via Dexie.js - reads from existing Task table, no schema changes needed (006-personal-analytics)
- JavaScript ES2022+ (React 18+) + React, Tailwind CSS, Google Gemini API (`gemini-pro` model) (008-ai-task-analysis)
- N/A (AI suggestions are ephemeral; only accepted values persist in IndexedDB via existing TaskService) (008-ai-task-analysis)

- JavaScript/TypeScript ES2022+ + React 18+, Dexie.js (IndexedDB wrapper), Tailwind CSS (001-auth-system)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

JavaScript/TypeScript ES2022+: Follow standard conventions

## Recent Changes
- 008-ai-task-analysis: Added JavaScript ES2022+ (React 18+) + React, Tailwind CSS, Google Gemini API (`gemini-pro` model)
- 007-calendar-view: Added JavaScript ES2022+ (React 19.x) + React 19, Tailwind CSS, Dexie.js (existing)
- 006-personal-analytics: Added JavaScript ES2022+ (React 18+) + React Context API, Dexie.js (IndexedDB), Recharts (NEW), Tailwind CSS


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
