@AGENTS.md

## 專案概述

個人工作記錄 dashboard。記錄每日完成的工作，按週瀏覽，並有統計圖表。

## 技術棧

- **Next.js 16** (App Router, `app/` 目錄)
- **PostgreSQL + Prisma 7**（透過 `@prisma/adapter-pg` 初始化）
- **Docker Compose** 跑本地 DB（`docker compose up -d`）
- **Neon** 作為 production DB（尚未設定）
- **Tailwind CSS + Recharts**（圖表）
- **部署目標**：Vercel

## 路由結構

```
/                        首頁，顯示週塊列表 + 統計圖表
/week/[weekStart]        該週的工作清單，依 BUG / UI / MISC 分組
/entries/[id]            單筆工作詳細頁，可編輯、切換類型
```

## API

```
GET    /api/entries?weekStart=YYYY-MM-DD   取得指定週的 entries
POST   /api/entries                        新增 entry
GET    /api/entries/[id]                   取得單筆
PATCH  /api/entries/[id]                   更新（含 type 切換、date 修改）
DELETE /api/entries/[id]                   刪除
GET    /api/stats                          本週/本月統計資料
```

## 資料模型

三種 entry 類型，都有 `customer` 和 `branch` 欄位：

- **BUG**：bugUrl、description、difficulty（EASY/MEDIUM/HARD/VERY_HARD/EXTREME）
- **UI**：clientName、figmaUrl
- **MISC**：description

Parent model `WorkEntry` 持有 date、type，並 1-to-1 關聯對應的子 model。

## 重要注意事項

### Prisma 7 breaking changes
- `schema.prisma` 的 `datasource` 不再寫 `url`，URL 改在 `prisma.config.ts`
- `PrismaClient` 必須用 adapter 初始化，見 `lib/prisma.ts`：
  ```ts
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  new PrismaClient({ adapter });
  ```
- `schema.prisma` 改完要依序執行：
  1. `npx prisma migrate dev --name xxx`（若在非互動環境失敗，手動寫 SQL 放進 migrations 資料夾，再用 `npx prisma db execute --file ...` 執行）
  2. `npx prisma generate`
  3. **重啟 dev server**（module cache 不會自動更新）

### migrate 在 Claude Code 環境的問題
`prisma migrate dev` 會偵測非互動環境並拒絕執行。遇到需要 data loss 的 migration 時，流程為：
1. 手動建立 migration SQL 檔案
2. `npx prisma db execute --file <path>`
3. `npx prisma migrate resolve --applied <migration_name>`

### 本地開發啟動
```bash
docker compose up -d   # 啟動 PostgreSQL
npm run dev            # 啟動 Next.js（port 3000）
```

## 開發慣例

- entry 的日期計算（週起始等）集中在 `lib/week.ts`
- Prisma client singleton 在 `lib/prisma.ts`
- `branch` 欄位允許空字串，API 驗證用 `== null` 而非 `!value`
