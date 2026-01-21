/**
 * Flash Loan Utilities for Aave Protocol
 * Simplified version for n8n community node
 */

import { ethers } from 'ethers';

// Flash loan premium constants
export const FLASH_LOAN_PREMIUM_V2 = 9; // 0.09%
export const FLASH_LOAN_PREMIUM_V3 = 5; // 0.05%

/**
 * Calculate flash loan fee
 */
export function calculateFlashLoanFee(
  amount: string | bigint,
  premiumBps: number = FLASH_LOAN_PREMIUM_V3
): string {
  const amountBigInt = BigInt(amount.toString());
  const fee = (amountBigInt * BigInt(premiumBps)) / BigInt(10000);
  return fee.toString();
}

/**
 * Calculate total repayment for flash loan
 */
export function calculateTotalRepayment(
  amount: string | bigint,
  premiumBps: number = FLASH_LOAN_PREMIUM_V3
): string {
  const amountBigInt = BigInt(amount.toString());
  const fee = (amountBigInt * BigInt(premiumBps)) / BigInt(10000);
  return (amountBigInt + fee).toString();
}

/**
 * Get flash loan premium based on version
 */
export function getFlashLoanPremium(version: 'v2' | 'v3', network: string): { total: number; toProtocol: number } {
  if (version === 'v2') {
    return { total: FLASH_LOAN_PREMIUM_V2, toProtocol: 0 };
  }
  // V3 has configurable premium, default is 5 bps (0.05%)
  return { total: FLASH_LOAN_PREMIUM_V3, toProtocol: 0 };
}

/**
 * Validate flash loan parameters
 */
export function validateFlashLoanParams(
  assets: string[],
  amounts: string[],
  modes: number[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (assets.length === 0) {
    errors.push('At least one asset is required');
  }

  if (assets.length !== amounts.length) {
    errors.push('Assets and amounts arrays must have the same length');
  }

  if (assets.length !== modes.length) {
    errors.push('Assets and modes arrays must have the same length');
  }

  for (const asset of assets) {
    if (!ethers.utils.isAddress(asset)) {
      errors.push(`Invalid asset address: ${asset}`);
    }
  }

  for (const amount of amounts) {
    if (BigInt(amount) <= 0n) {
      errors.push(`Amount must be positive: ${amount}`);
    }
  }

  for (const mode of modes) {
    if (![0, 1, 2].includes(mode)) {
      errors.push(`Invalid mode: ${mode}. Must be 0, 1, or 2`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate profitability of a flash loan operation
 */
export function calculateFlashLoanProfitability(
  loanAmount: bigint,
  expectedProfit: bigint,
  premiumBps: number = FLASH_LOAN_PREMIUM_V3,
  gasPrice: bigint = BigInt(50e9),
  estimatedGas: bigint = BigInt(500000)
): {
  fee: bigint;
  gasCost: bigint;
  totalCost: bigint;
  netProfit: bigint;
  isProfitable: boolean;
  roi: number;
} {
  const fee = BigInt(calculateFlashLoanFee(loanAmount, premiumBps));
  const gasCost = gasPrice * estimatedGas;
  const totalCost = fee + gasCost;
  const netProfit = expectedProfit - totalCost;
  const isProfitable = netProfit > 0n;
  const roi = Number((netProfit * BigInt(10000)) / loanAmount) / 100;

  return {
    fee,
    gasCost,
    totalCost,
    netProfit,
    isProfitable,
    roi,
  };
}
