/**
 * Interest Rate Utilities for Aave Protocol
 * Calculate and project interest rates based on utilization
 */

import { RAY, rayToPercent, rayMul } from './unitConverter';

export interface InterestRateParams {
  baseVariableBorrowRate: bigint;
  variableRateSlope1: bigint;
  variableRateSlope2: bigint;
  stableRateSlope1: bigint;
  stableRateSlope2: bigint;
  baseStableBorrowRate: bigint;
  optimalUsageRatio: bigint;
  maxExcessUsageRatio: bigint;
}

export interface InterestRates {
  liquidityRate: number; // Supply APY
  variableBorrowRate: number; // Variable borrow APY
  stableBorrowRate: number; // Stable borrow APY
  utilizationRate: number; // Current utilization
}

export interface RateProjection {
  utilizationRate: number;
  liquidityRate: number;
  variableBorrowRate: number;
  stableBorrowRate: number;
}

/**
 * Convert ray to percentage string for simple cases
 */
export function rayToPercentString(ray: string | bigint): string {
  const rayValue = BigInt(ray);
  if (rayValue === BigInt(0)) return '0';
  // Convert to percentage: (ray / 10^27) * 100
  const percent = Number((rayValue * BigInt(10000)) / RAY) / 100;
  return percent.toString();
}

/**
 * Convert percentage string to ray
 */
export function percentToRay(percent: string): string {
  const percentNum = parseFloat(percent);
  const ray = (BigInt(Math.round(percentNum * 100)) * RAY) / BigInt(10000);
  return ray.toString();
}

/**
 * Calculate APY from APR (simple string-based version)
 */
export function calculateAPY(apr: string): string {
  const aprNum = parseFloat(apr);
  if (aprNum === 0) return '0';
  // APY = (1 + APR/n)^n - 1, using continuous compounding approximation
  const apy = (Math.exp(aprNum / 100) - 1) * 100;
  return apy.toString();
}

/**
 * Calculate compound interest (simple version for tests)
 */
export function calculateCompoundInterest(
  principal: string,
  annualRate: string,
  compoundsPerYear: number,
  years: number
): string {
  const P = parseFloat(principal);
  const r = parseFloat(annualRate) / 100;
  const n = compoundsPerYear;
  const t = years;
  
  // A = P * (1 + r/n)^(nt)
  const amount = P * Math.pow(1 + r / n, n * t);
  return amount.toString();
}

/**
 * Calculate utilization rate
 * Utilization = Total Borrows / (Total Borrows + Available Liquidity)
 */
export function calculateUtilizationRate(
  totalBorrows: bigint,
  availableLiquidity: bigint
): number {
  const totalLiquidity = totalBorrows + availableLiquidity;
  if (totalLiquidity === BigInt(0)) return 0;
  return Number((totalBorrows * BigInt(10000)) / totalLiquidity) / 100;
}

/**
 * Calculate variable borrow rate based on utilization
 */
export function calculateVariableBorrowRate(
  utilizationRate: number, // as percentage (e.g., 50 for 50%)
  params: InterestRateParams
): bigint {
  const utilization = BigInt(Math.round(utilizationRate * 100));
  const optimalUtilization = (params.optimalUsageRatio * BigInt(10000)) / RAY;

  if (utilization <= optimalUtilization) {
    // Below optimal: baseRate + (utilization / optimal) * slope1
    return params.baseVariableBorrowRate + 
      rayMul(params.variableRateSlope1, (utilization * RAY) / optimalUtilization);
  } else {
    // Above optimal: baseRate + slope1 + ((utilization - optimal) / (1 - optimal)) * slope2
    const excessUtilization = utilization - optimalUtilization;
    const maxExcess = BigInt(10000) - optimalUtilization;
    return params.baseVariableBorrowRate + 
      params.variableRateSlope1 +
      rayMul(params.variableRateSlope2, (excessUtilization * RAY) / maxExcess);
  }
}

/**
 * Calculate stable borrow rate based on utilization
 */
export function calculateStableBorrowRate(
  utilizationRate: number,
  params: InterestRateParams,
  averageStableRate: bigint = BigInt(0)
): bigint {
  const utilization = BigInt(Math.round(utilizationRate * 100));
  const optimalUtilization = (params.optimalUsageRatio * BigInt(10000)) / RAY;

  let rate: bigint;
  if (utilization <= optimalUtilization) {
    rate = params.baseStableBorrowRate + 
      rayMul(params.stableRateSlope1, (utilization * RAY) / optimalUtilization);
  } else {
    const excessUtilization = utilization - optimalUtilization;
    const maxExcess = BigInt(10000) - optimalUtilization;
    rate = params.baseStableBorrowRate + 
      params.stableRateSlope1 +
      rayMul(params.stableRateSlope2, (excessUtilization * RAY) / maxExcess);
  }

  // Return max of calculated rate and average stable rate
  return rate > averageStableRate ? rate : averageStableRate;
}

/**
 * Calculate liquidity rate (supply APY)
 * Liquidity Rate = Borrow Rate * Utilization * (1 - Reserve Factor)
 */
export function calculateLiquidityRate(
  variableBorrowRate: bigint,
  stableBorrowRate: bigint,
  totalVariableDebt: bigint,
  totalStableDebt: bigint,
  utilizationRate: number,
  reserveFactor: number // as percentage (e.g., 10 for 10%)
): bigint {
  const totalDebt = totalVariableDebt + totalStableDebt;
  if (totalDebt === BigInt(0)) return BigInt(0);

  // Weighted average borrow rate
  const variableWeight = (totalVariableDebt * RAY) / totalDebt;
  const stableWeight = (totalStableDebt * RAY) / totalDebt;
  const avgBorrowRate = rayMul(variableBorrowRate, variableWeight) + 
                        rayMul(stableBorrowRate, stableWeight);

  // Apply utilization and reserve factor
  const utilizationRay = BigInt(Math.round(utilizationRate * 100)) * (RAY / BigInt(10000));
  const reserveFactorRay = BigInt(Math.round((100 - reserveFactor) * 100)) * (RAY / BigInt(10000));

  return rayMul(rayMul(avgBorrowRate, utilizationRay), reserveFactorRay);
}

/**
 * Project interest rates for different utilization levels
 */
export function projectInterestRates(
  params: InterestRateParams,
  reserveFactor: number,
  steps: number = 20
): RateProjection[] {
  const projections: RateProjection[] = [];
  
  for (let i = 0; i <= steps; i++) {
    const utilizationRate = (i / steps) * 100;
    
    const variableBorrowRate = calculateVariableBorrowRate(utilizationRate, params);
    const stableBorrowRate = calculateStableBorrowRate(utilizationRate, params);
    
    // For projection, assume 50/50 split between variable and stable debt
    const mockDebt = BigInt('1000000000000000000');
    const liquidityRate = calculateLiquidityRate(
      variableBorrowRate,
      stableBorrowRate,
      mockDebt,
      mockDebt,
      utilizationRate,
      reserveFactor
    );

    projections.push({
      utilizationRate,
      liquidityRate: rayToPercent(liquidityRate),
      variableBorrowRate: rayToPercent(variableBorrowRate),
      stableBorrowRate: rayToPercent(stableBorrowRate),
    });
  }

  return projections;
}

/**
 * Calculate interest accrued over time period
 */
export function calculateInterestAccrued(
  principal: bigint,
  ratePerSecond: bigint,
  timeElapsedSeconds: number
): bigint {
  // Using linear approximation for short periods
  return (principal * ratePerSecond * BigInt(timeElapsedSeconds)) / RAY;
}

/**
 * Calculate compounded interest over time
 */
export function calculateCompoundedInterest(
  principal: bigint,
  annualRate: bigint, // in RAY
  timeElapsedSeconds: number
): bigint {
  const SECONDS_PER_YEAR = BigInt(31536000);
  
  // For short periods, use linear approximation
  // For longer periods, use compound interest formula
  if (timeElapsedSeconds < 86400) { // Less than 1 day
    return (principal * annualRate * BigInt(timeElapsedSeconds)) / (RAY * SECONDS_PER_YEAR);
  }

  // Compound interest: P * (1 + r/n)^(nt)
  // Simplified: P * e^(r*t)
  const rateDecimal = Number(annualRate) / Number(RAY);
  const timeYears = timeElapsedSeconds / 31536000;
  const multiplier = Math.exp(rateDecimal * timeYears);
  
  return BigInt(Math.floor(Number(principal) * multiplier)) - principal;
}

/**
 * Get rate change description
 */
export function describeRateChange(
  previousRate: number,
  currentRate: number
): { direction: 'up' | 'down' | 'stable'; change: number; description: string } {
  const change = currentRate - previousRate;
  const changeAbs = Math.abs(change);

  if (changeAbs < 0.01) {
    return {
      direction: 'stable',
      change: 0,
      description: 'Rate unchanged',
    };
  }

  const direction = change > 0 ? 'up' : 'down';
  const changePercent = (changeAbs / previousRate) * 100;

  let description: string;
  if (changePercent > 50) {
    description = `Rate ${direction === 'up' ? 'spiked' : 'dropped'} significantly`;
  } else if (changePercent > 10) {
    description = `Rate moved ${direction} notably`;
  } else {
    description = `Rate adjusted ${direction} slightly`;
  }

  return {
    direction,
    change: changeAbs,
    description: `${description} by ${changeAbs.toFixed(2)}%`,
  };
}

/**
 * Find optimal utilization for best supply rate
 */
export function findOptimalSupplyUtilization(
  params: InterestRateParams,
  reserveFactor: number
): { utilizationRate: number; supplyRate: number } {
  const projections = projectInterestRates(params, reserveFactor, 100);
  
  let maxRate = 0;
  let optimalUtilization = 0;

  for (const projection of projections) {
    if (projection.liquidityRate > maxRate) {
      maxRate = projection.liquidityRate;
      optimalUtilization = projection.utilizationRate;
    }
  }

  return {
    utilizationRate: optimalUtilization,
    supplyRate: maxRate,
  };
}

/**
 * Estimate daily/monthly/yearly earnings from supply
 */
export function estimateSupplyEarnings(
  supplyAmountUSD: number,
  supplyAPY: number
): {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
} {
  const dailyRate = supplyAPY / 365;
  const weeklyRate = supplyAPY / 52;
  const monthlyRate = supplyAPY / 12;

  return {
    daily: supplyAmountUSD * (dailyRate / 100),
    weekly: supplyAmountUSD * (weeklyRate / 100),
    monthly: supplyAmountUSD * (monthlyRate / 100),
    yearly: supplyAmountUSD * (supplyAPY / 100),
  };
}

/**
 * Estimate borrow cost
 */
export function estimateBorrowCost(
  borrowAmountUSD: number,
  borrowAPY: number
): {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
} {
  const dailyRate = borrowAPY / 365;
  const weeklyRate = borrowAPY / 52;
  const monthlyRate = borrowAPY / 12;

  return {
    daily: borrowAmountUSD * (dailyRate / 100),
    weekly: borrowAmountUSD * (weeklyRate / 100),
    monthly: borrowAmountUSD * (monthlyRate / 100),
    yearly: borrowAmountUSD * (borrowAPY / 100),
  };
}
