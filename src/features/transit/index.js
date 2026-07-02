/**
 * @file index.js — Public API for the transit feature module
 * @description Barrel exports for easy importing across the codebase.
 */

// ── Components ─────────────────────────────────────────────────────────────
export { TransitLayers } from "./components/TransitLayers";
export { RouteList } from "./components/RouteList";
export { RouteDetails } from "./components/RouteDetails";

// ── Providers & Contexts ────────────────────────────────────────────────────
export { TransitProvider, useTransit } from "./context/TransitContext";

// ── Services ──────────────────────────────────────────────────────────────
export { transitService } from "./services/transitService";

// ── Mock Data ──────────────────────────────────────────────────────────────
export { MOCK_ROUTES } from "./data/mockTransitData";
