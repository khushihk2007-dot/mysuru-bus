/**
 * src/services/mitra/normalizers/tests/unit.js
 *
 * Normalization Layer — Unit Test Suite
 *
 * Run with:
 *   node src/services/mitra/normalizers/tests/unit.js
 */

import 'dotenv/config';

import {
  normalizeBus, normalizeBusList, validateBus,
  normalizeRoute, normalizeRouteList,
  normalizeStop, normalizeStopList,
  normalizeStatus,
  parseStatus, parseDelay, deriveIcon,
  safeString, safeNumber, safeInt, safeDate, safeCoordinate,
  computeCentroid,
  NormalizationError, MissingFieldError,
  InvalidCoordinateError,
  BUS_STATE,
} from '../index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Minimal test runner
// ─────────────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

async function test(name, fn) {
  process.stdout.write(`  ○ ${name} ... `);
  try {
    await fn();
    console.log('✅ PASS');
    passed++;
  } catch (err) {
    console.log(`❌ FAIL\n    ${err.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

function assertThrows(fn, errorCode) {
  let threw = false;
  try { fn(); } catch (err) {
    threw = true;
    if (errorCode) assert(err.code === errorCode, `Expected code ${errorCode}, got ${err.code}`);
  }
  assert(threw, 'Expected function to throw');
}

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const RAW_BUS = {
  bus_id: '247',
  route_no: '201',
  bus_reg_no: 'KA57F-0565',
  latitude: '12.276443',
  longitude: '76.626389',
  velocity: 0,
  status: '7.0 min early',
  time_diff_min: -7,
  last_stop: 'City Bus Stand',
  last_stop_at: '2026-06-30 11:22:54',
  latest_gps_timestamp: '2026-06-30 20:17:56.0',
};

const RAW_ROUTE = {
  route_id: '201',
  route_no: '201',
  route_name: 'Mysore to Chamundi Hill',
  source: 'Mysore Bus Stand',
  destination: 'Chamundi Hill',
  direction: '1',
  total_stops: '24',
  distance: '14.5',
};

const RAW_STOP = {
  stop_id: '1042',
  stop_name: 'City Bus Stand',
  stop_latitude: '12.3052',
  stop_longitude: '76.6552',
  route_id: '201',
  stop_sequence: '3',
};

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 — Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

async function suiteHelpers() {
  console.log('\n📋 Suite 1: Utility Helpers\n');

  await test('safeString trims whitespace', async () => {
    assert(safeString('  hello  ') === 'hello', 'should trim');
  });

  await test('safeString returns null for empty string', async () => {
    assert(safeString('') === null, 'empty → null');
    assert(safeString('   ') === null, 'whitespace → null');
  });

  await test('safeString returns fallback for null', async () => {
    assert(safeString(null, 'N/A') === 'N/A', 'null with fallback');
    assert(safeString(undefined) === null, 'undefined → null');
  });

  await test('safeNumber parses numeric strings', async () => {
    assert(safeNumber('12.276443') === 12.276443, 'float string');
    assert(safeNumber('0') === 0, 'zero string');
    assert(safeNumber(-7) === -7, 'negative int');
  });

  await test('safeNumber returns null for non-numeric', async () => {
    assert(safeNumber('n/a') === null, 'text → null');
    assert(safeNumber('') === null, 'empty → null');
    assert(safeNumber(null) === null, 'null → null');
  });

  await test('safeNumber respects fallback', async () => {
    assert(safeNumber(null, 0) === 0, 'fallback 0');
    assert(safeNumber('bad', 99) === 99, 'fallback 99');
  });

  await test('safeInt rounds floats', async () => {
    assert(safeInt('3.7') === 4, 'rounds up');
    assert(safeInt('3.2') === 3, 'rounds down');
    assert(safeInt(null) === null, 'null → null');
  });

  await test('safeDate converts MITRA space-separated format', async () => {
    const iso = safeDate('2026-06-30 11:22:54', 'ts');
    assert(typeof iso === 'string', 'should return string');
    assert(iso.endsWith('Z'), 'should be UTC');
    assert(iso.includes('T'), 'should be ISO format');
  });

  await test('safeDate handles trailing .0 fractional seconds', async () => {
    const iso = safeDate('2026-06-30 20:17:56.0', 'ts');
    assert(typeof iso === 'string', 'should return string');
    assert(iso.endsWith('Z'), 'should be UTC');
  });

  await test('safeDate returns null for null input', async () => {
    assert(safeDate(null) === null, 'null → null');
    assert(safeDate('') === null, 'empty → null');
    assert(safeDate('not-a-date') === null, 'garbage → null');
  });

  await test('safeDate IST offset is correct (UTC+5:30)', async () => {
    // 2026-06-30 00:00:00 IST = 2026-06-29T18:30:00.000Z
    const iso = safeDate('2026-06-30 00:00:00', 'ts');
    assert(iso === '2026-06-29T18:30:00.000Z', `Expected 2026-06-29T18:30:00.000Z, got ${iso}`);
  });

  await test('safeCoordinate validates WGS-84 latitude bounds', async () => {
    assert(safeCoordinate('12.276443', 'latitude') === 12.276443, 'valid lat');
    assertThrows(() => safeCoordinate('91', 'latitude'), 'INVALID_COORDINATE');
    assertThrows(() => safeCoordinate('-91', 'latitude'), 'INVALID_COORDINATE');
  });

  await test('safeCoordinate validates WGS-84 longitude bounds', async () => {
    assert(safeCoordinate('76.626389', 'longitude') === 76.626389, 'valid lon');
    assertThrows(() => safeCoordinate('181', 'longitude'), 'INVALID_COORDINATE');
    assertThrows(() => safeCoordinate('abc', 'longitude'), 'INVALID_COORDINATE');
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 — Status parsing
// ─────────────────────────────────────────────────────────────────────────────

async function suiteStatus() {
  console.log('\n📋 Suite 2: Status Parsing\n');

  await test('parseStatus: "7.0 min early" → EARLY, -7', async () => {
    const s = parseStatus('7.0 min early');
    assert(s.state === BUS_STATE.EARLY, 'state EARLY');
    assert(s.delayMinutes === -7, `delay -7, got ${s.delayMinutes}`);
  });

  await test('parseStatus: "216.0 min late" → LATE, 216', async () => {
    const s = parseStatus('216.0 min late');
    assert(s.state === BUS_STATE.LATE, 'state LATE');
    assert(s.delayMinutes === 216, `delay 216, got ${s.delayMinutes}`);
  });

  await test('parseStatus: "On Time" → ON_TIME, 0', async () => {
    const s = parseStatus('On Time');
    assert(s.state === BUS_STATE.ON_TIME, 'state ON_TIME');
    assert(s.delayMinutes === 0, 'delay 0');
  });

  await test('parseStatus: "on time" (lowercase) → ON_TIME', async () => {
    const s = parseStatus('on time');
    assert(s.state === BUS_STATE.ON_TIME, 'case insensitive');
  });

  await test('parseStatus: null → UNKNOWN, 0', async () => {
    const s = parseStatus(null);
    assert(s.state === BUS_STATE.UNKNOWN, 'null → UNKNOWN');
    assert(s.delayMinutes === 0, 'delay 0');
  });

  await test('parseStatus: unknown string → UNKNOWN (no throw)', async () => {
    const s = parseStatus('Running');
    assert(s.state === BUS_STATE.UNKNOWN, 'unknown → UNKNOWN');
  });

  await test('parseDelay: returns signed integer', async () => {
    assert(parseDelay('7.0 min early') === -7, 'early is negative');
    assert(parseDelay('30.0 min late') === 30, 'late is positive');
    assert(parseDelay('On Time') === 0, 'on time is 0');
  });

  await test('deriveIcon returns correct identifiers', async () => {
    assert(deriveIcon('EARLY')   === 'bus-early',   'EARLY icon');
    assert(deriveIcon('LATE')    === 'bus-late',    'LATE icon');
    assert(deriveIcon('ON_TIME') === 'bus-on-time', 'ON_TIME icon');
    assert(deriveIcon('UNKNOWN') === 'bus-unknown', 'UNKNOWN icon');
  });

  await test('normalizeStatus cross-validates time_diff_min', async () => {
    // MITRA provides time_diff_min as source of truth for the numeric value
    const s = normalizeStatus('7.0 min early', -7);
    assert(s.delayMinutes === -7, 'uses time_diff_min');
    assert(s.state === BUS_STATE.EARLY, 'state from text');
  });

  await test('normalizeStatus falls back to parsed delay when time_diff_min absent', async () => {
    const s = normalizeStatus('216.0 min late', null);
    assert(s.delayMinutes === 216, 'parsed from text');
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 — Bus normalization
// ─────────────────────────────────────────────────────────────────────────────

async function suiteBus() {
  console.log('\n📋 Suite 3: Bus Normalization\n');

  await test('normalizeBus maps all fields correctly', async () => {
    const bus = normalizeBus(RAW_BUS);
    assert(bus.id                  === '247',          'id');
    assert(bus.routeId             === '201',          'routeId');
    assert(bus.registrationNumber  === 'KA57F-0565',   'regNo');
    assert(bus.depot               === null,           'depot null');
    assert(bus.schedule            === null,           'schedule null');
    assert(bus.speed               === 0,              'speed');
    assert(bus.status.state        === 'EARLY',        'status.state');
    assert(bus.status.delayMinutes === -7,             'status.delay');
    assert(bus.status.text         === '7.0 min early','status.text');
    assert(bus.lastStop.name       === 'City Bus Stand','lastStop.name');
    assert(bus.icon                === 'bus-early',    'icon');
  });

  await test('normalizeBus converts coordinates to numbers', async () => {
    const bus = normalizeBus(RAW_BUS);
    assert(typeof bus.position.latitude  === 'number', 'lat is number');
    assert(typeof bus.position.longitude === 'number', 'lon is number');
    assert(bus.position.latitude  === 12.276443, 'lat value');
    assert(bus.position.longitude === 76.626389, 'lon value');
  });

  await test('normalizeBus converts gpsTimestamp to ISO UTC', async () => {
    const bus = normalizeBus(RAW_BUS);
    assert(bus.gpsTimestamp.endsWith('Z'), 'UTC timestamp');
    assert(bus.gpsTimestamp.includes('T'), 'ISO format');
  });

  await test('normalizeBus converts lastStop.timestamp to ISO UTC', async () => {
    const bus = normalizeBus(RAW_BUS);
    assert(bus.lastStop.timestamp.endsWith('Z'), 'UTC');
  });

  await test('normalizeBus returns a frozen (immutable) object', async () => {
    const bus = normalizeBus(RAW_BUS);
    let threw = false;
    try { bus.id = 'mutated'; } catch { threw = true; }
    assert(threw || bus.id === '247', 'object should be frozen');
  });

  await test('normalizeBus does NOT mutate the input', async () => {
    const raw = { ...RAW_BUS };
    normalizeBus(raw);
    assert(raw.bus_id === '247', 'input unchanged');
    assert(raw.latitude === '12.276443', 'input string unchanged');
  });

  await test('normalizeBus throws MissingFieldError when bus_id absent', async () => {
    const raw = { ...RAW_BUS, bus_id: null };
    assertThrows(() => normalizeBus(raw), 'MISSING_FIELD');
  });

  await test('normalizeBus throws MissingFieldError when route_no absent', async () => {
    const raw = { ...RAW_BUS, route_no: '' };
    assertThrows(() => normalizeBus(raw), 'MISSING_FIELD');
  });

  await test('normalizeBus throws NormalizationError for non-object input', async () => {
    assertThrows(() => normalizeBus(null),    'INVALID_BUS_INPUT');
    assertThrows(() => normalizeBus('hello'), 'INVALID_BUS_INPUT');
    assertThrows(() => normalizeBus([]),      'INVALID_BUS_INPUT');
  });

  await test('normalizeBus sets position to null for invalid coordinates', async () => {
    const bus = normalizeBus({ ...RAW_BUS, latitude: 'bad', longitude: 'bad' });
    assert(bus.position === null, 'null position for bad coords');
  });

  await test('normalizeBus handles missing optional fields gracefully', async () => {
    const minimal = { bus_id: '1', route_no: '10A' };
    const bus = normalizeBus(minimal);
    assert(bus.id === '1', 'id ok');
    assert(bus.registrationNumber === null, 'regNo null');
    assert(bus.position === null, 'position null');
    assert(bus.speed === null, 'speed null');
    assert(bus.gpsTimestamp === null, 'gpsTimestamp null');
    assert(bus.lastStop === null, 'lastStop null');
    assert(bus.status.state === BUS_STATE.UNKNOWN, 'status UNKNOWN');
  });

  await test('normalizeBusList normalizes an array', async () => {
    const list = normalizeBusList([RAW_BUS, RAW_BUS]);
    assert(list.length === 2, 'length 2');
    assert(list[0].id === '247', 'first bus id');
  });

  await test('normalizeBusList skips invalid items by default', async () => {
    const list = normalizeBusList([RAW_BUS, null, { bus_id: null, route_no: '1' }]);
    assert(list.length === 1, 'skips nulls and invalid');
  });

  await test('normalizeBusList throws on invalid items when skipInvalid=false', async () => {
    assertThrows(
      () => normalizeBusList([RAW_BUS, null], { skipInvalid: false }),
    );
  });

  await test('normalizeBusList handles empty array', async () => {
    const list = normalizeBusList([]);
    assert(list.length === 0, 'empty array ok');
  });

  await test('normalizeBusList throws for non-array', async () => {
    assertThrows(() => normalizeBusList('not-array'), 'INVALID_BUS_LIST_INPUT');
  });

  await test('validateBus passes for a valid normalized bus', async () => {
    const bus = normalizeBus(RAW_BUS);
    const result = validateBus(bus);
    assert(result.success === true, `Zod validation failed: ${JSON.stringify(result.issues)}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 — Route normalization
// ─────────────────────────────────────────────────────────────────────────────

async function suiteRoute() {
  console.log('\n📋 Suite 4: Route Normalization\n');

  await test('normalizeRoute maps all fields correctly', async () => {
    const route = normalizeRoute(RAW_ROUTE);
    assert(route.id          === '201',                   'id');
    assert(route.number      === '201',                   'number');
    assert(route.name        === 'Mysore to Chamundi Hill','name');
    assert(route.origin      === 'Mysore Bus Stand',      'origin');
    assert(route.destination === 'Chamundi Hill',         'destination');
    assert(route.direction   === '1',                     'direction');
    assert(route.totalStops  === 24,                      'totalStops integer');
    assert(route.distanceKm  === 14.5,                    'distanceKm float');
    assert(route.geometry    === null,                    'geometry null');
    assert(typeof route.normalizedAt === 'string',        'normalizedAt set');
  });

  await test('normalizeRoute converts numeric strings to numbers', async () => {
    const route = normalizeRoute(RAW_ROUTE);
    assert(typeof route.totalStops === 'number', 'totalStops is number');
    assert(typeof route.distanceKm === 'number', 'distanceKm is number');
  });

  await test('normalizeRoute rejects invalid direction', async () => {
    const route = normalizeRoute({ ...RAW_ROUTE, direction: '3' });
    assert(route.direction === null, 'invalid direction → null');
  });

  await test('normalizeRoute is immutable', async () => {
    const route = normalizeRoute(RAW_ROUTE);
    let threw = false;
    try { route.id = 'mutated'; } catch { threw = true; }
    assert(threw || route.id === '201', 'frozen');
  });

  await test('normalizeRoute throws for missing route_id', async () => {
    assertThrows(() => normalizeRoute({ route_no: '201' }), 'MISSING_FIELD');
  });

  await test('normalizeRoute throws for missing route_no', async () => {
    assertThrows(() => normalizeRoute({ route_id: '201' }), 'MISSING_FIELD');
  });

  await test('normalizeRouteList handles large dataset', async () => {
    const big = Array.from({ length: 200 }, (_, i) => ({
      ...RAW_ROUTE,
      route_id: String(i + 1),
      route_no: String(i + 1),
    }));
    const list = normalizeRouteList(big);
    assert(list.length === 200, '200 routes');
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 — Stop normalization
// ─────────────────────────────────────────────────────────────────────────────

async function suiteStop() {
  console.log('\n📋 Suite 5: Stop Normalization\n');

  await test('normalizeStop maps all fields correctly', async () => {
    const stop = normalizeStop(RAW_STOP);
    assert(stop.id                === '1042',           'id');
    assert(stop.name              === 'City Bus Stand', 'name');
    assert(stop.position.latitude  === 12.3052,         'lat');
    assert(stop.position.longitude === 76.6552,         'lon');
    assert(stop.routeId           === '201',            'routeId');
    assert(stop.sequence          === 3,                'sequence');
  });

  await test('normalizeStop handles alternative field names (lat/lon)', async () => {
    const raw = {
      stop_id: '99', stop_name: 'Test Stop',
      lat: '12.30', lon: '76.65',
    };
    const stop = normalizeStop(raw);
    assert(stop.position.latitude  === 12.30, 'lat from lat field');
    assert(stop.position.longitude === 76.65, 'lon from lon field');
  });

  await test('normalizeStop handles latitude/longitude field names', async () => {
    const raw = {
      stop_id: '99', stop_name: 'Test Stop',
      latitude: '12.30', longitude: '76.65',
    };
    const stop = normalizeStop(raw);
    assert(stop.position !== null, 'position exists');
  });

  await test('normalizeStop sets position null for missing coordinates', async () => {
    const stop = normalizeStop({ stop_id: '1', stop_name: 'Test' });
    assert(stop.position === null, 'null position');
  });

  await test('normalizeStopList sorts by sequence', async () => {
    const raw = [
      { stop_id: 'a', stop_name: 'A', stop_sequence: '3' },
      { stop_id: 'b', stop_name: 'B', stop_sequence: '1' },
      { stop_id: 'c', stop_name: 'C', stop_sequence: '2' },
    ];
    const list = normalizeStopList(raw);
    assert(list[0].id === 'b', 'first = seq 1');
    assert(list[1].id === 'c', 'second = seq 2');
    assert(list[2].id === 'a', 'third = seq 3');
  });

  await test('normalizeStop throws for missing stop_id', async () => {
    assertThrows(() => normalizeStop({ stop_name: 'X' }), 'MISSING_FIELD');
  });

  await test('normalizeStop throws for missing stop_name', async () => {
    assertThrows(() => normalizeStop({ stop_id: '1' }), 'MISSING_FIELD');
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6 — Error classes
// ─────────────────────────────────────────────────────────────────────────────

async function suiteErrors() {
  console.log('\n📋 Suite 6: Error Classes\n');

  await test('MissingFieldError has correct properties', async () => {
    const err = new MissingFieldError('bus_id', 'BusNormalizer', undefined);
    assert(err.code    === 'MISSING_FIELD',   'code');
    assert(err.field   === 'bus_id',          'field');
    assert(err.isNormalizationError === true, 'isNormalizationError');
    assert(err instanceof NormalizationError, 'instanceof');
  });

  await test('InvalidCoordinateError has correct properties', async () => {
    const err = new InvalidCoordinateError('latitude', '999', 'BusNormalizer');
    assert(err.code === 'INVALID_COORDINATE', 'code');
    assert(err.axis === 'latitude',           'axis');
    assert(err.value === '999',               'value');
  });

  await test('NormalizationError.toJSON() is serialisable', async () => {
    const err = new MissingFieldError('x', 'test');
    const json = err.toJSON();
    assert(typeof json === 'object',       'returns object');
    assert(json.code   === 'MISSING_FIELD','json.code');
    assert(json.name   === 'MissingFieldError', 'json.name');
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 7 — Edge cases & malformed input
// ─────────────────────────────────────────────────────────────────────────────

async function suiteEdgeCases() {
  console.log('\n📋 Suite 7: Edge Cases & Malformed Input\n');

  await test('normalizeBus handles velocity=0 correctly (not null)', async () => {
    const bus = normalizeBus({ ...RAW_BUS, velocity: 0 });
    assert(bus.speed === 0, 'speed is 0, not null');
  });

  await test('normalizeBus handles velocity as string "0"', async () => {
    const bus = normalizeBus({ ...RAW_BUS, velocity: '0' });
    assert(bus.speed === 0, 'string "0" → number 0');
  });

  await test('normalizeBusList handles null items in array', async () => {
    const list = normalizeBusList([null, undefined, RAW_BUS]);
    assert(list.length === 1, 'only valid bus returned');
  });

  await test('computeCentroid returns midpoint of valid coords', async () => {
    const points = [
      { latitude: 12.0, longitude: 76.0 },
      { latitude: 13.0, longitude: 77.0 },
    ];
    const c = computeCentroid(points);
    assert(c.latitude  === 12.5, `lat ${c.latitude}`);
    assert(c.longitude === 76.5, `lon ${c.longitude}`);
  });

  await test('computeCentroid returns null for empty array', async () => {
    assert(computeCentroid([]) === null, 'empty → null');
    assert(computeCentroid(null) === null, 'null → null');
  });

  await test('large bus list normalizes without error', async () => {
    const large = Array.from({ length: 500 }, (_, i) => ({
      ...RAW_BUS,
      bus_id: String(i + 1),
    }));
    const list = normalizeBusList(large);
    assert(list.length === 500, '500 buses normalized');
  });

  await test('normalizeBus status ON_TIME produces correct icon', async () => {
    const bus = normalizeBus({ ...RAW_BUS, status: 'On Time', time_diff_min: 0 });
    assert(bus.icon === 'bus-on-time', 'on-time icon');
    assert(bus.status.state === 'ON_TIME', 'ON_TIME state');
  });

  await test('normalizeBus LATE status produces correct delay', async () => {
    const bus = normalizeBus({ ...RAW_BUS, status: '216.0 min late', time_diff_min: 216 });
    assert(bus.status.state === 'LATE', 'LATE state');
    assert(bus.status.delayMinutes === 216, 'delay 216');
    assert(bus.icon === 'bus-late', 'late icon');
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🗂️   MITRA Normalization Layer — Unit Tests');
  console.log('═══════════════════════════════════════════════════════════');

  await suiteHelpers();
  await suiteStatus();
  await suiteBus();
  await suiteRoute();
  await suiteStop();
  await suiteErrors();
  await suiteEdgeCases();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed  ${failed} failed`);
  console.log('═══════════════════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
