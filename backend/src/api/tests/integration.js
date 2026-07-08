/**
 * src/api/tests/integration.js
 *
 * REST API Layer — Integration Test Suite.
 *
 * Runs a local server instance and executes actual HTTP requests against it.
 *
 * Run with:
 *   node src/api/tests/integration.js
 */

import 'dotenv/config';
import { createApp } from '../../app.js';
import { mitraClient } from '../../services/mitra/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Test Runner
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
    console.log(`❌ FAIL\n    ${err.stack || err.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Responses for MITRA Client
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_RAW_ROUTES = [
  {
    route_id: '201',
    route_no: '201',
    route_name: 'Mysore to Chamundi Hill',
    source: 'Mysore CBS',
    destination: 'Chamundi Hill',
    direction: '1',
    total_stops: '10',
    distance: '12.4',
  },
];

const MOCK_RAW_BUSES = [
  {
    bus_id: '101',
    route_no: '201',
    bus_reg_no: 'KA57F-1111',
    latitude: '12.3000',
    longitude: '76.6500',
    velocity: 15,
    status: '7.0 min early',
    time_diff_min: -7,
    last_stop: 'CBS',
    last_stop_at: '2026-07-08 12:00:00',
    latest_gps_timestamp: '2026-07-08 12:05:00',
  },
];

const MOCK_RAW_TRIPS = [
  {
    trip_id: 'TRIP_ABC_1',
    route_id: '201',
  },
];

const MOCK_RAW_STOPS = [
  {
    stop_id: 'S1',
    stop_name: 'CBS Stand',
    stop_sequence: '1',
    latitude: '12.3100',
    longitude: '76.6600',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Suite Setup
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🌐   REST API Layer — Integration Tests');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Override MitraClient methods
  const originalPost = mitraClient.post;
  const originalGet = mitraClient.get;

  let shouldThrowGenericError = false;

  mitraClient.get = async (endpoint) => {
    if (endpoint === '/') {
      return { data: 'OK' };
    }
    throw new Error(`Unhandled mock GET endpoint: ${endpoint}`);
  };

  mitraClient.post = async (endpoint, params) => {
    if (shouldThrowGenericError) {
      throw new Error('Database connection collapsed unexpectedly');
    }

    if (endpoint === 'getAllRoutes') {
      return { data: MOCK_RAW_ROUTES };
    }

    if (endpoint === 'getLiveBusDetails') {
      const routeId = params.get('route_id');
      if (routeId === '201') {
        return { data: MOCK_RAW_BUSES };
      }
      return { data: [] };
    }

    if (endpoint === 'getRouteDetails') {
      const routeId = params.get('route_id');
      if (routeId === '201') {
        return { data: MOCK_RAW_TRIPS };
      }
      return { data: [] };
    }

    if (endpoint === 'getStopDetails') {
      const tripId = params.get('trip_id');
      if (tripId === 'TRIP_ABC_1') {
        return { data: MOCK_RAW_STOPS };
      }
      return { data: [] };
    }

    throw new Error(`Unhandled mock POST endpoint: ${endpoint}`);
  };

  // Start Server on ephemeral port
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address();
  const baseUrl = `http://localhost:${port}/api/v1`;

  // Helper to fetch and verify envelope structure
  const fetchApi = async (path, options = {}) => {
    const res = await fetch(`${baseUrl}${path}`, options);
    const json = await res.json();
    return { status: res.status, data: json };
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Endpoints Tests
  // ───────────────────────────────────────────────────────────────────────────

  await test('GET /health returns health metrics and UP status', async () => {
    const { status, data } = await fetchApi('/health');
    assert(status === 200, `status: ${status}`);
    assert(data.success === true, 'success boolean');
    assert(data.data.status === 'healthy', 'vitals healthy');
    assert(data.data.services.mitra.status === 'UP', 'mitra up');
    assert(data.timestamp, 'timestamp present');
    assert(data.requestId, 'requestId present');
  });

  await test('GET /routes returns all routes list', async () => {
    const { status, data } = await fetchApi('/routes');
    assert(status === 200, `status: ${status}`);
    assert(data.success === true, 'success boolean');
    assert(Array.isArray(data.data), 'data is array');
    assert(data.data.length === 1, 'route count');
    assert(data.data[0].id === '201', 'route id');
  });

  await test('GET /routes/:routeId returns route details', async () => {
    const { status, data } = await fetchApi('/routes/201');
    assert(status === 200, `status: ${status}`);
    assert(data.success === true, 'success boolean');
    assert(data.data.id === '201', 'route details matches');
  });

  await test('GET /routes/:routeId returns 404 for non-existent route', async () => {
    const { status, data } = await fetchApi('/routes/non-existent');
    assert(status === 404, `status: ${status}`);
    assert(data.success === false, 'success false');
    assert(data.error.code === 'ROUTE_NOT_FOUND', `error code: ${data.error.code}`);
    assert(data.error.message.includes('not found'), 'error message');
  });

  await test('GET /routes/:routeId returns 400 for invalid routeId (only spaces)', async () => {
    const { status, data } = await fetchApi('/routes/%20');
    assert(status === 400, `status: ${status}`);
    assert(data.success === false, 'success false');
    assert(data.error.code === 'VALIDATION_ERROR', `error code: ${data.error.code}`);
  });

  await test('GET /routes/:routeId/buses returns live buses on the route', async () => {
    const { status, data } = await fetchApi('/routes/201/buses');
    assert(status === 200, `status: ${status}`);
    assert(data.success === true, 'success boolean');
    assert(Array.isArray(data.data), 'data is array');
    assert(data.data[0].id === '101', 'bus matches');
  });

  await test('GET /routes/:routeId/buses returns empty list for non-existent route', async () => {
    // If the route doesn't exist, we don't throw RouteNotFound, we just return empty list or check route existence.
    // Wait, let's see how getLiveBuses behaves in BusService.js:
    // It verifies `await this._routeService.routeExists(routeId)`. If not, it throws RouteNotFoundError.
    const { status, data } = await fetchApi('/routes/999/buses');
    assert(status === 404, `status: ${status}`);
    assert(data.success === false, 'success false');
    assert(data.error.code === 'ROUTE_NOT_FOUND', 'error code');
  });

  await test('GET /routes/:routeId/stops returns stops sequence on the route', async () => {
    const { status, data } = await fetchApi('/routes/201/stops');
    assert(status === 200, `status: ${status}`);
    assert(data.success === true, 'success boolean');
    assert(Array.isArray(data.data), 'data is array');
    assert(data.data[0].id === 'S1', 'stop sequence matches');
  });

  await test('GET /buses returns all active fleet', async () => {
    const { status, data } = await fetchApi('/buses');
    assert(status === 200, `status: ${status}`);
    assert(data.success === true, 'success');
    assert(Array.isArray(data.data), 'array');
    assert(data.data[0].id === '101', 'bus');
  });

  await test('GET /buses/:busId returns a single active bus', async () => {
    const { status, data } = await fetchApi('/buses/101');
    assert(status === 200, `status: ${status}`);
    assert(data.success === true, 'success');
    assert(data.data.id === '101', 'bus id');
  });

  await test('GET /buses/:busId returns 404 for non-existent bus', async () => {
    const { status, data } = await fetchApi('/buses/non-existent');
    assert(status === 404, `status: ${status}`);
    assert(data.success === false, 'success false');
    assert(data.error.code === 'BUS_NOT_FOUND', 'error code');
  });

  await test('GET /buses/:busId returns 400 for invalid busId (only spaces)', async () => {
    const { status, data } = await fetchApi('/buses/%20');
    assert(status === 400, `status: ${status}`);
    assert(data.success === false, 'success false');
    assert(data.error.code === 'VALIDATION_ERROR', 'error code');
  });

  await test('Unexpected failures are caught and returned as 500 error envelope', async () => {
    shouldThrowGenericError = true;
    const { status, data } = await fetchApi('/routes');
    assert(status === 500, `status: ${status}`);
    assert(data.success === false, 'success false');
    assert(data.error.code === 'INTERNAL_SERVER_ERROR', 'generic code');
    assert(data.error.message === 'An unexpected error occurred', 'generic message');
  });

  // Restore client methods and shut down server
  mitraClient.post = originalPost;
  mitraClient.get = originalGet;
  server.close();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed  ${failed} failed`);
  console.log('═══════════════════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Integration test runner crashed:', err);
  process.exit(1);
});
