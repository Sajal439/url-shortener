# 🚀 Scalable Production URL Shortener

An ultra-fast, highly concurrent URL shortener engineered to survive massive traffic spikes using Redis caching, distributed locks, and a custom Snowflake ID generator.

## 🎯 Project Overview

This is a **production-grade system design implementation** built to handle millions of URLs and massive redirect-heavy read operations with sub-millisecond latency. 

It was specifically designed to solve the classic System Design Interview question: *"Design a URL shortener like Bitly."* Instead of just drawing boxes, this project actually implements the architecture.

## ⚙️ Tech Stack & Architecture

- **Backend Framework:** Node.js + Fastify (Chosen for blazing-fast low-overhead routing)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Prisma ORM v7 using the high-performance `PrismaPg` native adapter)
- **Caching Layer:** Redis (ioredis)
- **Infrastructure:** Docker & Docker Compose
- **Testing:** k6 (End-to-end high-concurrency Load Testing)

### System Architecture
```text
Client → Fastify API Server
            ↓
       Redis Cache (Cache-Aside + Distributed Locks)
            ↓
       PostgreSQL DB (PrismaPg Native Adapter)
```

## 🧠 Key Engineering Decisions & Features

### 1. Snowflake ID Generation + Base62 Encoding
Instead of hitting the database for a slow, bottlenecked auto-incrementing integer every time a URL is created, we use a **custom Snowflake ID generator**. This allows the application logic to instantly generate guaranteed unique, time-ordered 64-bit integers locally without asking the database. We then encode this ID using **Base62** (A-Z, a-z, 0-9) to create the shortest possible URL path (`/aB3x9`).

### 2. Cache-Aside Pattern with Distributed Locks (Cache Stampede Protection)
During a viral traffic spike, thousands of requests might hit the same short URL at the exact same millisecond. If that URL isn't in Redis yet, all thousands of requests would normally smash into PostgreSQL simultaneously, crashing the database. We implemented a **Redis Distributed Lock** (`lock:url:${shortCode}`). 
- The *first* request acquires the lock and safely queries Postgres.
- The other 999 requests wait for a fraction of a second until the cache is populated.
- Result: Only 1 query hits Postgres, the rest are instantly served from RAM.

### 3. Smart Deduplication
If ten users shorten the exact same long URL (e.g., `https://google.com`), we do not create ten database records. We hash the long URL using MD5 and query Postgres. If it exists, we return the existing short URL, saving massive amounts of storage space.

### 4. High-Performance Load Testing
The system was aggressively load-tested locally using `k6`, proving capable of handling massive spikes of concurrent Virtual Users executing Full Read/Write life cycles locally by optimizing network and I/O bottlenecks.

### 5. Configurable Rate Limiting
Endpoints are protected by aggressive IP-based rate limiting to prevent abuse and malicious automated database filling.

## 🚦 How to Run the Project

1. **Start the Infrastructure (PostgreSQL + Redis)**
   ```bash
   docker-compose -f docker/docker-compose.dev.yml up -d
   ```
2. **Push the Database Schema**
   ```bash
   npx prisma db push
   ```
3. **Start the Application**
   ```bash
   npm run dev
   ```

## 🧪 Running Load Tests
To test the system's limits with `k6`:
```bash
Get-Content loadtest.js | docker run --rm -i grafana/k6 run -
```
