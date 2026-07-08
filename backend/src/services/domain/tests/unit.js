/**
 * src/services/domain/tests/unit.js
 *
 * Domain Service Layer — Unit Test Suite.
 *
 * Run with:
 *   node src/services/domain/tests/unit.js
 */

import 'dotenv/config';

import {
  BusService,
  RouteService,
  StopService,
  StatisticsService,
  HealthService,
  BusNotFoundError,
  RouteNotFoundError,
  StopNotFoundError,
  ServiceUnavailableError,
  InvalidRouteError,
  DataIntegrityError,
} from '../index.js';

import {
  MitraTimeoutError,
  MitraNetworkError,
  MitraServerError,
} from '../../mitra/index.js';

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

function assertThrows(err, errorClass, code) {
  assert(err instanceof errorClass, `Expected instance of ${errorClass.name}, got ${err?.constructor?.name}`);
  if (code) {
    assert(err.code === code, `Expected code ${code}, got ${err.code}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock MITRA Client Factory
// ─────────────────────────────────────────────────────────────────────────────

class MockMitraClient {
  constructor() {
    this.endpoints = {};
    this.metrics = {
      totalRequests: 0,
      successRequests: 0,
      failedRequests: 0,
      totalRetries: 0,
      avgDurationMs: 0,
    };
  }

  mockEndpoint(endpoint, handler) {
    this.endpoints[endpoint] = handler;
  }

  async post(endpoint, params) {
    this.metrics.totalRequests++;
    const handler = this.endpoints[endpoint];
    if (!handler) {
      this.metrics.failedRequests++;
      throw new Error(`Unhandled mock endpoint POST: ${endpoint}`);
    }
    try {
      const res = await handler(params);
      this.metrics.successRequests++;
      return { data: res };
    } catch (err) {
      this.metrics.failedRequests++;
      throw err;
    }
  }

  async get(endpoint, params, options) {
    this.metrics.totalRequests++;
    const handler = this.endpoints[endpoint];
    if (!handler) {
      this.metrics.failedRequests++;
      throw new Error(`Unhandled mock endpoint GET: ${endpoint}`);
    }
    try {
      const res = await handler(params, options);
      this.metrics.successRequests++;
      return { data: res };
    } catch (err) {
      this.metrics.failedRequests++;
      throw err;
    }
  }

  getMetrics() {
    return this.metrics;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_RAW_BUS_1 = {
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
};

const MOCK_RAW_BUS_2 = {
  bus_id: '102',
  route_no: '201',
  bus_reg_no: 'KA57F-2222',
  latitude: '12.3100',
  longitude: '76.6600',
  velocity: 0,
  status: '3.0 min late',
  time_diff_min: 3,
  last_stop: 'Jaganmohan Palace',
  last_stop_at: '2026-07-08 12:02:00',
  latest_gps_timestamp: '2026-07-08 12:06:00',
};

const MOCK_RAW_ROUTE_1 = {
  route_id: '201',
  route_no: '201',
  route_name: 'Mysore to Chamundi Hill',
  source: 'Mysore CBS',
  destination: 'Chamundi Hill',
  direction: '1',
  total_stops: '10',
  distance: '12.4',
};

const MOCK_RAW_ROUTE_2 = {
  route_id: '10A',
  route_no: '10A',
  route_name: 'Mysore CBS to Hebbal',
  source: 'Mysore CBS',
  destination: 'Hebbal Depot',
  direction: '1',
  total_stops: '15',
  distance: '8.2',
};

// ─────────────────────────────────────────────────────────────────────────────
// Test Suites
// ─────────────────────────────────────────────────────────────────────────────

async function suiteBusService() {
  console.log('\n📋 Suite 1: BusService Unit Tests\n');

  await test('getLiveBuses returns normalized, filtered, and sorted buses', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('getLiveBusDetails', () => [MOCK_RAW_BUS_1, MOCK_RAW_BUS_2]);

    const busService = new BusService({ mitraClient: mockClient });
    const buses = await busService.getLiveBuses('201', {}, 'delay');

    assert(buses.length === 2, 'should return 2 buses');
    assert(buses[0].id === '101', 'first bus (delay -7) should be first');
    assert(buses[1].id === '102', 'second bus (delay 3) should be second');
    assert(buses[0].status.state === 'EARLY', 'correct status state');
  });

  await test('getLiveBuses rejects invalid routeId', async () => {
    const busService = new BusService();
    try {
      await busService.getLiveBuses('');
      assert(false, 'should throw');
    } catch (err) {
      assertThrows(err, InvalidRouteError, 'INVALID_ROUTE');
    }
  });

  await test('getLiveBuses wraps Mitra Client errors', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('getLiveBusDetails', () => {
      throw new MitraTimeoutError('getLiveBusDetails', 5000);
    });

    const busService = new BusService({ mitraClient: mockClient });
    try {
      await busService.getLiveBuses('201');
      assert(false, 'should throw');
    } catch (err) {
      assertThrows(err, ServiceUnavailableError, 'SERVICE_UNAVAILABLE');
    }
  });

  await test('getAllLiveBuses fetches across all routes and de-duplicates', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('getAllRoutes', () => [MOCK_RAW_ROUTE_1, MOCK_RAW_ROUTE_2]);
    // Mock duplicate reporting: bus 101 appears on route 201 and 10A
    mockClient.mockEndpoint('getLiveBusDetails', (params) => {
      const routeId = params.get('route_id');
      if (routeId === '201') return [MOCK_RAW_BUS_1];
      if (routeId === '10A') return [MOCK_RAW_BUS_1, MOCK_RAW_BUS_2];
      return [];
    });

    const busService = new BusService({ mitraClient: mockClient });
    const buses = await busService.getAllLiveBuses();

    assert(buses.length === 2, `should de-duplicate, got ${buses.length}`);
    const ids = buses.map((b) => b.id);
    assert(ids.includes('101') && ids.includes('102'), 'should contain both unique buses');
  });

  await test('getBus retrieves specific bus or throws error', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('getAllRoutes', () => [MOCK_RAW_ROUTE_1]);
    mockClient.mockEndpoint('getLiveBusDetails', () => [MOCK_RAW_BUS_1]);

    const busService = new BusService({ mitraClient: mockClient });
    const bus = await busService.getBus('101');
    assert(bus.id === '101', 'should find correct bus');

    try {
      await busService.getBus('non-existent');
      assert(false, 'should throw');
    } catch (err) {
      assertThrows(err, BusNotFoundError, 'BUS_NOT_FOUND');
    }
  });

  await test('getMovingBuses and getStoppedBuses filter correctly', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('getAllRoutes', () => [MOCK_RAW_ROUTE_1]);
    mockClient.mockEndpoint('getLiveBusDetails', () => [MOCK_RAW_BUS_1, MOCK_RAW_BUS_2]);

    const busService = new BusService({ mitraClient: mockClient });

    const moving = await busService.getMovingBuses();
    assert(moving.length === 1, `moving count: ${moving.length}`);
    assert(moving[0].id === '101', 'bus 101 is moving');

    const stopped = await busService.getStoppedBuses();
    assert(stopped.length === 1, `stopped count: ${stopped.length}`);
    assert(stopped[0].id === '102', 'bus 102 is stopped');
  });

  await test('getFleetSummary calculates summaries correctly', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('getAllRoutes', () => [MOCK_RAW_ROUTE_1]);
    mockClient.mockEndpoint('getLiveBusDetails', () => [MOCK_RAW_BUS_1, MOCK_RAW_BUS_2]);

    const busService = new BusService({ mitraClient: mockClient });
    const summary = await busService.getFleetSummary();

    assert(summary.total === 2, 'total count');
    assert(summary.moving === 1, 'moving count');
    assert(summary.stopped === 1, 'stopped count');
    assert(summary.status.early === 1, 'early status count');
    assert(summary.status.late === 1, 'late status count');
    assert(summary.avgSpeedKmH === 7.5, `avgSpeed: ${summary.avgSpeedKmH}`);
    assert(summary.avgDelayMins === -2, `avgDelay: ${summary.avgDelayMins}`); // (-7 + 3) / 2 = -2
  });
}

async function suiteRouteService() {
  console.log('\n📋 Suite 2: RouteService Unit Tests\n');

  await test('getRoutes fetches and normalizes all routes', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('getAllRoutes', () => [MOCK_RAW_ROUTE_1, MOCK_RAW_ROUTE_2]);

    const routeService = new RouteService({ mitraClient: mockClient });
    const routes = await routeService.getRoutes();

    assert(routes.length === 2, 'length');
    assert(routes[0].id === '201', 'route 201 exists');
    assert(routes[1].id === '10A', 'route 10A exists');
  });

  await test('getRoute finds single route or throws RouteNotFoundError', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('getAllRoutes', () => [MOCK_RAW_ROUTE_1]);

    const routeService = new RouteService({ mitraClient: mockClient });
    const route = await routeService.getRoute('201');
    assert(route.number === '201', 'correct route number');

    try {
      await routeService.getRoute('invalid');
      assert(false, 'should throw');
    } catch (err) {
      assertThrows(err, RouteNotFoundError, 'ROUTE_NOT_FOUND');
    }
  });

  await test('routeExists returns true/false correctly', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('getAllRoutes', () => [MOCK_RAW_ROUTE_1]);

    const routeService = new RouteService({ mitraClient: mockClient });
    assert(await routeService.routeExists('201') === true, 'route 201 exists');
    assert(await routeService.routeExists('10A') === false, 'route 10A does not exist');
  });

  await test('getRouteStops fetches trips first and then normalizes & sorts stops', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('getRouteDetails', () => [{ trip_id: 'TRIP_ABC_1' }]);
    mockClient.mockEndpoint('getStopDetails', () => [
      { stop_id: 'S2', stop_name: 'Stop 2', stop_sequence: '2' },
      { stop_id: 'S1', stop_name: 'Stop 1', stop_sequence: '1' },
    ]);

    const routeService = new RouteService({ mitraClient: mockClient });
    const stops = await routeService.getRouteStops('201');

    assert(stops.length === 2, 'stop count');
    assert(stops[0].id === 'S1', 'should sort stop 1 first');
    assert(stops[1].id === 'S2', 'should sort stop 2 second');
  });

  await test('getRouteStops throws DataIntegrityError on empty trips list', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('getRouteDetails', () => []);

    const routeService = new RouteService({ mitraClient: mockClient });
    try {
      await routeService.getRouteStops('201');
      assert(false, 'should throw');
    } catch (err) {
      assertThrows(err, DataIntegrityError, 'DATA_INTEGRITY_ERROR');
    }
  });
}

async function suiteStopService() {
  console.log('\n📋 Suite 3: StopService Unit Tests\n');

  await test('getStop fetches and normalizes details', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('getStopInfo', () => ({
      stop_id: 'S100',
      stop_name: 'Hebbal Junction',
      latitude: '12.3200',
      longitude: '76.6400',
    }));

    const stopService = new StopService({ mitraClient: mockClient });
    const stop = await stopService.getStop('S100');

    assert(stop.id === 'S100', 'id');
    assert(stop.name === 'Hebbal Junction', 'name');
    assert(stop.position.latitude === 12.3200, 'latitude');
  });

  await test('getStop throws StopNotFoundError on empty response', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('getStopInfo', () => null);

    const stopService = new StopService({ mitraClient: mockClient });
    try {
      await stopService.getStop('invalid');
      assert(false, 'should throw');
    } catch (err) {
      assertThrows(err, StopNotFoundError, 'STOP_NOT_FOUND');
    }
  });

  await test('searchStops returns matching results', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('getStopSearch', () => [
      { stop_id: 'S1', stop_name: 'CBS Stand' },
    ]);

    const stopService = new StopService({ mitraClient: mockClient });
    const results = await stopService.searchStops('CBS');

    assert(results.length === 1, 'result size');
    assert(results[0].name === 'CBS Stand', 'result matches query');
  });
}

async function suiteStatisticsService() {
  console.log('\n📋 Suite 4: StatisticsService Unit Tests\n');

  await test('systemStatistics returns correct fleet aggregation metrics', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('getAllRoutes', () => [MOCK_RAW_ROUTE_1]);
    mockClient.mockEndpoint('getLiveBusDetails', () => [MOCK_RAW_BUS_1, MOCK_RAW_BUS_2]);

    const busService = new BusService({ mitraClient: mockClient });
    const statsService = new StatisticsService({ busService });

    const stats = await statsService.systemStatistics();

    assert(stats.activeBuses === 2, 'activeCount');
    assert(stats.movingBuses === 1, 'moving');
    assert(stats.stoppedBuses === 1, 'stopped');
    assert(stats.averageSpeed === 7.5, 'averageSpeed');
    assert(stats.averageDelay === -2, 'averageDelay');
    assert(stats.fleetUtilization === 50, `utilization ${stats.fleetUtilization}`);
  });

  await test('routeStatistics aggregates values by route ID', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('getAllRoutes', () => [MOCK_RAW_ROUTE_1]);
    mockClient.mockEndpoint('getLiveBusDetails', () => [MOCK_RAW_BUS_1, MOCK_RAW_BUS_2]);

    const busService = new BusService({ mitraClient: mockClient });
    const statsService = new StatisticsService({ busService });

    const stats = await statsService.routeStatistics();

    assert(stats['201'] !== undefined, 'route 201 statistics exists');
    assert(stats['201'].count === 2, '2 buses on route 201');
    assert(stats['201'].averageSpeed === 7.5, 'speed');
    assert(stats['201'].averageDelay === -2, 'delay');
  });
}

async function suiteHealthService() {
  console.log('\n📋 Suite 5: HealthService Unit Tests\n');

  await test('checkMitraReachability returns UP when GET / is successful', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('/', () => 'OK');

    const healthService = new HealthService({ mitraClient: mockClient });
    const probe = await healthService.checkMitraReachability();

    assert(probe.status === 'UP', 'UP');
    assert(probe.reachability === true, 'reachable');
  });

  await test('checkMitraReachability returns DOWN on network failure', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('/', () => {
      throw new MitraNetworkError('/', 'Connection refused');
    });

    const healthService = new HealthService({ mitraClient: mockClient });
    const probe = await healthService.checkMitraReachability();

    assert(probe.status === 'DOWN', 'DOWN');
    assert(probe.reachability === false, 'unreachable');
  });

  await test('getHealthDetails gathers all system vitals', async () => {
    const mockClient = new MockMitraClient();
    mockClient.mockEndpoint('/', () => 'OK');

    const healthService = new HealthService({ mitraClient: mockClient });
    const details = await healthService.getHealthDetails();

    assert(details.status === 'healthy', 'status');
    assert(details.uptime.seconds >= 0, 'uptime seconds');
    assert(details.system.memory.totalMB > 0, 'memory stats');
    assert(details.services.mitra.status === 'UP', 'mitra status UP');
    assert(details.services.mitra.metrics.totalRequests >= 0, 'total requests tracked');
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🚌   Domain Service Layer — Unit Tests');
  console.log('═══════════════════════════════════════════════════════════');

  await suiteBusService();
  await suiteRouteService();
  await suiteStopService();
  await suiteStatisticsService();
  await suiteHealthService();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed  ${failed} failed`);
  console.log('═══════════════════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
