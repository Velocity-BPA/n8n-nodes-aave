/**
 * Health Factor Utilities for Aave Protocol
 * Monitor and calculate liquidation risk metrics
 */

import { WAD, PERCENTAGE_FACTOR, formatPercent } from './unitConverter';

export interface HealthFactorStatus {
  value: number;
  status: 'safe' | 'warning' | 'danger' | 'liquidatable';
  message: string;
  bufferToLiquidation: number; // Percentage buffer before liquidation
}

export interface LiquidationRisk {
  isAtRisk: boolean;
  healthFactor: number;
  liquidationThreshold: number;
  currentLTV: number;
  maxLTV: number;
  availableBorrowsUSD: number;
  bufferAmount: number;
  suggestedAction: string;
}

// Health factor thresholds
const HF_SAFE = 2.0;
const HF_WARNING = 1.5;
const HF_DANGER = 1.1;
const HF_LIQUIDATABLE = 1.0;

/**
 * Analyze health factor and return status
 */
export function analyzeHealthFactor(healthFactor: bigint | string | number): HealthFactorStatus {
  const hf = typeof healthFactor === 'number' 
    ? healthFactor 
    : Number(BigInt(healthFactor)) / Number(WAD);

  let status: HealthFactorStatus['status'];
  let message: string;

  if (hf >= HF_SAFE) {
    status = 'safe';
    message = 'Position is healthy with comfortable safety margin';
  } else if (hf >= HF_WARNING) {
    status = 'warning';
    message = 'Position approaching risk zone, consider reducing debt';
  } else if (hf >= HF_DANGER) {
    status = 'danger';
    message = 'Position at high risk! Immediate action recommended';
  } else {
    status = 'liquidatable';
    message = 'Position can be liquidated! Take immediate action';
  }

  const bufferToLiquidation = ((hf - HF_LIQUIDATABLE) / HF_LIQUIDATABLE) * 100;

  return {
    value: hf,
    status,
    message,
    bufferToLiquidation: Math.max(0, bufferToLiquidation),
  };
}

/**
 * Calculate comprehensive liquidation risk assessment
 */
export function assessLiquidationRisk(
  totalCollateralUSD: number,
  totalDebtUSD: number,
  liquidationThreshold: number, // in basis points (e.g., 8000 = 80%)
  maxLTV: number, // in basis points
  availableBorrowsUSD: number
): LiquidationRisk {
  // Calculate current LTV
  const currentLTV = totalCollateralUSD > 0 
    ? (totalDebtUSD / totalCollateralUSD) * 100 
    : 0;

  // Calculate health factor
  const healthFactor = totalDebtUSD > 0
    ? (totalCollateralUSD * (liquidationThreshold / 10000)) / totalDebtUSD
    : Infinity;

  const isAtRisk = healthFactor < HF_WARNING;

  // Calculate buffer amount (how much more can be borrowed safely)
  const safeDebtLimit = (totalCollateralUSD * (liquidationThreshold / 10000)) / HF_WARNING;
  const bufferAmount = Math.max(0, safeDebtLimit - totalDebtUSD);

  // Suggest action based on health factor
  let suggestedAction: string;
  if (healthFactor >= HF_SAFE) {
    suggestedAction = 'Position is healthy. You can safely borrow more if needed.';
  } else if (healthFactor >= HF_WARNING) {
    suggestedAction = `Consider repaying ${formatPercent((HF_WARNING - healthFactor) / healthFactor * 100)} of debt to reach safe zone.`;
  } else if (healthFactor >= HF_DANGER) {
    suggestedAction = 'URGENT: Repay debt or add collateral immediately to avoid liquidation.';
  } else {
    suggestedAction = 'CRITICAL: Position is liquidatable. Repay debt immediately or add significant collateral.';
  }

  return {
    isAtRisk,
    healthFactor,
    liquidationThreshold: liquidationThreshold / 100,
    currentLTV,
    maxLTV: maxLTV / 100,
    availableBorrowsUSD,
    bufferAmount,
    suggestedAction,
  };
}

/**
 * Calculate the amount of collateral needed to reach target health factor
 */
export function calculateCollateralNeeded(
  currentCollateral: number,
  currentDebt: number,
  liquidationThreshold: number, // in basis points
  targetHealthFactor: number = HF_SAFE
): number {
  if (currentDebt === 0) return 0;
  
  // Target Collateral = (Target HF * Current Debt) / Liquidation Threshold
  const targetCollateral = (targetHealthFactor * currentDebt) / (liquidationThreshold / 10000);
  return Math.max(0, targetCollateral - currentCollateral);
}

/**
 * Calculate the amount of debt to repay to reach target health factor
 */
export function calculateDebtToRepay(
  currentCollateral: number,
  currentDebt: number,
  liquidationThreshold: number, // in basis points
  targetHealthFactor: number = HF_SAFE
): number {
  if (currentDebt === 0) return 0;
  
  // Target Debt = (Current Collateral * Liquidation Threshold) / Target HF
  const targetDebt = (currentCollateral * (liquidationThreshold / 10000)) / targetHealthFactor;
  return Math.max(0, currentDebt - targetDebt);
}

/**
 * Calculate price drop percentage that would trigger liquidation
 */
export function calculateLiquidationPriceDrop(
  healthFactor: number,
  liquidationThreshold: number // in basis points
): number {
  // Price drop % = 1 - (1 / (HF * LT))
  const threshold = liquidationThreshold / 10000;
  const priceDrop = (1 - (1 / (healthFactor * threshold))) * 100;
  return Math.max(0, priceDrop);
}

/**
 * Simulate health factor after a borrow
 */
export function simulateBorrow(
  currentCollateralUSD: number,
  currentDebtUSD: number,
  borrowAmountUSD: number,
  liquidationThreshold: number // in basis points
): HealthFactorStatus {
  const newDebt = currentDebtUSD + borrowAmountUSD;
  const newHealthFactor = newDebt > 0
    ? (currentCollateralUSD * (liquidationThreshold / 10000)) / newDebt
    : Infinity;
  
  return analyzeHealthFactor(newHealthFactor);
}

/**
 * Simulate health factor after a withdrawal
 */
export function simulateWithdrawal(
  currentCollateralUSD: number,
  currentDebtUSD: number,
  withdrawAmountUSD: number,
  liquidationThreshold: number // in basis points
): HealthFactorStatus {
  const newCollateral = Math.max(0, currentCollateralUSD - withdrawAmountUSD);
  const newHealthFactor = currentDebtUSD > 0
    ? (newCollateral * (liquidationThreshold / 10000)) / currentDebtUSD
    : Infinity;
  
  return analyzeHealthFactor(newHealthFactor);
}

/**
 * Calculate maximum safe borrow amount
 */
export function calculateMaxSafeBorrow(
  currentCollateralUSD: number,
  currentDebtUSD: number,
  liquidationThreshold: number, // in basis points
  targetHealthFactor: number = HF_WARNING // Conservative target
): number {
  // Max Safe Borrow = (Current Collateral * LT / Target HF) - Current Debt
  const maxDebt = (currentCollateralUSD * (liquidationThreshold / 10000)) / targetHealthFactor;
  return Math.max(0, maxDebt - currentDebtUSD);
}

/**
 * Calculate maximum safe withdrawal amount
 */
export function calculateMaxSafeWithdrawal(
  currentCollateralUSD: number,
  currentDebtUSD: number,
  liquidationThreshold: number, // in basis points
  targetHealthFactor: number = HF_WARNING // Conservative target
): number {
  if (currentDebtUSD === 0) return currentCollateralUSD;
  
  // Min Collateral = (Target HF * Current Debt) / LT
  const minCollateral = (targetHealthFactor * currentDebtUSD) / (liquidationThreshold / 10000);
  return Math.max(0, currentCollateralUSD - minCollateral);
}

/**
 * Monitor health factor and return alerts
 */
export function monitorHealthFactor(
  healthFactor: number,
  previousHealthFactor?: number
): {
  alert: boolean;
  alertLevel: 'info' | 'warning' | 'critical' | 'emergency';
  message: string;
  trend: 'improving' | 'declining' | 'stable';
} {
  // Determine trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (previousHealthFactor !== undefined) {
    const change = healthFactor - previousHealthFactor;
    if (Math.abs(change) > 0.01) {
      trend = change > 0 ? 'improving' : 'declining';
    }
  }

  // Determine alert level
  let alert = false;
  let alertLevel: 'info' | 'warning' | 'critical' | 'emergency' = 'info';
  let message = '';

  if (healthFactor < 1.0) {
    alert = true;
    alertLevel = 'emergency';
    message = `EMERGENCY: Position liquidatable! Health Factor: ${healthFactor.toFixed(4)}`;
  } else if (healthFactor < HF_DANGER) {
    alert = true;
    alertLevel = 'critical';
    message = `CRITICAL: Position at high risk. Health Factor: ${healthFactor.toFixed(4)}`;
  } else if (healthFactor < HF_WARNING) {
    alert = true;
    alertLevel = 'warning';
    message = `WARNING: Position approaching danger zone. Health Factor: ${healthFactor.toFixed(4)}`;
  } else if (trend === 'declining' && healthFactor < HF_SAFE) {
    alert = true;
    alertLevel = 'info';
    message = `INFO: Health Factor declining. Current: ${healthFactor.toFixed(4)}`;
  }

  return { alert, alertLevel, message, trend };
}
