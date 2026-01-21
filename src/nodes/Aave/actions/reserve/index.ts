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
				resource: ['reserve'],
			},
		},
		options: [
			{
				name: 'Get Reserve Data',
				value: 'getReserveData',
				description: 'Get complete reserve data',
				action: 'Get reserve data',
			},
			{
				name: 'Get All Reserves',
				value: 'getAllReserves',
				description: 'Get list of all reserves',
				action: 'Get all reserves',
			},
			{
				name: 'Get Reserve Configuration',
				value: 'getReserveConfiguration',
				description: 'Get reserve configuration params',
				action: 'Get reserve configuration',
			},
			{
				name: 'Get Reserve Caps',
				value: 'getReserveCaps',
				description: 'Get supply and borrow caps',
				action: 'Get reserve caps',
			},
			{
				name: 'Get Reserve Utilization',
				value: 'getReserveUtilization',
				description: 'Get current utilization rate',
				action: 'Get reserve utilization',
			},
			{
				name: 'Get Reserve Token Addresses',
				value: 'getReserveTokens',
				description: 'Get aToken and debt token addresses',
				action: 'Get reserve token addresses',
			},
			{
				name: 'Check Reserve Status',
				value: 'checkReserveStatus',
				description: 'Check if reserve is active/frozen/paused',
				action: 'Check reserve status',
			},
		],
		default: 'getReserveData',
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
				resource: ['reserve'],
				operation: ['getReserveData', 'getReserveConfiguration', 'getReserveCaps', 'getReserveUtilization', 'getReserveTokens', 'checkReserveStatus'],
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
		case 'getReserveData': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const data = await client.getReserveData(assetAddress);
			const price = await client.getAssetPrice(assetAddress);
			
			return {
				asset: assetAddress,
				...data,
				priceUSD: Number(price) / 1e8,
				liquidityRateAPY: (Number(data.currentLiquidityRate) / 1e27) * 100,
				variableBorrowRateAPY: (Number(data.currentVariableBorrowRate) / 1e27) * 100,
				stableBorrowRateAPY: (Number(data.currentStableBorrowRate) / 1e27) * 100,
			};
		}

		case 'getAllReserves': {
			const reserves = await client.getReservesList();
			const reserveDetails = [];
			
			for (const reserve of reserves) {
				try {
					const data = await client.getReserveData(reserve);
					const price = await client.getAssetPrice(reserve);
					reserveDetails.push({
						asset: reserve,
						priceUSD: Number(price) / 1e8,
						supplyAPY: (Number(data.currentLiquidityRate) / 1e27) * 100,
						variableBorrowAPY: (Number(data.currentVariableBorrowRate) / 1e27) * 100,
					});
				} catch {
					reserveDetails.push({ asset: reserve, error: 'Failed to fetch data' });
				}
			}
			
			return {
				totalReserves: reserves.length,
				reserves: reserveDetails,
			};
		}

		case 'getReserveConfiguration': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const config = await client.getReserveConfigurationData(assetAddress);
			
			return {
				asset: assetAddress,
				ltv: Number(config.ltv) / 100,
				liquidationThreshold: Number(config.liquidationThreshold) / 100,
				liquidationBonus: (Number(config.liquidationBonus) - 10000) / 100,
				decimals: config.decimals,
				reserveFactor: Number(config.reserveFactor) / 100,
				usageAsCollateralEnabled: config.usageAsCollateralEnabled,
				borrowingEnabled: config.borrowingEnabled,
				stableBorrowRateEnabled: config.stableBorrowRateEnabled,
				isActive: config.isActive,
				isFrozen: config.isFrozen,
			};
		}

		case 'getReserveCaps': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const caps = await client.getReserveCaps(assetAddress);
			const data = await client.getReserveData(assetAddress);
			
			return {
				asset: assetAddress,
				supplyCap: caps.supplyCap?.toString() || '0',
				borrowCap: caps.borrowCap?.toString() || '0',
				currentSupply: (data as any).totalAToken?.toString() || '0',
				currentBorrow: (data as any).totalVariableDebt?.toString() || '0',
			};
		}

		case 'getReserveUtilization': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const data = await client.getReserveData(assetAddress);
			
			const totalSupply = BigInt((data as any).totalAToken || 0);
			const totalBorrow = BigInt((data as any).totalVariableDebt || 0) + BigInt((data as any).totalStableDebt || 0);
			const utilization = totalSupply > 0n 
				? Number(totalBorrow * 10000n / totalSupply) / 100 
				: 0;
			
			return {
				asset: assetAddress,
				totalSupply: totalSupply.toString(),
				totalBorrow: totalBorrow.toString(),
				availableLiquidity: (totalSupply - totalBorrow).toString(),
				utilizationRate: utilization,
				utilizationFormatted: `${utilization.toFixed(2)}%`,
			};
		}

		case 'getReserveTokens': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const tokens = await client.getReserveTokensAddresses(assetAddress);
			
			return {
				asset: assetAddress,
				aTokenAddress: tokens.aTokenAddress,
				variableDebtTokenAddress: tokens.variableDebtTokenAddress,
				stableDebtTokenAddress: tokens.stableDebtTokenAddress,
			};
		}

		case 'checkReserveStatus': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const config = await client.getReserveConfigurationData(assetAddress);
			
			return {
				asset: assetAddress,
				isActive: config.isActive,
				isFrozen: config.isFrozen,
				isPaused: (config as any).isPaused || false,
				borrowingEnabled: config.borrowingEnabled,
				stableBorrowEnabled: config.stableBorrowRateEnabled,
				usableAsCollateral: config.usageAsCollateralEnabled,
				status: config.isActive 
					? (config.isFrozen ? 'frozen' : 'active')
					: 'inactive',
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
