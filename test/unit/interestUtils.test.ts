/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	rayToPercentString,
	percentToRay,
	calculateAPY,
	calculateCompoundInterest,
	calculateUtilizationRate,
	estimateSupplyEarnings,
} from '../../src/nodes/Aave/utils/interestUtils';

describe('Interest Utils', () => {
	describe('rayToPercentString', () => {
		it('should convert ray to percentage', () => {
			// 5% in ray = 0.05 * 10^27
			const fivePercentRay = '50000000000000000000000000';
			const result = rayToPercentString(fivePercentRay);
			expect(parseFloat(result)).toBeCloseTo(5, 1);
		});

		it('should handle zero', () => {
			const result = rayToPercentString('0');
			expect(result).toBe('0');
		});
	});

	describe('percentToRay', () => {
		it('should convert percentage to ray', () => {
			const result = percentToRay('5');
			expect(result).toBe('50000000000000000000000000');
		});
	});

	describe('calculateAPY', () => {
		it('should calculate APY from APR', () => {
			// 10% APR should give approximately 10.52% APY
			const result = calculateAPY('10');
			expect(parseFloat(result)).toBeGreaterThan(10);
			expect(parseFloat(result)).toBeLessThan(11);
		});

		it('should return 0 for 0% APR', () => {
			const result = calculateAPY('0');
			expect(parseFloat(result)).toBe(0);
		});
	});

	describe('calculateCompoundInterest', () => {
		it('should calculate compound interest correctly', () => {
			// $1000 at 10% for 1 year compounded monthly
			const result = calculateCompoundInterest('1000', '10', 12, 1);
			// Expected: ~1104.71
			expect(parseFloat(result)).toBeGreaterThan(1104);
			expect(parseFloat(result)).toBeLessThan(1105);
		});
	});

	describe('calculateUtilizationRate', () => {
		it('should calculate utilization correctly', () => {
			const result = calculateUtilizationRate(
				BigInt('500000000000000000000'), // 500 borrowed
				BigInt('500000000000000000000')  // 500 available
			);
			expect(result).toBeCloseTo(50, 0); // 50% utilization
		});

		it('should return 0 for zero liquidity', () => {
			const result = calculateUtilizationRate(BigInt(0), BigInt(0));
			expect(result).toBe(0);
		});
	});

	describe('estimateSupplyEarnings', () => {
		it('should estimate earnings correctly', () => {
			const result = estimateSupplyEarnings(10000, 5); // $10k at 5% APY
			expect(result.yearly).toBeCloseTo(500, 0); // $500/year
			expect(result.monthly).toBeCloseTo(500 / 12, 0);
			expect(result.daily).toBeCloseTo(500 / 365, 1);
		});
	});
});
