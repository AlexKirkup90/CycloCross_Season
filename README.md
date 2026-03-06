# CX Season Command

> **Elite Cyclocross Coaching & Athlete Management Platform**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)

---

## What This Is

CX Season Command is a professional cyclocross coaching platform that replaces manual Google Sheets workflows with a structured, data-driven system. It generates personalised training programmes, provides an 80-session elite CX session library, tracks compliance and training load, and lays the foundation for ML-driven adaptive programming.

**Three user tiers:**
- **Athlete** — See plan, log sessions, track personal progress
- **Coach** — Manage athletes, build programmes, review compliance and analytics
- **Admin** — Full platform oversight, user management, session library editor

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Deployment | Vercel (Phase 8) |
| Charts | Pure SVG (no Recharts) |

---

## Design System

```
Primary Navy:    #0F1F3D  — sidebar, topbar, primary brand
Sky Blue:        #38BDF8  — actions, highlights, active states
White:           #FFFFFF  — content surfaces
Surface:         #F4F7FB  — page background
Border:          #D1DDF0  — card borders

Text Primary:    #0F1F3D
Text Secondary:  #4A5E7A
Text Muted:      #8A9BB5

Phase colours:
  Foundation:    #8B5CF6
  Base:          #3B82F6
  Build:         #F97316
  Peak:          #EF4444
  Taper:         #22C55E
  Recovery:      #6B7280
```

**Rules:**
- `text-white` ONLY inside navy backgrounds
- `text-text-primary` inside all white/surface backgrounds
- Full-width layouts — no narrow centred column
- Sidebar navigation on desktop, bottom nav on mobile

---

## Getting Started

### Prerequisites
- Node.js v18+
- A Supabase project (credentials below)

### Local Setup

```bash
# Clone the repo
git clone https://github.com/AlexKirkup90/CycloCross_Season.git
cd CycloCross_Season

# Install dependencies
npm install

# Create .env file (never committed — must be created manually each clone)
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://rsipcbieckncnhlkgcnw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzaXBjYmllY2tuY25obGtnY257Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MDE4ODgsImV4cCI6MjA4Nzk3Nzg4OH0.535zpaXGS5pVCUwqsrRS6jb8MRba1UZU7zm6PewZdso
EOF

# Start dev server
npm run dev
# Open http://localhost:5173
```

---

## Database

### Supabase Project
- **URL:** `https://rsipcbieckncnhlkgcnw.supabase.co`
- **All tables already exist** — do not re-run schema SQL unless explicitly required by a phase

### Set Your Admin Role
```sql
-- Get your user ID
SELECT id, email FROM auth.users;

-- Set admin role (replace UUID with your actual ID)
INSERT INTO user_roles (user_id, role)
VALUES ('your-uuid-here', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### All Tables

| Table | Purpose | Phase |
|---|---|---|
| `user_roles` | Maps auth users to role (athlete/coach/admin) | 1 |
| `coach_athletes` | Coach-to-athlete assignments | 1 |
| `athletes` | Athlete records (discipline, experience, auth link) | 2 |
| `sessions` | All logged training sessions | 2 |
| `athlete_profiles` | Equipment, availability, benchmarks, FTP | 3 |
| `seasons` | Programme records (target event, length, start date) | 4 |
| `season_weeks` | Individual weeks (phase, TSS target, cutback/race flags) | 4 |
| `plan_day_sessions` | Planned sessions per day per week | 5 |
| `sessions_library` | 80 elite CX sessions (seeded) | 5 |
| `analytics_weekly` | Pre-aggregated CTL/ATL/TSB rollups | 6 |
| `benchmark_history` | FTP/W·kg/VO2/peak over time | 6 |
| `daily_checkins` | Readiness scores (sleep, legs, stress, HRV) | 7 |
| `session_recommendations` | Every recommendation + coach action + outcome | 7 |
| `recommendation_rules` | Editable rules engine config | 7 |
| `athlete_adaptations` | Long-term adaptation tracking | 7 |
| `ml_model_runs` | Audit log of all ML predictions | 7 |
| `training_load_weekly` | Detailed weekly load tracking | 7 |

---

## Key Source Files

```
src/
├── lib/
│   ├── supabase.js              — Supabase client singleton
│   ├── version.js               — APP_VERSION, BUILD_PHASE, LAST_UPDATED
│   ├── programmeGenerator.js    — Phase structure from target event + length
│   ├── autoPlanEngine.js        — Auto-populates full plan from athlete profile
│   ├── planValidator.js         — Plan quality scoring (0–100, error/warning/info)
│   ├── planAdaptationLayer.js   — ML bridge stubs (Phase 7 plugs in here)
│   ├── analyticsEngine.js       — CTL/ATL/TSB calculations, weekly rollup
│   └── readinessCalculator.js   — Readiness score 0–100 from check-in inputs
├── context/
│   └── AuthContext.jsx          — session, userRole, isAdmin, isCoach, signIn, signOut
├── hooks/
│   ├── useAthletes.js
│   ├── useSessions.js
│   ├── useSeasons.js
│   ├── useSeasonWeeks.js
│   ├── useMissionData.js        — Today's planned session for Mission Banner
│   ├── useSessionLibrary.js     — Filter sessions_library by profile/phase/modality
│   ├── usePlanDaySessions.js    — Add/remove/publish plan sessions for a week
│   ├── useAnalytics.js          — Fetch analytics_weekly, expose rebuild()
│   └── useBenchmarkHistory.js
├── components/
│   ├── Sidebar.jsx
│   ├── Topbar.jsx               — Global athlete selector
│   ├── BottomNav.jsx            — Mobile navigation
│   ├── MissionBanner.jsx        — Today's session from live plan data
│   ├── WeekView.jsx             — 7-day plan view (Done/Planned/Missed/Rest)
│   ├── PlanBuilder.jsx          — Session assignment UI with library browser
│   ├── SessionDetailModal.jsx   — Full session detail (warmup/main/cooldown)
│   ├── AthleteProfile.jsx       — Equipment, availability, benchmark display
│   └── AnalyticsDashboard.jsx   — CTL/ATL/TSB, benchmark trends, compliance
└── pages/
    ├── LoginPage.jsx
    ├── DashboardPage.jsx        — Coach home, athlete cards, today's sessions
    ├── AthletesPage.jsx
    ├── SeasonPage.jsx           — Season map, week grid, plan builder
    ├── AnalyticsPage.jsx
    └── SettingsPage.jsx
```

---

## Programme Architecture

Programmes build **backwards from a target event date**.

### Available Lengths
8 / 12 / 16 / 20 / 24 / 32 / 48 weeks

### Phase Distribution

| Length | Phases |
|---|---|
| 8wk | Peak(50%) Taper(25%) |
| 12wk | Build(42%) Peak(33%) Taper(25%) |
| 16wk | Base(37%) Build(31%) Peak(19%) Taper(13%) |
| 20wk | Base(30%) Build(30%) Build2(15%) Peak(15%) Taper(10%) |
| 24wk | Base(25%) Base2(17%) Build(25%) Build2(13%) Peak(13%) Taper(8%) |
| 32wk | Foundation(9%) Base(22%) Base2(16%) Build(22%) Build2(12%) Peak(12%) Taper(7%) |
| 48wk | Foundation(10%) Base(21%) Base2(13%) Build(21%) Build2(10%) Peak(15%) Taper(10%) |

### Cutback Rules
- Base/Foundation: every 4th week (3:1 loading)
- Build: every 3rd week (2:1 loading)
- Peak: alternating race-sim and cutback
- Taper: progressive decline only (70% → 50% → -15%/week of Peak TSS)

---

## Auto-Plan Engine

When a programme is created, `autoPlanEngine.js` populates every week automatically from the athlete's profile.

### Phase Session Mix (% of weekly sessions)

| Phase | Z2 | Nordic | Threshold | Race Sim | Skills | Recovery | Benchmark |
|---|---|---|---|---|---|---|---|
| Foundation | 60% | — | — | — | 25% | — | 15% |
| Base | 50% | 10% | 25% | — | 15% | — | — |
| Base2 | 40% | 20% | 30% | — | 10% | — | — |
| Build | 30% | 35% | 20% | 10% | 5% | — | — |
| Build2 | 25% | 35% | 15% | 20% | 5% | — | — |
| Peak | 20% | 35% | — | 30% | — | 15% | — |
| Taper | 40% | — | — | — | 25% | 35% | — |

### Filtering Rules
- **Equipment:** exclude sessions requiring kit the athlete doesn't have
- **Experience:** only sessions tagged for athlete's level
- **Duration:** exclude sessions exceeding `max_session_mins`
- **Phase:** only sessions valid for current phase
- **Discipline:** road = no CX skills/nordic; gravel = no CX-specific skills

### Day Assignment (priority order)
1. Never two high-intensity sessions on consecutive days
2. Longest Z2 on Saturday or Sunday
3. Nordic/VO2 prefer Tuesday/Thursday
4. Skills standalone, not adjacent to hard sessions
5. Recovery day after race_sim or hardest session
6. Benchmark only in first week of Foundation or Base

---

## Session Library (80 Sessions)

All sessions seeded in `sessions_library` table.

| Modality | Count | Categories |
|---|---|---|
| Turbo/WattBike | 28 | Z2 endurance, Threshold, VO2max, Sprint, Race Sim, Benchmark |
| Nordic Intervals | 20 | Prep (1:1.5), Build (1:1), Intensification (1:0.75), Race Specific (1:0.5) |
| Outdoor/Road | 18 | Long endurance, Tempo/Threshold, CX-specific, Pre/Post race |
| Skills & Technical | 14 | Dismounts, Cornering, Carrying, Sand/Mud, Full circuits |

Each session includes: warmup, main set, cooldown, power zone, % FTP targets, HR zone, RPE, TSS estimate, valid phases, progression/regression links, equipment requirements, coaching notes.

**Nordic Intervals methodology (CX-specific):**
- Early Prep: 1:1.5 ratio (20s on / 30s off)
- Build: 1:1 ratio (30s on / 30s off)
- Intensification: 1:0.75 ratio (40s on / 30s off)
- Race Specific: 1:0.5 ratio (60s on / 30s off)
- Intensity: Z6–Z7 (>120% FTP)

---

## Analytics

### CTL / ATL / TSB Calculations

```
CTL (Fitness, 42-day EMA):   CTL_today = CTL_yesterday + (TSS_today - CTL_yesterday) / 42
ATL (Fatigue, 7-day EMA):    ATL_today = ATL_yesterday + (TSS_today - ATL_yesterday) / 7
TSB (Form):                  TSB = CTL - ATL   (positive = fresh, negative = fatigued)
```

### TSS Estimation by Session Type
- Z2 Base: 42 TSS/hr
- Intervals: 72 TSS/hr
- Race Sim: 81 TSS/hr
- Benchmark: 90 TSS/hr

---

## Phase 7 — ML Engine (Architecture)

### Automation Arc
```
Circle 1 (rules-based now):     System flags → coach acts
Circle 2 (6–12 months):         System suggests → coach approves
Circle 3 (12–24 months):        System acts → coach reviews
```

### Readiness Score (0–100)
Calculated from daily check-in inputs:
- Sleep quality penalty (max -25)
- Sleep hours penalty (max -15)
- Leg freshness penalty (max -20)
- Life stress penalty (max -15)
- Motivation penalty (max -10)
- HRV delta penalty/bonus (max ±20)
- Hard overrides: illness → cap at 30, injury → cap at 40

**Bands:** ≥80 = optimal, ≥60 = green, ≥40 = amber, <40 = red

### ML Bridge
`planAdaptationLayer.js` contains stubs marked `// PHASE 7:` throughout. Phase 7 replaces these stubs with real recommendation logic. The interface is already defined — only the intelligence changes.

---

## Build Workflow

This project is built using **Claude as PM + Codex as builder**.

```
1. Claude provides a Codex prompt for each phase
2. Codex executes the prompt against the GitHub repo
3. Changes are committed to main branch
4. Developer pulls locally: git pull && npm install && npm run dev
5. Verify at http://localhost:5173
6. Report back to Claude — next phase prompt provided
```

**SQL files:** Each phase may generate a SQL file. Check if tables already exist before running — all schema from Phase 1–7 is already seeded in Supabase.

**Token limits:** If a Codex prompt hits output limits, it will be split into numbered runs (e.g. Run 1/2, Run 2/2). Always run in order.

**If something breaks:** Describe the symptom to Claude — a targeted fix prompt will be provided rather than a full rebuild.

---

## Phase Roadmap

| Phase | Title | Status |
|---|---|---|
| 1 | Foundation — scaffold, auth shell, navigation | 🔄 In Progress |
| 2 | Database + Session Logging | ⏳ Pending |
| 3 | Athlete Profiles | ⏳ Pending |
| 4 | Programme Generator + Season Map | ⏳ Pending |
| 5 | Session Library + Plan Builder | ⏳ Pending |
| 5.5b | Auto-Plan Engine | ⏳ Pending |
| 5.5a | UI Overhaul + Full Plan Display | ⏳ Pending |
| 6 | Analytics Dashboard | ⏳ Pending |
| 7 | ML Engine | ⏳ Pending |
| 8 | Athlete View + Deploy | ⏳ Pending |

### Phase 1 — Foundation
Vite + React 18 + Tailwind scaffold. Design system tokens. Navy sidebar + topbar + mobile bottom nav. Auth context (session/role/signIn/signOut). Login page. Protected routes. 5 page placeholders. Supabase client.

### Phase 2 — Database + Session Logging
`athletes` and `sessions` tables with RLS. Log Session form (5 types: Z2 Base, Intervals, Race Sim, Benchmark, Monthly Review). Session history list. Benchmark auto-syncs to `athlete_profiles`.

### Phase 3 — Athlete Profiles
`athlete_profiles` table. Full profile editor: discipline, indoor/outdoor equipment, available days, max sessions/week, max duration, experience level. Benchmark display (read-only, auto-populated). Add athlete form.

### Phase 4 — Programme Generator + Season Map
`seasons` + `season_weeks` tables. `programmeGenerator.js` (pure JS). Phase distribution for all 8 programme lengths. Cutback week auto-insertion. Season creation form with phase preview. Compact 4-column week grid. Split panel week editor.

### Phase 5 — Session Library + Plan Builder
`sessions_library` + `plan_day_sessions` tables. All 80 sessions seeded. `useSessionLibrary` + `usePlanDaySessions` hooks. Plan Builder 7-day grid with library browser. Session Detail Modal (full warmup/main/cooldown). TSS tracker. Publish week.

### Phase 5.5b — Auto-Plan Engine
`autoPlanEngine.js` — phase mix, equipment/experience/duration/phase filtering, day assignment, progressive overload, cutback TSS cap, race week overrides, taper decline. `planValidator.js` (7 checks, 0–100 score). `planAdaptationLayer.js` ML stubs. Updated season creation flow with Generate Plan → Preview → Confirm.

### Phase 5.5a — UI Overhaul + Full Plan Display
Design system applied everywhere. Coach Dashboard with athlete cards and today's session. `WeekView` component (7-day horizontal, Done/Planned/Missed/Rest). Mission Banner (live plan data, correct date range query). Season Timeline. Mobile layout.

### Phase 6 — Analytics Dashboard
`analytics_weekly` + `benchmark_history` tables. `analyticsEngine.js` (CTL/ATL/TSB). Auto-insert benchmark history on save. Analytics page: headline stats, benchmark trends chart, PMC chart (TSS + CTL/ATL/TSB), session mix donut, compliance bars.

### Phase 7 — ML Engine
Daily check-in modal. `readinessCalculator.js`. `recommendationEngine.js` (rules-based). Coach action queue (approve/override/modify). Decision log. Load guardrails. Weekly athlete reports. Synthetic data generator (50 athletes × 2 seasons to bootstrap ML).

### Phase 8 — Athlete View + Deploy
Athlete-facing pages (Today view, My Plan, My Progress). Admin panel (user management, session library editor, rules editor). Vercel deployment. Mobile optimisation. Smoke test checklist.

---

## Context for New LLMs / Developers

If you're picking this project up fresh:

1. **The database is fully seeded** — all 16 tables exist in Supabase, including 80 sessions in `sessions_library`. Do not recreate schema unless a phase explicitly requires it.

2. **The build pattern** — Claude writes the prompt, Codex builds the code. Each phase is self-contained. Never skip a phase — each builds on the previous.

3. **The design system** — white/navy/sky blue. Navy (`#0F1F3D`) for sidebar/topbar. Sky blue (`#38BDF8`) for actions. White surfaces everywhere else. `text-white` only on navy backgrounds.

4. **The core IP** — `autoPlanEngine.js` is the most important file. It generates physiologically correct training plans from athlete profiles. Every downstream feature (analytics, ML, athlete view) depends on it producing a populated plan.

5. **The ML bridge** — `planAdaptationLayer.js` has stubs marked `// PHASE 7:`. Do not modify these until Phase 7. They define the interface that the ML engine will plug into.

6. **Session logging types:**
   - `Z2_Base` — endurance base
   - `Intervals` — structured intensity
   - `Race_Sim` — race simulation
   - `Benchmark` — FTP/power tests (auto-syncs to athlete profile)
   - `Monthly_Review` — readiness and life stress check-in

7. **Power targets** are always calculated dynamically: `power_pct_low / 100 * athlete.current_ftp`. Never hardcoded.

8. **Compliance** = sessions logged vs sessions planned in `plan_day_sessions` for the date range.

---

## Supabase Helper Function

This function must exist in Supabase (created in Phase 1):

```sql
CREATE OR REPLACE FUNCTION get_auth_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid();
$$;
```

Used in RLS policies throughout to avoid infinite recursion when checking admin status.

---

*CX Season Command — Built by Alex Kirkup · Coached by Claude · Built by Codex*
