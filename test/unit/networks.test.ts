/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	NETWORKS,
	getNetworkConfig,
	getSupportedNetworks,
} from '../../src/nodes/Aave/constants/networks';

describe('Network Constants', () => {
	describe('NETWORKS', () => {
		it('should have Ethereum mainnet configured', () => {
			expect(NETWORKS.ethereum).toBeDefined();
			expect(NETWORKS.ethereum.chainId).toBe(1);
			expect(NETWORKS.ethereum.name).toBe('Ethereum Mainnet');
		});

		it('should have Polygon configured', () => {
			expect(NETWORKS.polygon).toBeDefined();
			expect(NETWORKS.polygon.chainId).toBe(137);
		});

		it('should have Arbitrum configured', () => {
			expect(NETWORKS.arbitrum).toBeDefined();
			expect(NETWORKS.arbitrum.chainId).toBe(42161);
		});

		it('should have pool addresses for V3 networks', () => {
			expect(NETWORKS.ethereum.aaveV3?.pool).toBeDefined();
			expect(NETWORKS.polygon.aaveV3?.pool).toBeDefined();
		});
	});

	describe('getNetworkConfig', () => {
		it('should return network config for valid network', () => {
			const config = getNetworkConfig('ethereum');
			expect(config).toBeDefined();
			expect(config?.chainId).toBe(1);
		});

		it('should throw for invalid network', () => {
			expect(() => getNetworkConfig('invalid-network')).toThrow();
		});
	});

	describe('getSupportedNetworks', () => {
		it('should return list of supported networks', () => {
			const networks = getSupportedNetworks();
			expect(Array.isArray(networks)).toBe(true);
			expect(networks.length).toBeGreaterThan(0);
			expect(networks).toContain('ethereum');
			expect(networks).toContain('polygon');
		});
	});
});
