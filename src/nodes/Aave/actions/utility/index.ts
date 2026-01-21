import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { AaveClient } from '../../transport/aaveClient';
import { toWei, fromWei, rayToPercent, calculateHealthFactor, calculateLTV } from '../../utils/unitConverter';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['utility'],
			},
		},
		options: [
			{
				name: 'Convert to Wei',
				value: 'toWei',
				description: 'Convert human-readable amount to Wei',
				action: 'Convert to wei',
			},
			{
				name: 'Convert from Wei',
				value: 'fromWei',
				description: 'Convert Wei to human-readable amount',
				action: 'Convert from wei',
			},
			{
				name: 'Ray to APY',
				value: 'rayToAPY',
				description: 'Convert ray format rate to APY percentage',
				action: 'Ray to APY',
			},
			{
				name: 'Calculate Health Factor',
				value: 'calculateHealthFactor',
				description: 'Calculate health factor from collateral and debt',
				action: 'Calculate health factor',
			},
			{
				name: 'Calculate LTV',
				value: 'calculateLTV',
				description: 'Calculate loan-to-value ratio',
				action: 'Calculate LTV',
			},
		],
		default: 'toWei',
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		default: '',
		placeholder: '1.0',
		description: 'Amount to convert',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['toWei', 'fromWei'],
			},
		},
		required: true,
	},
	{
		displayName: 'Decimals',
		name: 'decimals',
		type: 'number',
		default: 18,
		description: 'Number of decimals for the token',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['toWei', 'fromWei'],
			},
		},
	},
	{
		displayName: 'Ray Rate',
		name: 'rayRate',
		type: 'string',
		default: '',
		placeholder: '35000000000000000000000000',
		description: 'Interest rate in ray format (10^27)',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['rayToAPY'],
			},
		},
		required: true,
	},
	{
		displayName: 'Total Collateral (USD)',
		name: 'totalCollateralUSD',
		type: 'number',
		default: 0,
		description: 'Total collateral value in USD',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['calculateHealthFactor', 'calculateLTV'],
			},
		},
		required: true,
	},
	{
		displayName: 'Total Debt (USD)',
		name: 'totalDebtUSD',
		type: 'number',
		default: 0,
		description: 'Total debt value in USD',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['calculateHealthFactor', 'calculateLTV'],
			},
		},
		required: true,
	},
	{
		displayName: 'Liquidation Threshold (%)',
		name: 'liquidationThreshold',
		type: 'number',
		default: 80,
		description: 'Liquidation threshold percentage',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['calculateHealthFactor'],
			},
		},
	},
];

export async function execute(
	this: IExecuteFunctions,
	client: AaveClient,
	operation: string,
	itemIndex: number,
): Promise<any> {
	switch (operation) {
		case 'toWei': {
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const decimals = this.getNodeParameter('decimals', itemIndex, 18) as number;
			const wei = toWei(amount, decimals);
			return {
				input: amount,
				decimals,
				wei: wei.toString(),
			};
		}

		case 'fromWei': {
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const decimals = this.getNodeParameter('decimals', itemIndex, 18) as number;
			const humanReadable = fromWei(BigInt(amount), decimals);
			return {
				wei: amount,
				decimals,
				amount: humanReadable,
			};
		}

		case 'rayToAPY': {
			const rayRate = this.getNodeParameter('rayRate', itemIndex) as string;
			const percentRate = rayToPercent(BigInt(rayRate));
			// Simple APY calculation (not compounded)
			const apy = percentRate;
			return {
				rayRate,
				apr: percentRate,
				apy: apy,
				apyFormatted: `${apy.toFixed(2)}%`,
			};
		}

		case 'calculateHealthFactor': {
			const totalCollateralUSD = this.getNodeParameter('totalCollateralUSD', itemIndex) as number;
			const totalDebtUSD = this.getNodeParameter('totalDebtUSD', itemIndex) as number;
			const liquidationThreshold = this.getNodeParameter('liquidationThreshold', itemIndex, 80) as number;
			
			// Calculate health factor
			if (totalDebtUSD === 0) {
				return {
					totalCollateralUSD,
					totalDebtUSD,
					liquidationThreshold: `${liquidationThreshold}%`,
					healthFactor: 'Infinity (no debt)',
					status: 'safe',
				};
			}
			
			const healthFactor = (totalCollateralUSD * (liquidationThreshold / 100)) / totalDebtUSD;
			
			return {
				totalCollateralUSD,
				totalDebtUSD,
				liquidationThreshold: `${liquidationThreshold}%`,
				healthFactor: healthFactor.toFixed(2),
				status: healthFactor >= 2 ? 'safe' : healthFactor >= 1.5 ? 'warning' : healthFactor >= 1 ? 'danger' : 'liquidatable',
			};
		}

		case 'calculateLTV': {
			const totalCollateralUSD = this.getNodeParameter('totalCollateralUSD', itemIndex) as number;
			const totalDebtUSD = this.getNodeParameter('totalDebtUSD', itemIndex) as number;
			
			if (totalCollateralUSD === 0) {
				return {
					totalCollateralUSD,
					totalDebtUSD,
					ltv: totalDebtUSD > 0 ? 'Infinity' : '0',
					ltvPercentage: totalDebtUSD > 0 ? 'N/A' : '0%',
				};
			}
			
			const ltv = (totalDebtUSD / totalCollateralUSD) * 100;
			
			return {
				totalCollateralUSD,
				totalDebtUSD,
				ltv: ltv.toFixed(2),
				ltvPercentage: `${ltv.toFixed(2)}%`,
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
