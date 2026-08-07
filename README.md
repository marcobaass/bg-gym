# BG Gym

Backgammon training app built with **Next.js 16**, **React 19**, **Tailwind CSS 4**, and **Supabase** (auth + Postgres).

Paste Extreme Gammon (XG) analysis text, store positions in categories, then train move and cube decisions against XG equities.

---

## Table of contents

1. [Quick start](#quick-start)
2. [Environment variables](#environment-variables)
3. [High-level architecture](#high-level-architecture)
4. [Project structure](#project-structure)
5. [Core data types](#core-data-types)
6. [Storage model (guest vs logged-in)](#storage-model-guest-vs-logged-in)
7. [Database (Supabase)](#database-supabase)
8. [Repository layer](#repository-layer)
9. [Flow: Homepage](#flow-homepage)
10. [Flow: Parser](#flow-parser)
11. [Flow: Board / training](#flow-board--training)
12. [Scoring](#scoring)
13. [Board UI / rendering](#board-ui--rendering)
14. [Auth](#auth)
15. [Default / system categories](#default--system-categories)
16. [LocalStorage keys](#localstorage-keys)
17. [Scripts](#scripts)

---

## Quick start

```bash
npm install
# create .env.local (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Route | Purpose |
|-------|---------|
| `/` | Homepage — categories, stats, login |
| `/parser` | Paste XG text → save positions into categories |
| `/board?categoryId=<uuid>` | Train a shuffled session for that category |

---

## Environment variables

Create `.env.local` (and set the same on Vercel for production):

| Variable | Where used | Purpose |
|----------|------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `utils/supabase/*` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `utils/supabase/*` | Supabase anon / publishable key |
| `NEXT_PUBLIC_CURATOR_USER_ID` | `utils/userLibrary.ts` → `insertCategoryToSupabase` | Auth user UUID whose new categories get `visibility: "system"` (official defaults) |

Also configure Supabase Auth redirect URLs for local and production origins.

---

## High-level architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  app/page   │     │  app/parser  │     │  app/board      │
│  Homepage   │     │  ParserInput │     │  BoardPageClient│
└──────┬──────┘     └──────┬───────┘     └────────┬────────┘
       │                   │                      │
       └───────────────────┼──────────────────────┘
                           ▼
                 ┌───────────────────┐
                 │ utils/repository  │  ← guest vs user switch
                 └─────────┬─────────┘
              ┌────────────┴────────────┐
              ▼                         ▼
     localStorage                 Supabase tables
     UserLibrary                  categories
     SessionHistory               positions
                                  category_sessions
```

**Rule of thumb:** UI never talks to localStorage/Supabase directly for library/sessions (except parser guest branches that still touch local helpers). Prefer `utils/repository.ts`, which delegates to `utils/userLibrary.ts`.

---

## Project structure

```
app/
  layout.tsx                 Root layout
  page.tsx                   Homepage (categories + stats)
  parser/page.tsx            Parser page shell
  board/
    page.tsx                 Suspense wrapper (useSearchParams)
    BoardPageClient.tsx      Training session UI + state
    _hooks/
      useBoardDestinationClick.ts   Apply checker move on destination click
      useBoardSubmitCubeDecision.ts Score + show cube results

components/
  ParserInput.tsx            XG paste form, category select, save
  ResultsModal.tsx           Move/cube results + next/done
  BoardRenderer.tsx          Composes board visuals
  board/
    BoardPoints.tsx          Clickable points
    BoardCheckers.tsx        Checker stacks
    Dice.tsx                 Dice display
    DestinationIndicators.tsx Legal landing dots
    DoublingCube.tsx         Cube value / owner
    BornOffCheckers.tsx      Bear-off area
    boardUtils.ts            Layout helpers
    trainer/
      PositionHeader.tsx
      NavigationControls.tsx (unused / commented in client)
      CubeDecisionButtons.tsx No Double / Double-Take / Double-Pass
      SubmitButton.tsx        Confirm move or cube decision
  auth/
    Login.tsx                Login / logout button + email
    LoginModal.tsx           Email magic-link / auth UI
  stats/
    ratingDots.jsx           Avg-score color dots
    lastPlayed.jsx           Last session time
    accuracyRing.jsx         Score ring on cards

utils/
  repository.ts              Guest ↔ Supabase facade
  userLibrary.ts             Load/save library, sessions, import, CRUD
  xgid-parser.ts             XG text → Position
  cubeDecision-utils.ts      Cubeful equities → summary for scoring
  move-utils.ts              Legal moves, point validity
  compareBestMoves-utils.ts  User play vs top XG moves
  scoring-utils.ts           Equity diff → points
  uiReducer.ts               Board interaction state machine
  renderer-utils.ts          Rendering helpers
  supabase/
    client.ts                Browser Supabase client
    server.ts                Server Supabase client
    middleware.ts            Session refresh helper

types/board.ts               Shared domain types
proxy.ts                     Next proxy → updateSession (auth cookies)
```

---

## Core data types

Defined in `types/board.ts`.

### `Position`

One training position (from XG parse). Important fields:

| Field | Meaning |
|-------|---------|
| `analysisType` | `"Move"` or `"Cube"` (string in stored data) |
| `points` | 24 board points (`Point`: `id`, `owner`, `count`) |
| `barWhite` / `barBlack` | Checkers on bar |
| `whiteOff` / `blackOff` | Borne off |
| `diceRoll` | Encoded as `10*d1 + d2` (e.g. `52` = 5-2); doubles expand to four dice in UI |
| `playerToPlay` | `"White"` \| `"Black"` |
| `bestMoves` | Ranked moves with `equity` (move positions) |
| `cubeActions` | Cubeful equity lines + optional `{ bestAction }` entry |
| `cubeValue` / `cubeOwner` | Cube state (`owner` `"none"` = centered) |
| `pipCount*` / `score*` / `matchLength` / `crawford` | Match metadata |

### `Category` / library

```ts
Category { id, name, visibility?: "private" | "system" | "public" }
PositionCategory { category, positions: Position[] }
UserLibrary { library: PositionCategory[] }
```

- **`private`** — user’s own categories (“Your Categories”)
- **`system`** — curator defaults (“Default Categories”)
- **`public`** — reserved for future sharing

### Sessions

```ts
CategorySession {
  id, categoryId, finishedAt,   // finishedAt = Date.now() ms
  positionsPlayed, rawTotalScore, scorePerPosition
}
SessionsByCategory { [categoryId]: CategorySession[] }  // kept to last 10
```

### Cube decisions (UI)

```ts
CubeDecision = "No Double" | "Double/Take" | "Double/Pass"
```

“Too good to double / Pass” from XG is **not** a user button. For scoring it maps to **No Double**; the raw best-action string is shown in `ResultsModal`.

### Board UI state (`utils/uiReducer.ts`)

| Field | Role |
|-------|------|
| `currentPosition` | Working copy of the position (mutated as checkers move) |
| `selectedPoint` | Origin point (`-1` / `-2` = white/black bar) |
| `availableMoves` | Legal destinations |
| `remainingDice` | Unused die values |
| `moves` | Played legs `{ from, to }[]` |
| `score` / `totalScore` | Last position points / session total |
| `moveHistory` | Snapshots for undo |

Actions: `POSITION_CHANGED`, `SELECT_POINT`, `SET_MOVES`, `SET_DICE`, `ADD_SCORE`, `APPLY_MOVE`, `UNDO_MOVE`.

---

## Storage model (guest vs logged-in)

| Concern | Guest | Logged-in |
|---------|-------|-----------|
| Categories + positions | `localStorage` key `UserLibrary` | Supabase `categories` + `positions` |
| Session history | `localStorage` key `SessionHistory` | Supabase `category_sessions` |
| First login | — | `importLocalStorageToSupabase` merges local → cloud, then clears local library/sessions |

Homepage runs import when `user` is set (`app/page.tsx`).

---

## Database (Supabase)

Expected tables (accessed from `utils/userLibrary.ts`):

### `categories`

| Column | Notes |
|--------|-------|
| `id` | UUID (client-generated) |
| `user_id` | Owner |
| `name` | Display name |
| `visibility` | `private` \| `system` \| `public` |

RLS (intended): SELECT own rows **or** `visibility = 'system'`; write only as owner (system content via curator account).

### `positions`

| Column | Notes |
|--------|-------|
| `category_id` | FK |
| `user_id` | Owner |
| `data` | JSON `Position` |

### `category_sessions`

| Column | Notes |
|--------|-------|
| `id` | Session UUID |
| `category_id` | FK |
| `user_id` | Who trained |
| `finished_at` | ms timestamp |
| `positions_played` | Count |
| `score_per_position` | Average |
| `raw_total_score` | Sum |

After insert, cloud keeps at most **10** sessions per category (trim oldest).

---

## Repository layer

`utils/repository.ts` — single switch on `user`:

| Function | Guest | User |
|----------|-------|------|
| `getUserLibrary` | `loadUserLibrary()` | `loadUserLibraryFromSupabase` |
| `getSessionHistory` | `loadSessionHistory()` | `loadSessionHistoryFromSupabase` |
| `insertCategory` / `insertPosition` | no-op (parser writes local itself) | Supabase insert |
| `saveCategorySession` | `saveCategorySession` local | `saveCategorySessionToSupabase` |
| `deleteCategory` | Filter local library + sessions | Delete sessions → positions → category |
| `saveUserLibrary` | Local save | TODO (not implemented for cloud full replace) |

---

## Flow: Homepage

**Files:** `app/page.tsx`, `components/auth/Login.tsx`, `components/stats/*`, `utils/repository.ts`

### State

| State | Purpose |
|-------|---------|
| `userLibrary` | Loaded categories + positions |
| `sessionHistory` | Sessions by category |
| `selectedCategory` | Sort mode: `default` \| `weakest` \| `most` \| `recently` \| `longest` |
| `user` | Supabase auth user |

### Steps

1. Auth: `getUser` + `onAuthStateChange`.
2. If logged in → `importLocalStorageToSupabase`.
3. `getUserLibrary` + `getSessionHistory`.
4. Split library:
   - `visibility === "system"` → Default Categories
   - `visibility === "private"` → Your Categories (sortable)
5. Card → `/board?categoryId=…`
6. Delete (your categories only) → `deleteCategory` + confirm in UI.

Stats helpers: `getCategoryAverageScore`, `RatingDots`, `LastPlayed`, `AccuracyRing`.

---

## Flow: Parser

**Files:** `app/parser/page.tsx`, `components/ParserInput.tsx`, `utils/xgid-parser.ts`

### State (`ParserInput`)

| State | Purpose |
|-------|---------|
| `xgidValue` | Pasted XG text |
| `activeTab` | `"Move"` \| `"Cube"` — must match parsed `analysisType` |
| `categoryId` | Existing id or `SENTINEL` (`__CREATE_NEW_CATEGORY__`) |
| `newCategoryName` | Name when creating |
| `folders` | Current library for the select |
| `error` / `success` | Form feedback |
| `user` | Auth |

Also uses `lastCategoryId` in localStorage to preselect the last folder.

### Steps

1. Load folders via `getUserLibrary`.
2. User pastes XG export → `createBoardStateFromXgid(xgidValue)`.
3. Validations:
   - Parse failed → error
   - `analysisType !== activeTab` → error
   - Move with only one `bestMoves` entry → “forced move” rejected
4. **New category** (`SENTINEL`):
   - Logged-in: `insertCategory` + `insertPosition` (curator → `visibility: system`)
   - Guest: push into `UserLibrary` localStorage (`visibility` may be omitted for old guests)
5. **Existing category:** append position (Supabase or local).
6. Remember `setLastCategoryId`.

### XGID parser (`utils/xgid-parser.ts`)

- Splits `XGID=…` colon fields (board, cube, turn, dice, score, Crawford, match length).
- Detects Move vs Cube analysis.
- Parses ranked moves → `bestMoves`.
- Parses cubeful equity lines → `{ action, equity }[]`.
- Parses `Best Cube action: …` → `{ bestAction }` (e.g. `"Too good to double / Pass"`).

---

## Flow: Board / training

**Files:**

- `app/board/page.tsx` — `Suspense` around client (required for `useSearchParams`)
- `app/board/BoardPageClient.tsx` — orchestration
- Hooks under `app/board/_hooks/`
- `utils/uiReducer.ts`, `move-utils.ts`, `compareBestMoves-utils.ts`, `cubeDecision-utils.ts`

### State (`BoardPageClient`)

| State | Purpose |
|-------|---------|
| `positionData` | Shuffled positions for this session |
| `currentPositionIndex` | Active index |
| `ui` | `uiReducer` board interaction + scores |
| `resultsModal` | Show `ResultsModal` |
| `result` | Matched `Move` from best list (move positions) |
| `cubeDecision` | Selected cube button |
| `cubeOptions` / `cubePoints` | Rows + points for cube modal |
| `user` | Auth (for saving session) |

Query: `categoryId` from `useSearchParams`.

### Session lifecycle

```
Load library → find category → shuffle positions
        ↓
POSITION_CHANGED (reset dice, clear moves, keep totalScore)
        ↓
   ┌──── Move position ────┐    ┌──── Cube position ────┐
   │ Click checker         │    │ Pick CubeDecision     │
   │ Destinations light up │    │ Submit when selected  │
   │ APPLY_MOVE / UNDO     │    └──────────┬────────────┘
   │ Submit when dice used │               │
   └──────────┬────────────┘               │
              ▼                            ▼
         Score + ResultsModal
              ↓
    Next position  OR  Done → save CategorySession → /
```

### Move path

1. `handleCheckerClick` → `isValidPoint` → `SELECT_POINT` + `getAvailableMoves` → `SET_MOVES`.
2. Destination click → `useBoardDestinationClick` → `APPLY_MOVE` (hits, bar, bear-off in reducer).
3. Undo → `UNDO_MOVE` from `moveHistory`.
4. Submit enabled when `remainingDice.length === 0`.
5. `compareWithBestMoves(ui.moves, bestMoves, userColor)`:
   - Normalizes journeys and White/Black point notation
   - No match → **0** points
   - Match → `pointsFromEquityDiff(bestEquity, userEquity)`
6. `ADD_SCORE` + open modal.

### Cube path

1. Buttons: No Double / Double-Take / Double-Pass (labels switch to Redouble when `cubeOwner !== "none"`).
2. Submit enabled when `cubeDecision !== null`.
3. `buildCubeDecisionsSummary(cubeActions)`:
   - Options from numeric cubeful lines
   - Best text: `"too good…"` → treat as **`No Double`** for equity reference; otherwise map No Double / Take / Pass
4. Score vs best option equity; build `cubeOptions` rows; open modal.
5. Modal still shows raw `bestAction` text (“Too good to double / Pass”, etc.).

### End session

`handleSessionDone` builds `CategorySession`, `saveCategorySession`, `router.push("/")`.

---

## Scoring

`utils/scoring-utils.ts` — `pointsFromEquityDiff(bestEquity, userEquity)`:

| \|Δequity\| | Points |
|-------------|--------|
| ≤ 0.02 | 6 |
| &lt; 0.08 | 3 |
| else | 1 |

Move: unknown play (not in top list) → **0**.

Session card average uses `scorePerPosition` over up to 10 recent sessions.

---

## Board UI / rendering

`BoardRenderer` receives:

- `positionData` (= `ui.currentPosition`)
- `selectedPoint`, `availableMoves`, `remainingDice`
- `onCheckerClick`, `onDestinationClick`

Child components draw points, stacks, bar, bear-off, dice, cube, and destination indicators. Layout helpers live in `components/board/boardUtils.ts` and `utils/renderer-utils.ts`.

`ResultsModal`:

- Move: list `bestMoves` with equity loss coloring
- Cube: list `cubeOptions` + **Best Choice** from `{ bestAction }`
- Points for this position + running `totalScore`
- Last position → **Done**; else **Next**

---

## Auth

| File | Role |
|------|------|
| `components/auth/Login.tsx` | Login button / Logout + email |
| `components/auth/LoginModal.tsx` | Sign-in UI |
| `utils/supabase/client.ts` | Browser client |
| `utils/supabase/server.ts` | Server client |
| `utils/supabase/middleware.ts` | Refresh session cookies |
| `proxy.ts` | Next request proxy calling `updateSession` |

No hard route guards: guests can train and parse using localStorage.

---

## Default / system categories

1. Curator account UUID = `NEXT_PUBLIC_CURATOR_USER_ID`.
2. When that user creates a category via parser → `visibility: "system"`.
3. Everyone (with RLS) can **read** system categories; only owner/curator writes them.
4. Homepage shows system under **Default Categories** (no delete).
5. Training sessions for defaults are still **per user** in `category_sessions`.

Guests currently rely on local `UserLibrary` only (no system defaults unless added later via anon RLS or bundled JSON).

---

## LocalStorage keys

| Key | Contents |
|-----|----------|
| `UserLibrary` | `UserLibrary` JSON |
| `SessionHistory` | `SessionsByCategory` JSON |
| `lastCategoryId` | Last parser category id |

Cleared (library + sessions + last category) after successful cloud import.

---

## Scripts

```bash
npm run dev      # Next.js dev server
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```

---

## Mental model (cheat sheet)

| I want to… | Look here |
|------------|-----------|
| Change how guests vs users save data | `utils/repository.ts` → `utils/userLibrary.ts` |
| Change XG parsing | `utils/xgid-parser.ts` |
| Change move legality / clicks | `utils/move-utils.ts`, `uiReducer`, board hooks |
| Change move matching vs XG | `utils/compareBestMoves-utils.ts` |
| Change cube scoring | `utils/cubeDecision-utils.ts`, `useBoardSubmitCubeDecision.ts` |
| Change points bands | `utils/scoring-utils.ts` |
| Change category cards / sort | `app/page.tsx` |
| Change parser UX | `components/ParserInput.tsx` |
| Change training UX | `app/board/BoardPageClient.tsx` |
| Change types | `types/board.ts` |
