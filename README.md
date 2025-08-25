# Increment

**A powerful offline-first goal and progress tracker with advanced customization, real-time sync, and a polished React UI.**  

![Screenshot showing the Increment web dashboard](./docs/screenshot-1.png "Increment goal and time tracking")

## Tech Stack

* **Frontend:** React, TypeScript, Tailwind, Radix UI, Framer Motion  
* **State & Data:** TanStack Query, TanStack Router, IndexedDB (Dexie)  
* **Architecture:** Offline-first with custom sync engine (CloudKit in production; pluggable for serverless/cloud backends or a REST API)  
* **Tooling:** Vitest, React Testing Library (unit + integration test coverage)  

## Key Technical Features

* **Offline-first architecture** with IndexedDB local persistence and sync backends  
* **Custom sync engine** with plug-in architecture, conflict/race condition handling, and offline support
* **High-performance UI**: optimistic UI updates, Radix UI components, and Framer Motion animations  
* **Thorough test coverage** unit and integration tests

## Product Features

* Cross-platform goal and progress syncing (only web UI open source)  
* Tracks daily, weekly, and monthly goals with support for different units (time, distance, words, count)  
* Support for rest days, weekends, levels, thresholds, and streaks  
* Highly customizable dashboard with multiple widgets:
  * Calendar view  
  * Streak tracker  
  * Time-until-goal countdown  
  * Level progression  
  * Total progress aggregations  
* Theming and layout customization

## Opportunities for Future Work

* Configurable time zone and unit defaults  
* Multi-goal dashboard widgets and advanced filtering by tags/notes  

## Get Started

```bash
npm install
npm run dev
npm test
```