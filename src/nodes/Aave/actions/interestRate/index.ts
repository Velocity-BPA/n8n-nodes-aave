import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { AaveClient } from '../../transport/aaveClient';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['interestRate'],
			},
		},
		options: [
			{
				name: 'Get Current Variable Rate',
				value: 'getVariableRate',
				description: 'Get current variable borrow rate for an asset',
				action: 'Get variable rate',
			},
			{
				name: 'Get Current Stable Rate',
				value: 'getStableRate',
				description: 'Get current stable borrow rate for an asset',
				action: 'Get stable rate',
			},
			{
				name: 'Get Liquidity Rate',
				value: 'getLiquidityRate',
				description: 'Get current supply/liquidity rate (APY)',
				action: 'Get liquidity rate',
			},
			{
				name: 'Get All Rates',
				value: 'getAllRates',
				description: 'Get all interest rates for an asset',
				action: 'Get all rates',
			},
			{
				name: 'Get Utilization Rate',
				value: 'getUtilizationRate',
				description: 'Get reserve utilization rate',
				action: 'Get utilization rate',
			},
			{
				name: 'Calculate APY',
				value: 'calculateAPY',
				description: 'Calculate APY from ray rate',
				action: 'Calculate APY',
			},
		],
		default: 'getAllRates',
	},
	{
		displayName: 'Asset Address',
		name: 'assetAddress',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'The reserve asset address',
		displayOptions: {
			show: {
				resource: ['interestRate'],
				operation: ['getVariableRate', 'getStableRate', 'getLiquidityRate', 'getAllRates', 'getUtilizationRate'],
			},
		},
		required: true,
	},
	{
		displayName: 'Ray Rate',
		name: 'rayRate',
		type: 'string',
		default: '',
		placeholder: '35000000000000000000000000',
		description: 'The interest rate in ray format (10^27)',
		displayOptions: {
			show: {
				resource: ['interestRate'],
				operation: ['calculateAPY'],
			},
		},
		required: true,
	},
];

export async function execute(
	this: IExecuteFunctions,
	client: AaveClient,
	operation: string,
	itemIndex: number,
): Promise<any> {
	switch (operation) {
		case 'getVariableRate': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const reserveData = await client.getReserveData(assetAddress);
			const rate = Number(reserveData.currentVariableBorrowRate);
			const apy = (rate / 1e27) * 100;
			return {
				asset: assetAddress,
				variableBorrowRate: reserveData.currentVariableBorrowRate.toString(),
				variableBorrowAPY: apy,
				variableBorrowAPYFormatted: `${apy.toFixed(2)}%`,
			};
		}

		case 'getStableRate': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const reserveData = await client.getReserveData(assetAddress);
			const rate = Number(reserveData.currentStableBorrowRate);
			const apy = (rate / 1e27) * 100;
			return {
				asset: assetAddress,
				stableBorrowRate: reserveData.currentStableBorrowRate.toString(),
				stableBorrowAPY: apy,
				stableBorrowAPYFormatted: `${apy.toFixed(2)}%`,
			};
		}

		case 'getLiquidityRate': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const reserveData = await client.getReserveData(assetAddress);
			const rate = Number(reserveData.currentLiquidityRate);
			const apy = (rate / 1e27) * 100;
			return {
				asset: assetAddress,
				liquidityRate: reserveData.currentLiquidityRate.toString(),
				supplyAPY: apy,
				supplyAPYFormatted: `${apy.toFixed(2)}%`,
			};
		}

		case 'getAllRates': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const reserveData = await client.getReserveData(assetAddress);
			
			const liquidityRate = Number(reserveData.currentLiquidityRate);
			const variableRate = Number(reserveData.currentVariableBorrowRate);
			const stableRate = Number(reserveData.currentStableBorrowRate);
			
			return {
				asset: assetAddress,
				supplyAPY: (liquidityRate / 1e27) * 100,
				variableBorrowAPY: (variableRate / 1e27) * 100,
				stableBorrowAPY: (stableRate / 1e27) * 100,
				rawRates: {
					liquidityRate: reserveData.currentLiquidityRate.toString(),
					variableBorrowRate: reserveData.currentVariableBorrowRate.toString(),
					stableBorrowRate: reserveData.currentStableBorrowRate.toString(),
				},
			};
		}

		case 'getUtilizationRate': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			// Get reserve data and calculate utilization from liquidity index
			const reserveData = await client.getReserveData(assetAddress);
			
			// For utilization, we need to fetch additional data via data provider
			// Using a simplified calculation based on available data
			const liquidityRate = Number(reserveData.currentLiquidityRate);
			const variableRate = Number(reserveData.currentVariableBorrowRate);
			
			// Estimate utilization: higher rates indicate higher utilization
			// This is an approximation; actual utilization requires total supply/debt data
			const estimatedUtilization = variableRate > 0 ? Math.min((liquidityRate / variableRate) * 100, 100) : 0;
			
			return {
				asset: assetAddress,
				estimatedUtilizationRate: estimatedUtilization,
				utilizationRateFormatted: `${estimatedUtilization.toFixed(2)}%`,
				note: 'Utilization estimated from rate ratios. For precise data, query the subgraph.',
				liquidityRate: reserveData.currentLiquidityRate.toString(),
				variableBorrowRate: reserveData.currentVariableBorrowRate.toString(),
			};
		}

		case 'calculateAPY': {
			const rayRate = this.getNodeParameter('rayRate', itemIndex) as string;
			const rate = Number(rayRate);
			const apy = (rate / 1e27) * 100;
			return {
				rayRate,
				apy,
				apyFormatted: `${apy.toFixed(4)}%`,
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
