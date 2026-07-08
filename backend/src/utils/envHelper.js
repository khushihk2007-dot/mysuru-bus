/**
 * src/utils/envHelper.js
 *
 * Environment utility helpers used throughout the application.
 */

import { env } from '../config/env.js';

/** @returns {boolean} */
export const isDevelopment = () => env.isDevelopment;

/** @returns {boolean} */
export const isProduction = () => env.isProduction;

/** @returns {boolean} */
export const isTest = () => env.isTest;

/**
 * Returns a value based on the current environment.
 * @template T
 * @param {{ development?: T; production?: T; test?: T; default: T }} options
 * @returns {T}
 */
export function byEnv({ development, production, test, default: def }) {
  if (env.isDevelopment && development !== undefined) return development;
  if (env.isProduction  && production  !== undefined) return production;
  if (env.isTest        && test        !== undefined) return test;
  return def;
}
