/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	calculateFlashLoanFee,
	calculateTotalRepayment,
} from '../../src/nodes/Aave/utils/flashLoanUtils';

describe('Flash Loan Utils', () => {
	describe('calculateFlashLoanFee', () => {
		it('should calculate flash loan fee correctly with default premium', () => {
			// Default premium is 0.05% (5 basis points)
			const result = calculateFlashLoanFee('1000000000000000000000', 5); // 1000 tokens
			// Fee = 1000 * 0.0005 = 0.5 tokens
			expect(result).toBe('500000000000000000'); // 0.5 tokens in wei
		});

		it('should calculate flash loan fee with custom premium', () => {
			// 9 basis points = 0.09%
			const result = calculateFlashLoanFee('1000000000000000000000', 9); // 1000 tokens
			// Fee = 1000 * 0.0009 = 0.9 tokens
			expect(result).toBe('900000000000000000'); // 0.9 tokens in wei
		});

		it('should handle zero amount', () => {
			const result = calculateFlashLoanFee('0', 5);
			expect(result).toBe('0');
		});
	});

	describe('calculateTotalRepayment', () => {
		it('should calculate total repayment correctly', () => {
			const amount = '1000000000000000000000'; // 1000 tokens
			const result = calculateTotalRepayment(amount, 5);
			// Total = 1000 + 0.5 = 1000.5 tokens
			expect(result).toBe('1000500000000000000000');
		});
	});
});
