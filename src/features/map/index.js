/**
 * @file index.js — Map feature public API
 * @description Barrel exports for everything in src/features/map.
 *
 * Import from here instead of deep paths:
 *   import { MapContainer, useMap } from "@/features/map";
 */

// ── Components ─────────────────────────────────────────────────────────────
export { MapContainer }  from "./components/MapContainer";
export { MapView }       from "./components/MapView";
export { MapControls }   from "./components/MapControls";
export { MapCompass }    from "./components/MapCompass";
export { MapScale }      from "./components/MapScale";
export { MapLayers }     from "./components/MapLayers";
export { MapOverlay }    from "./components/MapOverlay";
export { MapLoading }    from "./components/MapLoading";
export { MapError }      from "./components/MapError";
export { MapHUD }        from "./components/MapHUD";

// ── Providers ──────────────────────────────────────────────────────────────
export { MapProvider }   from "./providers/MapProvider";

// ── Context ────────────────────────────────────────────────────────────────
export { MapContext, useMapContext } from "./context/MapContext";

// ── Hooks ──────────────────────────────────────────────────────────────────
export { useMap }        from "./hooks/useMap";
export { useMapControls }from "./hooks/useMapControls";
export { useMapEvents }  from "./hooks/useMapEvents";
export { useFullscreen } from "./hooks/useFullscreen";
export { useMapLayers }  from "./hooks/useMapLayers";

// ── Config ─────────────────────────────────────────────────────────────────
export {
  MAP_CONFIG,
  MYSURU_CENTER,
  CARTO_LIGHT_STYLE,
  CARTO_DARK_STYLE,
  CARTO_LIGHT_TILE_SOURCE,
  CARTO_DARK_TILE_SOURCE,
  RESET_VIEW,
} from "./config/mapConfig";
