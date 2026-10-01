# AGENTS.md — Operational Source of Truth

> **Universal Agent Guideline:** This document is the single, vendor-agnostic operational specification for any AI agent or coding assistant operating in this codebase. Agents must adhere strictly to the constraints, architecture, conventions, and verification loops detailed below.

---

## 1. Project Overview & Scope

- **Project Name:** Zawa Zawa RPS (*Restricted Rock-Paper-Scissors* / *Piedra, Papel o Tijera Restringido*)
- **Inspiration:** The Espoir gambling ship arc from the manga/anime *Kaiji*.
- **Concept:** Local high-stakes tactical card-trading game where 1 human player duels against 1 to 7 configurable AI bots.
- **Visual Aesthetic:** Dark Industrial Kaiji.
  - Palette: Asphalt grey / deep black (`#0d0d0d`, `#1a1a1a`), alarm crimson accent (`#e60000`), gamble star gold (`#ffb703`), digital LED yellow/neon green (`#39ff14`).
  - Tone: Tense, mechanical, high-contrast, atmospheric.

---

## 2. Technical Stack & Strict Constraints

| Layer | Technology | Rules & Restrictions |
|---|---|---|
| **Framework** | React 19 | Modern functional components, standard hooks. |
| **Language** | TypeScript (Strict Mode) | No `any`, explicit interface/type contracts for all domain models. |
| **Build Tool** | Vite | Fast HMR and standard ESM build pipeline. |
| **Styling** | Native CSS Modules (`.module.css`) | **Strictly apply BEM** (`block__element--modifier`). Pure modern CSS. |
| **Testing** | Vitest + React Testing Library | Co-located unit/integration tests following the AAA pattern. |

### Strict Prohibitions (Zero Tolerance)
- ❌ **NO Tailwind CSS:** Tailwind is strictly forbidden. Disregard any generic templates suggesting Tailwind.
- ❌ **NO Sass, Less, or CSS-in-JS libraries:** Rely solely on modern native CSS within CSS Modules.
- ❌ **NO Third-party UI component libraries:** No MUI, Shadcn UI, Chakra, AntD, Mantine, etc. Every component must be built natively.
- ❌ **NO Loose Boolean State Flags:** Disallowed: `isDueling`, `isTrading`, `isSelecting`, `isResolving`. State transitions must flow strictly through the Finite State Machine (FSM).
- ❌ **NO Vendor-Specific Agent Artifacts:** Do not generate or depend on `.cursor/`, `.cursorrules`, `CLAUDE.md`, or vendor-locked rule directories. `AGENTS.md` is the sole authority.

---

## 3. Quick Execution & Verification Commands

All agents must execute and validate against these exact commands:

```bash
# Development server (Local HMR)
npm run dev

# Full production build
npm run build

# Type checking (TypeScript strict verification)
npm run typecheck      # or: npx tsc --noEmit

# Static code analysis (Linter)
npm run lint

# Complete test suite
npm test               # or: npx vitest run

# Run a single test file (Atomic verification)
npx vitest run src/path/to/target.spec.ts
```

---

## 4. Architecture & Core Principles

### 4.1 Feature-First & Co-location
- Group related components, styling, unit tests, and local helpers together in the same directory.
- Avoid technical-layer dumping grounds (e.g., do not separate tests into a disconnected `tests/` tree far from source files).
- Keep domain types in `src/types/` and reusable hooks in `src/hooks/`.

```
src/
├── components/
│   ├── Scoreboard/
│   │   ├── Scoreboard.tsx
│   │   ├── Scoreboard.module.css
│   │   └── Scoreboard.spec.tsx
│   ├── DuelModal/
│   │   ├── DuelModal.tsx
│   │   ├── DuelModal.module.css
│   │   └── DuelModal.spec.tsx
│   ├── PlayerHand/
│   │   ├── PlayerHand.tsx
│   │   ├── PlayerHand.module.css
│   │   └── PlayerHand.spec.tsx
│   └── LobbyGrid/
│       ├── LobbyGrid.tsx
│       ├── LobbyGrid.module.css
│       └── LobbyGrid.spec.tsx
├── hooks/
│   ├── useGameEngine.ts
│   └── useGameEngine.spec.ts
├── logic/
│   ├── botStrategy.ts
│   └── botStrategy.spec.ts
└── types/
    └── game.ts
```

### 4.2 State Management: Finite State Machine (FSM)
State **must** be implemented via `useReducer` in `src/hooks/useGameEngine.ts`.

#### FSM Phases:
```
[LOBBY] ──► [DUEL_SELECTION] ──► [DUEL_REVEAL] ──► [ROUND_RESOLVE] ──► [GAME_OVER]
   ▲                                                     │
   └─────────────────── (Next Round) ────────────────────┘
```

1. **`LOBBY`**: Player selects a bot opponent from `LobbyGrid` or inspects global market statistics.
2. **`DUEL_SELECTION`**: Human and challenged bot lock in their secret card selection.
3. **`DUEL_REVEAL`**: Both cards are uncovered simultaneously with reveal animations.
4. **`ROUND_RESOLVE`**: Star transfers are resolved, played cards are burned to global discard, and qualification/elimination status is evaluated.
5. **`GAME_OVER`**: Final outcome reached for the human player or all participants.

#### Initial Participant State & Espoir Rules:
- **Cards per Participant:** 12 cards total (4 Rock, 4 Paper, 4 Scissors).
- **Stars per Participant:** 3 stars.
- **Victory Condition (`QUALIFIED`):** 0 cards remaining in hand **AND** at least 3 stars.
- **Defeat Condition (`ELIMINATED`):** 0 stars at any moment **OR** 0 cards remaining with fewer than 3 stars.
- **Card Burning:** Cards played during duels are permanently removed from hands and counted in the global discard pool.

### 4.3 Bot AI Engine (`src/logic/botStrategy.ts`)
Bots must execute distinct, testable decision-making algorithms:
1. **`RandomBot`**: Uniformly picks a card at random from its current hand.
2. **`StrategicBot`**: Reads the global `Scoreboard` card counts and selects the counter to the most abundant remaining card in circulation.
3. **`HoarderBot`**: Tries to retain and accumulate a single dominant card type, playing non-target cards to manipulate market probabilities.

### 4.4 UI & Component Structure
- **`Scoreboard.tsx`**: Industrial LED board displaying remaining aggregate cards (Rock, Paper, Scissors) across all active players and the total discard tally.
- **`PlayerHand.tsx`**: Human player interface displaying remaining card inventory, active duel card choice, and current star count.
- **`LobbyGrid.tsx`**: Opponent bot roster displaying visible star counts, hidden card counts, and real-time status badges (`ACTIVE`, `QUALIFIED`, `ELIMINATED`).
- **`DuelModal.tsx`**: Face-off arena featuring face-down cards, suspenseful reveal sequence, outcome notification, and star exchange.

---

## 5. Naming & Code Conventions

### 5.1 Identifier Casing
- **`camelCase`**: Variables, properties, functions, methods, and hooks (`participantId`, `calculateOdds`, `useGameEngine`).
- **`PascalCase`**: React components, TypeScript types, interfaces, enums, and classes (`Scoreboard`, `GameState`, `DuelResolution`).
- **`SCREAMING_SNAKE_CASE`**: Global constants, default configurations, and FSM phase identifiers (`INITIAL_STARS_PER_PLAYER`, `MAX_BOTS`, `DUEL_REVEAL`).
- **`snake_case`**: External API payload keys or database columns (if applicable).

### 5.2 CSS Modules & BEM Standard
Every component must define styles using `.module.css` with explicit BEM classes:
- **Block:** `.scoreboard`
- **Element:** `.scoreboard__tally`, `.scoreboard__card-counter`
- **Modifier:** `.scoreboard__card-counter--rock`, `.duel-modal__card--revealed`

### 5.3 Documentation Standards
- Use **TSDoc / JSDoc** strictly for documenting business rules, domain invariants, edge cases, or side effects.
- **Do not** write redundant comments that merely restate standard code semantics.

### 5.4 Testing: AAA Pattern
All unit tests (`.spec.ts` / `.spec.tsx`) must strictly follow the **Arrange-Act-Assert** pattern:
```typescript
describe('resolveDuel', () => {
  it('transfers one star from loser to winner on non-tie', () => {
    // Arrange
    const playerCard = CardType.ROCK;
    const botCard = CardType.SCISSORS;
    const initialStars = { player: 3, bot: 3 };

    // Act
    const result = resolveDuel(playerCard, botCard, initialStars);

    // Assert
    expect(result.winner).toBe('player');
    expect(result.stars.player).toBe(4);
    expect(result.stars.bot).toBe(2);
  });
});
```

### 5.5 Git & Version Control
- **Conventional Commits**: Enforce commit message format (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
- **SemVer**: Strictly follow Semantic Versioning (`MAJOR.MINOR.PATCH`).
- **GitHub Flow**: Branch from `main`, implement feature/fix, verify clean test runs, open PR.

---

## 6. Deterministic Verification Loop (Definition of Done)

Before marking any task, feature, or bug fix as complete, every AI agent must execute this autonomous loop:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. IMPLEMENT │ ──► │  2. VERIFY   │ ──► │ 3. AUTO-FIX  │ ──► │ 4. COMPLETE  │
│  Code logic   │     │  Run checks  │     │  Fix errors  │     │  Exit code 0 │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                             │                   ▲
                             └─ If Exit Code != 0┘
```

1. **Implement**:
   - Write cleanly typed code adhering to FSM state requirements and BEM CSS Modules.
   - Maintain co-location for test files and styles.

2. **Verify**:
   - Execute in strict sequence:
     1. Type check: `npm run typecheck` (or `npx tsc --noEmit`)
     2. Linter: `npm run lint`
     3. Tests: `npm test` or `npx vitest run <path-to-modified-spec>`

3. **Auto-fix**:
   - If any command exits with a non-zero status code:
     - Parse the error stack and compiler diagnostic messages.
     - Apply targeted fixes addressing the root cause.
     - Re-run verification checks from Step 2.

4. **Complete**:
   - Never finalize a turn or request human review until all verification checks pass cleanly with exit code 0.
