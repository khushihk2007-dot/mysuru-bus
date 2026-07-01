# Coding Guidelines & Architectural Rules

To maintain high scalability, readability, and performance as the Mysore Transit project scales to 50,000+ lines of code, all developers must adhere strictly to these architectural boundaries.

---

## 1. Strict Feature Boundaries
> [!IMPORTANT]
> **Never import directly between features.**
> 
> Features must be completely decoupled from each other. If the `fleet` feature needs information or logic from `transit`, it must not run:
> ```js
> // ❌ INVALID - Violates feature encapsulation
> import { RouteDetails } from "@/features/transit/components/RouteDetails";
> ```
> Instead:
> 1. Pass data down from page layouts/providers.
> 2. Lift shared state to a global store (`src/store/`).
> 3. Move shared helper utilities into global utils (`src/utils/`).

## 2. Decouple Shared Components
- **Shared components must not depend on feature-specific code.**
- Global UI components (in `src/shared/components/`) must be pure, domain-agnostic presentation layers. They should never import anything from `src/features/`.
- If a shared component needs to act differently based on a feature context, use React Composition (`children` props) or render props.

## 3. Separation of Concerns (UI vs. Business Logic)
- **Business logic belongs in services, helpers, or hooks, NOT UI components.**
- Keep UI components presentational.
- Event handlers in components should delegate heavy operations to hooks (`useSomething`) or services (`apiClient.fetch()`).
- Keep render functions pure and simple.

## 4. API Response Normalization
- **API responses must be normalized before reaching UI components.**
- Transform raw, deeply nested backend responses into flat, component-friendly data shapes inside the service layer (`src/services/api/`) or features' specific services (`src/features/*/services/`).
- This insulates the UI from breaking backend API changes.

## 5. State Management & Prop Drilling
- Avoid prop drilling deeper than 3 levels.
- Use Local React State (`useState`) for local, ephemeral UI state.
- Use context providers (`src/providers/` or `src/contexts/`) for global, read-only/infrequently updated state (like localization or themes).
- Use a state manager (e.g. Zustand, Redux) in `src/store/` or feature-specific stores for highly interactive, frequently updated global state.

## 6. Single Feature Entrypoint (Public API)
- Every feature must expose its public interface via `index.js` at the root of the feature folder.
- Only components, hooks, or constants exported from `features/[feature-name]/index.js` are allowed to be imported outside the feature folder.
- Example:
  ```js
  // ❌ INVALID
  import { BusMarker } from "@/features/fleet/components/BusMarker";

  // ✅ VALID
  import { BusMarker } from "@/features/fleet";
  ```
