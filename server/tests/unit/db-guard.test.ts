import { describe, it, expect } from 'vitest';
import { assertTestDatabase } from '../setup/globalSetup';

describe('Database Safety Guard', () => {
  it("should throw error when database name ends with '_dev'", () => {
    const devUrl = 'mysql://serviceflow:serviceflow_dev_pass@localhost:3306/serviceflow_dev';
    expect(() => assertTestDatabase(devUrl)).toThrowError(
      "SAFETY GUARD TRIGGERED: Automated tests must only run against a database ending with '_test'. Current DB: 'serviceflow_dev'. Aborting to protect development data."
    );
  });

  it('should throw error when database URL is missing or empty', () => {
    expect(() => assertTestDatabase(undefined)).toThrowError(
      'SAFETY GUARD TRIGGERED: DATABASE_URL is not set.'
    );
    expect(() => assertTestDatabase('')).toThrowError(
      'SAFETY GUARD TRIGGERED: DATABASE_URL is not set.'
    );
    expect(() => assertTestDatabase('   ')).toThrowError(
      'SAFETY GUARD TRIGGERED: DATABASE_URL is not set.'
    );
  });

  it("should successfully return database name when URL points to 'serviceflow_test'", () => {
    const testUrl = 'mysql://serviceflow:serviceflow_dev_pass@localhost:3306/serviceflow_test';
    const dbName = assertTestDatabase(testUrl);
    expect(dbName).toBe('serviceflow_test');
  });

  it('should successfully handle query parameters in connection URL', () => {
    const testUrlWithParams =
      'mysql://serviceflow:serviceflow_dev_pass@localhost:3306/serviceflow_test?connection_limit=10&ssl=false';
    const dbName = assertTestDatabase(testUrlWithParams);
    expect(dbName).toBe('serviceflow_test');
  });
});
