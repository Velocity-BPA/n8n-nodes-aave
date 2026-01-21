/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	analyzeHealthFactor,
	assessLiquidationRisk,
	calculateCollateralNeeded,
	calculateDebtToRepay,
	calculateMaxSafeBorrow,
	monitorHealthFactor,
} from '../../src/nodes/Aave/utils/healthFactorUtils';

describe('Health Factor Utils', () => {
	describe('analyzeHealthFactor', () => {
		it('should return safe status for high health factor', () => {
			const result = analyzeHealthFactor(2.5);
			expect(result.status).toBe('safe');
			expect(result.value).toBeCloseTo(2.5, 2);
		});

		it('should return warning status for moderate health factor', () => {
			const result = analyzeHealthFactor(1.7);
			expect(result.status).toBe('warning');
		});

		it('should return danger status for low health factor', () => {
			const result = analyzeHealthFactor(1.15);
			expect(result.status).toBe('danger');
		});

		it('should return liquidatable status for health factor below 1', () => {
			const result = analyzeHealthFactor(0.9);
			expect(result.status).toBe('liquidatable');
		});
	});

	describe('assessLiquidationRisk', () => {
		it('should assess liquidation risk correctly', () => {
			const result = assessLiquidationRisk(
				10000, // totalCollateralUSD
				5000,  // totalDebtUSD
				8000,  // liquidationThreshold (80%)
				7500,  // maxLTV (75%)
				2500   // availableBorrowsUSD
			);
			expect(result.healthFactor).toBeCloseTo(1.6, 2);
			expect(result.currentLTV).toBeCloseTo(50, 0);
			expect(result.isAtRisk).toBe(false);
		});

		it('should identify at-risk positions', () => {
			const result = assessLiquidationRisk(
				10000, // totalCollateralUSD
				7000,  // totalDebtUSD
				8000,  // liquidationThreshold (80%)
				7500,  // maxLTV (75%)
				500    // availableBorrowsUSD
			);
			expect(result.isAtRisk).toBe(true);
		});
	});

	describe('calculateCollateralNeeded', () => {
		it('should calculate collateral needed to reach target HF', () => {
			const result = calculateCollateralNeeded(
				10000, // currentCollateral
				8000,  // currentDebt
				8000,  // liquidationThreshold (80%)
				2.0    // targetHealthFactor
			);
			// Target Collateral = (2.0 * 8000) / 0.8 = 20000
			// Needed = 20000 - 10000 = 10000
			expect(result).toBeCloseTo(10000, 0);
		});

		it('should return 0 for zero debt', () => {
			const result = calculateCollateralNeeded(10000, 0, 8000, 2.0);
			expect(result).toBe(0);
		});
	});

	describe('calculateDebtToRepay', () => {
		it('should calculate debt to repay to reach target HF', () => {
			const result = calculateDebtToRepay(
				10000, // currentCollateral
				8000,  // currentDebt
				8000,  // liquidationThreshold (80%)
				2.0    // targetHealthFactor
			);
			// Target Debt = (10000 * 0.8) / 2.0 = 4000
			// To Repay = 8000 - 4000 = 4000
			expect(result).toBeCloseTo(4000, 0);
		});
	});

	describe('calculateMaxSafeBorrow', () => {
		it('should calculate max safe borrow amount', () => {
			const result = calculateMaxSafeBorrow(
				10000, // currentCollateralUSD
				2000,  // currentDebtUSD
				8000,  // liquidationThreshold (80%)
				1.5    // targetHealthFactor
			);
			// Max Debt = (10000 * 0.8) / 1.5 = 5333.33
			// Max Borrow = 5333.33 - 2000 = 3333.33
			expect(result).toBeCloseTo(3333.33, 0);
		});
	});

	describe('monitorHealthFactor', () => {
		it('should not alert for healthy positions', () => {
			const result = monitorHealthFactor(2.5);
			expect(result.alert).toBe(false);
		});

		it('should alert for critical positions', () => {
			const result = monitorHealthFactor(1.05);
			expect(result.alert).toBe(true);
			expect(result.alertLevel).toBe('critical');
		});

		it('should detect declining trend', () => {
			const result = monitorHealthFactor(1.5, 1.8);
			expect(result.trend).toBe('declining');
		});

		it('should detect improving trend', () => {
			const result = monitorHealthFactor(1.8, 1.5);
			expect(result.trend).toBe('improving');
		});
	});
});
