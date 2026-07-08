/**
 * src/services/domain/StatisticsService.js
 *
 * Transit Statistics Service.
 *
 * Computes real-time analytical metrics for transit networks without exposing REST APIs or DBs.
 */

import { logger } from '../../config/logger.js';
import { BusService } from './BusService.js';

export class StatisticsService {
  /**
   * @param {object} [deps]
   * @param {BusService} [deps.busService]
   */
  constructor({ busService } = {}) {
    this._busService = busService ?? new BusService();
  }

  /**
   * Calculates the average speed of all active buses.
   *
   * @returns {Promise<number>}  Average speed in km/h
   */
  async averageSpeed() {
    logger.debug('Calculating average fleet speed');
    const buses = await this._busService.getAllLiveBuses();
    const speeds = buses
      .map((b) => b.speed)
      .filter((s) => s !== null && s !== undefined && isFinite(s));

    if (speeds.length === 0) return 0;
    const total = speeds.reduce((sum, s) => sum + s, 0);
    return Math.round((total / speeds.length) * 10) / 10;
  }

  /**
   * Calculates the average delay of all active buses.
   *
   * @returns {Promise<number>}  Average delay in minutes
   */
  async averageDelay() {
    logger.debug('Calculating average fleet delay');
    const buses = await this._busService.getAllLiveBuses();
    if (buses.length === 0) return 0;

    const totalDelay = buses.reduce((sum, b) => sum + (b.status?.delayMinutes ?? 0), 0);
    return Math.round((totalDelay / buses.length) * 10) / 10;
  }

  /**
   * Returns a breakdown of active buses grouped by depot.
   *
   * @returns {Promise<Record<string, number>>}
   */
  async busesPerDepot() {
    logger.debug('Calculating buses per depot');
    const buses = await this._busService.getAllLiveBuses();
    const counts = {};

    for (const bus of buses) {
      const depot = bus.depot ?? 'Unassigned';
      counts[depot] = (counts[depot] ?? 0) + 1;
    }

    return Object.freeze(counts);
  }

  /**
   * Calculates the percentage of active buses that are currently moving.
   *
   * @returns {Promise<number>}  Percentage utilization (0 - 100)
   */
  async fleetUtilization() {
    logger.debug('Calculating fleet utilization');
    const buses = await this._busService.getAllLiveBuses();
    if (buses.length === 0) return 0;

    const moving = buses.filter((b) => (b.speed ?? 0) > 0).length;
    return Math.round((moving / buses.length) * 1000) / 10;
  }

  /**
   * Computes statistics grouped by route ID.
   *
   * @returns {Promise<Record<string, { count: number, averageSpeed: number, averageDelay: number }>>}
   */
  async routeStatistics() {
    logger.debug('Calculating route statistics');
    const buses = await this._busService.getAllLiveBuses();
    const groups = {};

    for (const bus of buses) {
      const rid = bus.routeId || 'Unknown';
      if (!groups[rid]) {
        groups[rid] = {
          count: 0,
          speeds: [],
          delays: [],
        };
      }
      groups[rid].count++;
      if (bus.speed !== null && bus.speed !== undefined) {
        groups[rid].speeds.push(bus.speed);
      }
      groups[rid].delays.push(bus.status?.delayMinutes ?? 0);
    }

    const stats = {};
    for (const [rid, data] of Object.entries(groups)) {
      const avgSpeed = data.speeds.length > 0
        ? Math.round((data.speeds.reduce((sum, s) => sum + s, 0) / data.speeds.length) * 10) / 10
        : 0;
      const avgDelay = data.delays.length > 0
        ? Math.round((data.delays.reduce((sum, d) => sum + d, 0) / data.delays.length) * 10) / 10
        : 0;

      stats[rid] = {
        count: data.count,
        averageSpeed: avgSpeed,
        averageDelay: avgDelay,
      };
    }

    return Object.freeze(stats);
  }

  /**
   * Computes global system-wide transit health and operations statistics.
   *
   * @returns {Promise<object>}
   */
  async systemStatistics() {
    logger.debug('Computing global system statistics');
    const buses = await this._busService.getAllLiveBuses();

    let movingBuses = 0;
    let stoppedBuses = 0;
    let totalSpeed = 0;
    let speedCount = 0;
    let totalDelay = 0;

    for (const bus of buses) {
      if (bus.speed !== null && bus.speed !== undefined) {
        if (bus.speed > 0) movingBuses++;
        else stoppedBuses++;
        totalSpeed += bus.speed;
        speedCount++;
      } else {
        stoppedBuses++;
      }
      totalDelay += bus.status?.delayMinutes ?? 0;
    }

    const activeCount = buses.length;
    const avgSpeed = speedCount > 0 ? Math.round((totalSpeed / speedCount) * 10) / 10 : 0;
    const avgDelay = activeCount > 0 ? Math.round((totalDelay / activeCount) * 10) / 10 : 0;
    const fleetUtilization = activeCount > 0 ? Math.round((movingBuses / activeCount) * 1000) / 10 : 0;

    return Object.freeze({
      totalBuses: activeCount,
      activeBuses: activeCount,
      movingBuses,
      stoppedBuses,
      averageSpeed: avgSpeed,
      averageDelay: avgDelay,
      fleetUtilization,
      timestamp: new Date().toISOString(),
    });
  }
}
