# Architecture Overview

## Technical Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** JavaScript (ES6+)
- **Styling:** Tailwind CSS (v4)
- **UI Components:** shadcn/ui
- **State Management:** Zustand (planned)
- **Linting:** ESLint 9+

## Key Architectural Decisions

1. **Feature-Driven Design (FDD) as Mini-Apps**
   Domain logic is completely encapsulated under `src/features/`. Each feature acts as a self-contained module exposing its interface solely through its root `index.js` file. Cross-imports between features are strictly prohibited.

2. **Decoupled Presentational Components**
   Global, reusable UI components belong in `src/shared/components/`. They are strictly domain-agnostic and do not import from `src/features/`.

3. **Explicit Data Modeling**
   Data shapes are defined via JSDocs inside `src/types/` to ease future migrations to TypeScript and ensure complete structural transparency.

4. **Offline Development Mocks**
   Local data structures inside `src/mocks/` isolate frontend development from API stability.
