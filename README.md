# Increment

**A powerful offline-first goal and progress tracker with advanced customization, real-time sync, and a polished React UI.**  
Built end-to-end with a focus on performance, scalability, and delightful user experience.

![Screenshot showing the Increment web dashboard](./docs/screenshot-1.png "Increment goal and time tracking")

## Tech Stack

* **Frontend:** React, TypeScript, Tailwind, Radix UI, Framer Motion  
* **State & Data:** TanStack Query, TanStack Router, IndexedDB (Dexie)  
* **Architecture:** Offline-first with custom sync engine (CloudKit in production; pluggable for serverless/cloud backends such as Cloudflare Workers or AWS Lambda)  
* **Tooling:** Vite, Jest, Testing Library (unit + integration test coverage)  

## Key Technical Features

* **Offline-first architecture** with IndexedDB local persistence and sync backends  
* **Custom sync engine** with plug-in architecture, optimistic updates, conflict/race condition handling (similar to CRDT approaches)  
* **High-performance UI**: advanced React patterns, Radix UI components, and Framer Motion animations  
* **Thorough test coverage** across unit and integration layers for reliability at scale  

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
* Theming and layout customization for a tailored user experience  

## Opportunities for Future Work

* Configurable time zone and unit defaults  
* Multi-goal dashboard widgets and advanced filtering by tags/notes  
* Extensibility for **AI-powered recommendations and insights**  

## Get Started

```bash
npm install
npm run dev
npm test
```