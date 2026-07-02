/**
 * @file mapConfig.js
 * @description Central configuration for the MapLibre map instance.
 * All map-level defaults live here — no business logic.
 */

/** Default center coordinates for Mysuru, Karnataka */
export const MYSURU_CENTER = [76.6394, 12.2958]; // [lng, lat]

/** Default map configuration */
export const MAP_CONFIG = {
  /** Initial center: Mysuru city center */
  center: MYSURU_CENTER,

  /** Default zoom — shows city-level context */
  zoom: 13,

  /** Minimum zoom: shows all of Karnataka */
  minZoom: 5,

  /** Maximum zoom: shows individual buildings */
  maxZoom: 20,

  /** Default bearing (north up) */
  bearing: 0,

  /** Default pitch (top-down view) */
  pitch: 0,

  /** Enable smooth zoom animation */
  smoothZoomAnimation: true,

  /** Hash: sync URL to map position */
  hash: false,

  /** Fade duration for tile transitions (ms) */
  fadeDuration: 200,

  /** Attribution: show a compact attribution control */
  attributionControl: false,
};

/** CartoDB Positron (Light) tile source configuration */
export const CARTO_LIGHT_TILE_SOURCE = {
  type: "raster",
  tiles: ["https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"],
  tileSize: 256,
  attribution:
    '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
  maxzoom: 20,
};

/** CartoDB Dark Matter (Dark) tile source configuration */
export const CARTO_DARK_TILE_SOURCE = {
  type: "raster",
  tiles: ["https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"],
  tileSize: 256,
  attribution:
    '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
  maxzoom: 20,
};

/** CartoDB Positron Style */
export const CARTO_LIGHT_STYLE = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    carto: CARTO_LIGHT_TILE_SOURCE,
  },
  layers: [
    {
      id: "carto-tiles",
      type: "raster",
      source: "carto",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

/** CartoDB Dark Matter Style */
export const CARTO_DARK_STYLE = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    carto: CARTO_DARK_TILE_SOURCE,
  },
  layers: [
    {
      id: "carto-tiles",
      type: "raster",
      source: "carto",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

/** Reset view target (returns to Mysuru city center) */
export const RESET_VIEW = {
  center: MYSURU_CENTER,
  zoom: 13,
  bearing: 0,
  pitch: 0,
  duration: 800,
};
