# Vissocial MVP (Next.js + Tailwind + BullMQ + Postgres + fal.ai)

This repo is a functional MVP skeleton for:
- Instagram-first onboarding (month-based)
- Product detection + confirmation
- Monthly plan generation (LLM)
- Rendering (Flux via fal.ai) + Free watermarking
- Calendar + per-post regenerate
- Pro-only regenerate whole month
- Export (CSV+ZIP)
- Scheduling/publishing stubs (ready for Instagram Graph API later)

## 1) Start infra
```bash
docker compose up -d
```

## 2) Install
```bash
cp .env.example .env
npm i
```

## 3) Migrate DB
```bash
npm run migrate
```

## 4) Start app
```bash
npm run dev
```

## 5) Start workers (separate terminal)
```bash
npm run worker
```

### Notes
- Instagram OAuth + Graph publishing are stubs until you add Meta App + permissions.
- `llm.ts` uses fetch to OpenAI; replace with official SDK if preferred.
- `fal.ts` endpoint is a placeholder; set to your actual fal model slug.


## v2 updates (1/2/3)
- Pro-only regenerate whole month: POST /api/easy/regenerate-month
- Auto-enqueue preview renders after plan.generate
- Worker writes job status/result/error into Postgres jobs table; calendar polls last_generate_job

## v3 updates
- Calendar shows thumbnails from latest succeeded renders
- Item editor: approve/unapprove, edit caption, schedule fields (MVP flags)
- Export ZIP includes per-post caption.txt + downloaded preview media_1.jpg when available
