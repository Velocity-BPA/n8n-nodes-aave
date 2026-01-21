/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Integration tests for Aave node
 * 
 * These tests require a live RPC endpoint to run.
 * Set the following environment variables before running:
 * - AAVE_TEST_RPC_URL: Your RPC endpoint (e.g., Infura, Alchemy)
 * - AAVE_TEST_NETWORK: Network to test (default: ethereum)
 * 
 * Run with: npm run test:integration
 */

// Skip integration tests if no RPC URL is provided
const RPC_URL = process.env.AAVE_TEST_RPC_URL;
const NETWORK = process.env.AAVE_TEST_NETWORK || 'ethereum';

const describeIf = (condition: boolean) => (condition ? describe : describe.skip);

describeIf(!!RPC_URL)('Aave Integration Tests', () => {
	// Integration tests would go here when RPC_URL is provided
	it('placeholder test', () => {
		expect(true).toBe(true);
	});
});

// Always run this test
describe('AaveClient Initialization', () => {
	it('should have NETWORKS available', () => {
		const { NETWORKS } = require('../../src/nodes/Aave/constants/networks');
		expect(NETWORKS).toBeDefined();
		expect(NETWORKS.ethereum).toBeDefined();
	});

	it('should have network config retrieval', () => {
		const { getNetworkConfig } = require('../../src/nodes/Aave/constants/networks');
		const config = getNetworkConfig('ethereum');
		expect(config).toBeDefined();
		expect(config.chainId).toBe(1);
	});

	it('should throw for unsupported network config', () => {
		const { getNetworkConfig } = require('../../src/nodes/Aave/constants/networks');
		expect(() => {
			getNetworkConfig('unsupported-network');
		}).toThrow();
	});
});
