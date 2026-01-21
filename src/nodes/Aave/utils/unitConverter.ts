/**
 * Unit Conversion Utilities for Aave Protocol
 * Handles conversions between different unit formats used in DeFi
 */

import { ethers } from 'ethers';

// Constants for precision
export const WAD = BigInt('1000000000000000000'); // 10^18
export const RAY = BigInt('1000000000000000000000000000'); // 10^27
export const PERCENTAGE_FACTOR = BigInt(10000); // For basis points

/**
 * Convert human-readable amount to Wei (10^18)
 */
export function toWei(amount: string | number, decimals: number = 18): bigint {
  const parsed = ethers.utils.parseUnits(amount.toString(), decimals);
  return BigInt(parsed.toString());
}

/**
 * Convert Wei to human-readable amount
 */
export function fromWei(amount: bigint | string, decimals: number = 18): string {
  return ethers.utils.formatUnits(amount.toString(), decimals);
}

/**
 * Convert basis points to percentage (e.g., 100 -> 1%)
 */
export function bpsToPercentage(bps: number | bigint): number {
  return Number(bps) / 100;
}

/**
 * Convert percentage to basis points (e.g., 1% -> 100)
 */
export function percentageToBps(percentage: number): number {
  return Math.round(percentage * 100);
}

/**
 * Convert ray to human-readable rate (annual percentage)
 * Ray is 10^27, rates are stored as ray in Aave
 */
export function rayToPercent(ray: bigint | string): number {
  const rayValue = BigInt(ray);
  // Convert to percentage: (ray / 10^27) * 100
  return Number((rayValue * BigInt(100)) / RAY);
}

/**
 * Convert percentage to ray format
 */
export function percentToRay(percent: number): bigint {
  return (BigInt(Math.round(percent * 100)) * RAY) / BigInt(10000);
}

/**
 * Calculate APY from APR (considering compound interest)
 * APR is in ray format
 */
export function rayToAPY(rayRate: bigint | string): number {
  const apr = rayToPercent(BigInt(rayRate));
  // APY = (1 + APR/n)^n - 1, where n is compounding periods (use continuous compounding)
  // For simplicity: APY ≈ e^APR - 1
  const apy = Math.exp(apr / 100) - 1;
  return apy * 100;
}

/**
 * Format large numbers with commas
 */
export function formatNumber(value: string | number, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format currency values (USD)
 */
export function formatUSD(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format percentage values
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

// Alias for backward compatibility
export const formatPercentage = formatPercent;

/**
 * Format units (alias for fromWei for ethers compatibility)
 */
export function formatUnits(value: string | bigint, decimals: number = 18): string {
	return fromWei(BigInt(value.toString()), decimals);
}

/**
 * Parse units (alias for toWei for ethers compatibility, returns string)
 */
export function parseUnits(value: string | number, decimals: number = 18): string {
	return toWei(value, decimals).toString();
}

/**
 * Convert to Ray format (27 decimals) - string version
 */
export function toRay(value: string | number): string {
	const parsed = ethers.utils.parseUnits(value.toString(), 27);
	return parsed.toString();
}

/**
 * Convert from Ray format (27 decimals) - string version
 */
export function fromRay(value: string | bigint): string {
	return ethers.utils.formatUnits(value.toString(), 27);
}

/**
 * Multiply by ray and divide by WAD (used in Aave calculations)
 */
export function rayMul(a: bigint, b: bigint): bigint {
  return (a * b + RAY / BigInt(2)) / RAY;
}

/**
 * Divide by ray and multiply by WAD (used in Aave calculations)
 */
export function rayDiv(a: bigint, b: bigint): bigint {
  return (a * RAY + b / BigInt(2)) / b;
}

/**
 * Multiply by WAD
 */
export function wadMul(a: bigint, b: bigint): bigint {
  return (a * b + WAD / BigInt(2)) / WAD;
}

/**
 * Divide by WAD
 */
export function wadDiv(a: bigint, b: bigint): bigint {
  return (a * WAD + b / BigInt(2)) / b;
}

/**
 * Calculate percentage of a value
 */
export function percentOf(value: bigint, bps: bigint): bigint {
  return (value * bps) / PERCENTAGE_FACTOR;
}

/**
 * Calculate health factor from user account data
 * Health Factor = (Total Collateral * Liquidation Threshold) / Total Debt
 */
export function calculateHealthFactor(
  totalCollateral: bigint,
  totalDebt: bigint,
  liquidationThreshold: bigint
): bigint {
  if (totalDebt === BigInt(0)) {
    return BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935'); // Max uint256
  }
  return (totalCollateral * liquidationThreshold * WAD) / (totalDebt * PERCENTAGE_FACTOR);
}

/**
 * Calculate LTV (Loan to Value)
 * LTV = Total Debt / Total Collateral
 */
export function calculateLTV(totalDebt: bigint, totalCollateral: bigint): number {
  if (totalCollateral === BigInt(0)) {
    return 0;
  }
  return Number((totalDebt * PERCENTAGE_FACTOR) / totalCollateral) / 100;
}

/**
 * Calculate liquidation price for an asset
 */
export function calculateLiquidationPrice(
  currentPrice: bigint,
  healthFactor: bigint,
  liquidationThreshold: number
): bigint {
  // Liquidation price = Current Price * (1 / Health Factor) * Liquidation Threshold
  const threshold = BigInt(Math.round(liquidationThreshold * 100));
  return (currentPrice * WAD * PERCENTAGE_FACTOR) / (healthFactor * threshold);
}

/**
 * Calculate available borrows based on collateral and LTV
 */
export function calculateAvailableBorrows(
  totalCollateral: bigint,
  totalDebt: bigint,
  ltv: bigint
): bigint {
  const maxBorrow = (totalCollateral * ltv) / PERCENTAGE_FACTOR;
  if (maxBorrow <= totalDebt) {
    return BigInt(0);
  }
  return maxBorrow - totalDebt;
}

/**
 * Calculate interest accrued over time
 */
export function calculateInterestAccrued(
  principal: bigint,
  rate: bigint,
  timeElapsed: number // in seconds
): bigint {
  // Simple interest calculation: principal * rate * time / seconds_per_year
  const SECONDS_PER_YEAR = BigInt(31536000);
  return (principal * rate * BigInt(timeElapsed)) / (RAY * SECONDS_PER_YEAR);
}

/**
 * Parse user reserve configuration bitmap
 * Returns whether asset is being used as collateral or borrowed
 */
export function parseUserConfiguration(
  configData: bigint,
  reserveIndex: number
): { isCollateral: boolean; isBorrowing: boolean } {
  const bit = BigInt(reserveIndex * 2);
  const isBorrowing = (configData >> bit) & BigInt(1);
  const isCollateral = (configData >> (bit + BigInt(1))) & BigInt(1);
  return {
    isCollateral: isCollateral === BigInt(1),
    isBorrowing: isBorrowing === BigInt(1),
  };
}

/**
 * Parse reserve configuration data
 */
export function parseReserveConfiguration(configData: bigint): {
  ltv: number;
  liquidationThreshold: number;
  liquidationBonus: number;
  decimals: number;
  active: boolean;
  frozen: boolean;
  borrowingEnabled: boolean;
  stableBorrowEnabled: boolean;
  paused: boolean;
  flashLoanEnabled: boolean;
} {
  // Bit positions for V3 reserve configuration
  return {
    ltv: Number(configData & BigInt(0xFFFF)),
    liquidationThreshold: Number((configData >> BigInt(16)) & BigInt(0xFFFF)),
    liquidationBonus: Number((configData >> BigInt(32)) & BigInt(0xFFFF)),
    decimals: Number((configData >> BigInt(48)) & BigInt(0xFF)),
    active: ((configData >> BigInt(56)) & BigInt(1)) === BigInt(1),
    frozen: ((configData >> BigInt(57)) & BigInt(1)) === BigInt(1),
    borrowingEnabled: ((configData >> BigInt(58)) & BigInt(1)) === BigInt(1),
    stableBorrowEnabled: ((configData >> BigInt(59)) & BigInt(1)) === BigInt(1),
    paused: ((configData >> BigInt(60)) & BigInt(1)) === BigInt(1),
    flashLoanEnabled: ((configData >> BigInt(63)) & BigInt(1)) === BigInt(1),
  };
}
