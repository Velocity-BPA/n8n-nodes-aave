/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	toWei,
	fromWei,
	toRay,
	fromRay,
	formatUnits,
	parseUnits,
} from '../../src/nodes/Aave/utils/unitConverter';

describe('Unit Converter Utils', () => {
	describe('toWei', () => {
		it('should convert a number to wei (18 decimals)', () => {
			const result = toWei('1', 18);
			expect(result.toString()).toBe('1000000000000000000');
		});

		it('should convert a number to wei with 6 decimals', () => {
			const result = toWei('1', 6);
			expect(result.toString()).toBe('1000000');
		});

		it('should handle decimal values', () => {
			const result = toWei('1.5', 18);
			expect(result.toString()).toBe('1500000000000000000');
		});
	});

	describe('fromWei', () => {
		it('should convert wei to a human-readable number', () => {
			const result = fromWei(BigInt('1000000000000000000'), 18);
			expect(result).toBe('1.0');
		});

		it('should handle 6 decimal tokens', () => {
			const result = fromWei(BigInt('1000000'), 6);
			expect(result).toBe('1.0');
		});
	});

	describe('toRay', () => {
		it('should convert to ray (27 decimals)', () => {
			const result = toRay('1');
			expect(result).toBe('1000000000000000000000000000');
		});
	});

	describe('fromRay', () => {
		it('should convert from ray to decimal', () => {
			const result = fromRay('1000000000000000000000000000');
			expect(parseFloat(result)).toBeCloseTo(1, 5);
		});
	});

	describe('formatUnits', () => {
		it('should format units correctly', () => {
			const result = formatUnits('1000000000000000000', 18);
			expect(result).toBe('1.0');
		});
	});

	describe('parseUnits', () => {
		it('should parse units correctly', () => {
			const result = parseUnits('1', 18);
			expect(result).toBe('1000000000000000000');
		});
	});
});
