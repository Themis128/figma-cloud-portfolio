/**
 * Test Configuration Constants
 *
 * Centralized configuration for Playwright tests.
 * All test files should import these constants instead of hardcoding URLs.
 */

export const API_PORT = process.env.API_PORT || "3000";
export const APP_PORT = process.env.APP_PORT || "3000";

export const API_BASE_URL = `http://localhost:${API_PORT}`;
export const APP_BASE_URL = `http://localhost:${APP_PORT}`;
