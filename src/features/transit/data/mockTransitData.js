/**
 * @file mockTransitData.js
 * @description GeoJSON-based mock transit route and stop data for Mysuru.
 * Used for high-fidelity GIS rendering without backend/MITRA API connections.
 */

export const MOCK_ROUTES = [
  {
    id: "r119",
    shortName: "119",
    longName: "CBS ⇄ Chamundi Hill",
    description: "Connects City Bus Stand with the historic Chamundi Hill shrine via Hardinge Circle and Mysuru Zoo.",
    color: "#EF4444", // Red-Orange
    textColor: "#FFFFFF",
    type: "bus",
    geometry: {
      type: "LineString",
      coordinates: [
        [76.6545, 12.3115],
        [76.6560, 12.3080],
        [76.6600, 12.3050],
        [76.6635, 12.3030],
        [76.6655, 12.2980],
        [76.6660, 12.2920],
        [76.6670, 12.2880],
        [76.6690, 12.2820],
        [76.6710, 12.2740]
      ]
    },
    stops: [
      { id: "s119-1", name: "City Bus Stand (CBS)", type: "origin", coordinates: [76.6545, 12.3115] },
      { id: "s119-2", name: "Hardinge Circle", type: "intermediate", coordinates: [76.6560, 12.3080] },
      { id: "s119-3", name: "Mysuru Zoo", type: "intermediate", coordinates: [76.6635, 12.3030] },
      { id: "s119-4", name: "Chamundi Vihar", type: "intermediate", coordinates: [76.6655, 12.2980] },
      { id: "s119-5", name: "Tavarekatte", type: "intermediate", coordinates: [76.6670, 12.2880] },
      { id: "s119-6", name: "Chamundi Hill Foothills", type: "intermediate", coordinates: [76.6690, 12.2820] },
      { id: "s119-7", name: "Chamundi Hill Terminus", type: "destination", coordinates: [76.6710, 12.2740] }
    ]
  },
  {
    id: "r201",
    shortName: "201",
    longName: "CBS ⇄ Infosys Campus",
    description: "Rapid route from the City Bus Stand to the Hebbal Industrial Area and Infosys Campus via Gokulam.",
    color: "#3B82F6", // Blue
    textColor: "#FFFFFF",
    type: "bus",
    geometry: {
      type: "LineString",
      coordinates: [
        [76.6545, 12.3115],
        [76.6500, 12.3130],
        [76.6430, 12.3140],
        [76.6440, 12.3190],
        [76.6420, 12.3250],
        [76.6340, 12.3300],
        [76.6280, 12.3350],
        [76.6220, 12.3420],
        [76.6180, 12.3520],
        [76.6110, 12.3600]
      ]
    },
    stops: [
      { id: "s201-1", name: "City Bus Stand (CBS)", type: "origin", coordinates: [76.6545, 12.3115] },
      { id: "s201-2", name: "Railway Station", type: "intermediate", coordinates: [76.6440, 12.3190] },
      { id: "s201-3", name: "Metropole Circle", type: "intermediate", coordinates: [76.6430, 12.3140] },
      { id: "s201-4", name: "Gokulam Junction", type: "intermediate", coordinates: [76.6340, 12.3300] },
      { id: "s201-5", name: "Gokulam 3rd Stage", type: "intermediate", coordinates: [76.6280, 12.3350] },
      { id: "s201-6", name: "Hebbal Layout", type: "intermediate", coordinates: [76.6180, 12.3520] },
      { id: "s201-7", name: "Infosys Campus", type: "destination", coordinates: [76.6110, 12.3600] }
    ]
  },
  {
    id: "r80",
    shortName: "80",
    longName: "CBS ⇄ Vidyaranyapuram",
    description: "Local service connecting the commercial center with Southern residential districts via Palace South Gate.",
    color: "#10B981", // Emerald Green
    textColor: "#FFFFFF",
    type: "bus",
    geometry: {
      type: "LineString",
      coordinates: [
        [76.6545, 12.3115],
        [76.6540, 12.3070],
        [76.6520, 12.3040],
        [76.6550, 12.3000],
        [76.6480, 12.2980],
        [76.6430, 12.2960],
        [76.6440, 12.2900],
        [76.6450, 12.2850],
        [76.6450, 12.2800]
      ]
    },
    stops: [
      { id: "s80-1", name: "City Bus Stand (CBS)", type: "origin", coordinates: [76.6545, 12.3115] },
      { id: "s80-2", name: "Palace South Gate", type: "intermediate", coordinates: [76.6550, 12.3000] },
      { id: "s80-3", name: "Mysore Palace", type: "intermediate", coordinates: [76.6520, 12.3040] },
      { id: "s80-4", name: "Chamarajapuram", type: "intermediate", coordinates: [76.6430, 12.2960] },
      { id: "s80-5", name: "Vidyaranyapuram Main", type: "intermediate", coordinates: [76.6450, 12.2850] },
      { id: "s80-6", name: "Vidyaranyapuram Terminus", type: "destination", coordinates: [76.6450, 12.2800] }
    ]
  }
];
