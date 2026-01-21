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
				resource: ['account'],
			},
		},
		options: [
			{
				name: 'Get User Account Data',
				value: 'getUserAccountData',
				description: 'Get complete account data including collateral, debt, and health factor',
				action: 'Get user account data',
			},
			{
				name: 'Get Health Factor',
				value: 'getHealthFactor',
				description: 'Get current health factor (liquidation risk indicator)',
				action: 'Get health factor',
			},
			{
				name: 'Get Total Collateral',
				value: 'getTotalCollateral',
				description: 'Get total collateral value in USD',
				action: 'Get total collateral',
			},
			{
				name: 'Get Total Debt',
				value: 'getTotalDebt',
				description: 'Get total debt value in USD',
				action: 'Get total debt',
			},
			{
				name: 'Get Available Borrows',
				value: 'getAvailableBorrows',
				description: 'Get available borrowing power in USD',
				action: 'Get available borrows',
			},
			{
				name: 'Get Net Worth',
				value: 'getNetWorth',
				description: 'Get net worth (collateral minus debt)',
				action: 'Get net worth',
			},
			{
				name: 'Get Current LTV',
				value: 'getCurrentLtv',
				description: 'Get current loan-to-value ratio',
				action: 'Get current LTV',
			},
			{
				name: 'Get Liquidation Threshold',
				value: 'getLiquidationThreshold',
				description: 'Get liquidation threshold for the account',
				action: 'Get liquidation threshold',
			},
			{
				name: 'Get User Reserve Data',
				value: 'getUserReserveData',
				description: 'Get user data for a specific reserve',
				action: 'Get user reserve data',
			},
			{
				name: 'Get All User Reserves',
				value: 'getAllUserReserves',
				description: 'Get user data for all reserves',
				action: 'Get all user reserves',
			},
		],
		default: 'getUserAccountData',
	},
	{
		displayName: 'User Address',
		name: 'userAddress',
		type: 'string',
		default: '',
		placeholder: '0x... (leave empty to use connected wallet)',
		description: 'The address to query. Leave empty to use connected wallet address.',
		displayOptions: {
			show: {
				resource: ['account'],
			},
		},
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
				resource: ['account'],
				operation: ['getUserReserveData'],
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
	let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
	
	// Use connected wallet if no address provided
	if (!userAddress) {
		userAddress = await client.getWalletAddress()  || "";
	}

	switch (operation) {
		case 'getUserAccountData': {
			const data = await client.getUserAccountData(userAddress);
			return {
				userAddress,
				totalCollateralBase: data.totalCollateralBase.toString(),
				totalDebtBase: data.totalDebtBase.toString(),
				availableBorrowsBase: data.availableBorrowsBase.toString(),
				currentLiquidationThreshold: data.currentLiquidationThreshold.toString(),
				ltv: data.ltv.toString(),
				healthFactor: data.healthFactor.toString(),
				healthFactorFormatted: Number(data.healthFactor) / 1e18,
			};
		}

		case 'getHealthFactor': {
			const data = await client.getUserAccountData(userAddress);
			const healthFactor = Number(data.healthFactor) / 1e18;
			let status = 'safe';
			if (healthFactor < 1) status = 'liquidatable';
			else if (healthFactor < 1.1) status = 'danger';
			else if (healthFactor < 1.5) status = 'warning';
			
			return {
				userAddress,
				healthFactor,
				healthFactorRaw: data.healthFactor.toString(),
				status,
				message: healthFactor >= 1e18 
					? 'No debt - infinite health factor'
					: `Health factor is ${healthFactor.toFixed(4)} (${status})`,
			};
		}

		case 'getTotalCollateral': {
			const data = await client.getUserAccountData(userAddress);
			return {
				userAddress,
				totalCollateralBase: data.totalCollateralBase.toString(),
				totalCollateralUSD: Number(data.totalCollateralBase) / 1e8,
			};
		}

		case 'getTotalDebt': {
			const data = await client.getUserAccountData(userAddress);
			return {
				userAddress,
				totalDebtBase: data.totalDebtBase.toString(),
				totalDebtUSD: Number(data.totalDebtBase) / 1e8,
			};
		}

		case 'getAvailableBorrows': {
			const data = await client.getUserAccountData(userAddress);
			return {
				userAddress,
				availableBorrowsBase: data.availableBorrowsBase.toString(),
				availableBorrowsUSD: Number(data.availableBorrowsBase) / 1e8,
			};
		}

		case 'getNetWorth': {
			const data = await client.getUserAccountData(userAddress);
			const collateral = Number(data.totalCollateralBase);
			const debt = Number(data.totalDebtBase);
			const netWorth = collateral - debt;
			return {
				userAddress,
				totalCollateralUSD: collateral / 1e8,
				totalDebtUSD: debt / 1e8,
				netWorthUSD: netWorth / 1e8,
			};
		}

		case 'getCurrentLtv': {
			const data = await client.getUserAccountData(userAddress);
			return {
				userAddress,
				ltv: data.ltv.toString(),
				ltvPercentage: Number(data.ltv) / 100,
			};
		}

		case 'getLiquidationThreshold': {
			const data = await client.getUserAccountData(userAddress);
			return {
				userAddress,
				liquidationThreshold: data.currentLiquidationThreshold.toString(),
				liquidationThresholdPercentage: Number(data.currentLiquidationThreshold) / 100,
			};
		}

		case 'getUserReserveData': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const data = await client.getUserReserveData(assetAddress, userAddress);
			return {
				userAddress,
				assetAddress,
				...data,
			};
		}

		case 'getAllUserReserves': {
			const reserves = await client.getReservesList();
			const results = [];
			for (const reserve of reserves) {
				try {
					const data = await client.getUserReserveData(reserve, userAddress);
					results.push({
						reserve,
						...data,
					});
				} catch (error) {
					// Skip reserves that fail
				}
			}
			return {
				userAddress,
				reserves: results,
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
