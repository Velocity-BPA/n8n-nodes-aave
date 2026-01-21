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
				resource: ['borrow'],
			},
		},
		options: [
			{
				name: 'Borrow Asset',
				value: 'borrow',
				description: 'Borrow an asset from Aave',
				action: 'Borrow asset',
			},
			{
				name: 'Repay Asset',
				value: 'repay',
				description: 'Repay borrowed asset',
				action: 'Repay asset',
			},
			{
				name: 'Repay Max',
				value: 'repayMax',
				description: 'Repay entire debt position',
				action: 'Repay max',
			},
			{
				name: 'Get Borrow Balance',
				value: 'getBorrowBalance',
				description: 'Get current borrow balance',
				action: 'Get borrow balance',
			},
			{
				name: 'Get Variable Borrow APY',
				value: 'getVariableBorrowAPY',
				description: 'Get variable borrow rate APY',
				action: 'Get variable borrow APY',
			},
			{
				name: 'Get Stable Borrow APY',
				value: 'getStableBorrowAPY',
				description: 'Get stable borrow rate APY',
				action: 'Get stable borrow APY',
			},
			{
				name: 'Get Available to Borrow',
				value: 'getAvailableToBorrow',
				description: 'Get maximum borrowable amount for an asset',
				action: 'Get available to borrow',
			},
			{
				name: 'Swap Rate Mode',
				value: 'swapRateMode',
				description: 'Swap between stable and variable rate',
				action: 'Swap rate mode',
			},
			{
				name: 'Get Borrowed Assets',
				value: 'getBorrowedAssets',
				description: 'Get all assets currently borrowed',
				action: 'Get borrowed assets',
			},
		],
		default: 'borrow',
	},
	{
		displayName: 'Asset Address',
		name: 'assetAddress',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'The token address to borrow/repay',
		displayOptions: {
			show: {
				resource: ['borrow'],
				operation: ['borrow', 'repay', 'repayMax', 'getBorrowBalance', 'getVariableBorrowAPY', 'getStableBorrowAPY', 'getAvailableToBorrow', 'swapRateMode'],
			},
		},
		required: true,
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		default: '',
		placeholder: '1.0',
		description: 'Amount to borrow/repay (in token units)',
		displayOptions: {
			show: {
				resource: ['borrow'],
				operation: ['borrow', 'repay'],
			},
		},
		required: true,
	},
	{
		displayName: 'Interest Rate Mode',
		name: 'interestRateMode',
		type: 'options',
		options: [
			{ name: 'Variable', value: 2 },
			{ name: 'Stable', value: 1 },
		],
		default: 2,
		description: 'The interest rate mode (variable or stable)',
		displayOptions: {
			show: {
				resource: ['borrow'],
				operation: ['borrow', 'repay', 'repayMax', 'swapRateMode'],
			},
		},
	},
	{
		displayName: 'On Behalf Of',
		name: 'onBehalfOf',
		type: 'string',
		default: '',
		placeholder: '0x... (optional)',
		description: 'Address to borrow on behalf of (requires delegation)',
		displayOptions: {
			show: {
				resource: ['borrow'],
				operation: ['borrow'],
			},
		},
	},
	{
		displayName: 'User Address',
		name: 'userAddress',
		type: 'string',
		default: '',
		placeholder: '0x... (leave empty for connected wallet)',
		description: 'Address to query (leave empty for connected wallet)',
		displayOptions: {
			show: {
				resource: ['borrow'],
				operation: ['getBorrowBalance', 'getAvailableToBorrow', 'getBorrowedAssets'],
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
	// Helper to convert rate mode number to string
	const getRateMode = (mode: number): 'variable' | 'stable' => mode === 1 ? 'stable' : 'variable';
	
	switch (operation) {
		case 'borrow': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const interestRateMode = this.getNodeParameter('interestRateMode', itemIndex) as number;
			const onBehalfOf = this.getNodeParameter('onBehalfOf', itemIndex, '') as string;
			
			const rateMode = getRateMode(interestRateMode);
			const tx = await client.borrow(assetAddress, amount, rateMode, onBehalfOf || undefined);
			return {
				success: true,
				transactionHash: tx.hash,
				asset: assetAddress,
				amount,
				interestRateMode: rateMode,
				onBehalfOf: onBehalfOf || await client.getWalletAddress() || '',
			};
		}

		case 'repay': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const interestRateMode = this.getNodeParameter('interestRateMode', itemIndex) as number;
			
			const rateMode = getRateMode(interestRateMode);
			const tx = await client.repay(assetAddress, amount, rateMode);
			return {
				success: true,
				transactionHash: tx.hash,
				asset: assetAddress,
				amount,
				interestRateMode: rateMode,
			};
		}

		case 'repayMax': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const interestRateMode = this.getNodeParameter('interestRateMode', itemIndex) as number;
			const userAddress = await client.getWalletAddress() || '';
			
			// Get current debt
			const rateMode = getRateMode(interestRateMode);
			let debt;
			if (rateMode === 'variable') {
				const tokenAddresses = await client.getReserveTokensAddresses(assetAddress);
				debt = await client.getVariableDebtBalance(tokenAddresses.variableDebtTokenAddress, userAddress);
			} else {
				const tokenAddresses = await client.getReserveTokensAddresses(assetAddress);
				debt = await client.getStableDebtBalance(tokenAddresses.stableDebtTokenAddress, userAddress);
			}
			
			// Use max uint256 to repay all
			const maxUint = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
			const tx = await client.repay(assetAddress, maxUint, rateMode);
			return {
				success: true,
				transactionHash: tx.hash,
				asset: assetAddress,
				debtRepaid: debt.toString(),
				interestRateMode: rateMode,
			};
		}

		case 'getBorrowBalance': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress() || '';
			
			const tokenAddresses = await client.getReserveTokensAddresses(assetAddress);
			const variableDebt = await client.getVariableDebtBalance(tokenAddresses.variableDebtTokenAddress, userAddress);
			const stableDebt = await client.getStableDebtBalance(tokenAddresses.stableDebtTokenAddress, userAddress);
			
			return {
				asset: assetAddress,
				userAddress,
				variableDebt: variableDebt.toString(),
				stableDebt: stableDebt.toString(),
				totalDebt: (BigInt(variableDebt) + BigInt(stableDebt)).toString(),
			};
		}

		case 'getVariableBorrowAPY': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const reserveData = await client.getReserveData(assetAddress);
			const variableRate = Number(reserveData.currentVariableBorrowRate);
			const apy = (variableRate / 1e27) * 100;
			return {
				asset: assetAddress,
				variableBorrowRate: reserveData.currentVariableBorrowRate.toString(),
				variableBorrowAPY: apy,
				variableBorrowAPYFormatted: `${apy.toFixed(2)}%`,
			};
		}

		case 'getStableBorrowAPY': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const reserveData = await client.getReserveData(assetAddress);
			const stableRate = Number(reserveData.currentStableBorrowRate);
			const apy = (stableRate / 1e27) * 100;
			return {
				asset: assetAddress,
				stableBorrowRate: reserveData.currentStableBorrowRate.toString(),
				stableBorrowAPY: apy,
				stableBorrowAPYFormatted: `${apy.toFixed(2)}%`,
			};
		}

		case 'getAvailableToBorrow': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress() || '';
			
			const accountData = await client.getUserAccountData(userAddress);
			const assetPrice = await client.getAssetPrice(assetAddress);
			const decimals = await client.getReserveDecimals(assetAddress);
			
			const availableBorrowsBase = Number(accountData.availableBorrowsBase);
			const price = Number(assetPrice);
			
			// Calculate max borrowable in asset units
			const maxBorrowable = (availableBorrowsBase / price) * Math.pow(10, decimals - 8);
			
			return {
				asset: assetAddress,
				userAddress,
				availableBorrowsUSD: availableBorrowsBase / 1e8,
				assetPrice: price / 1e8,
				maxBorrowableAmount: maxBorrowable,
			};
		}

		case 'swapRateMode': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const interestRateMode = this.getNodeParameter('interestRateMode', itemIndex) as number;
			
			// Note: This swaps TO the specified mode
			const rateMode = getRateMode(interestRateMode);
			const tx = await client.borrow(assetAddress, '0', rateMode);
			return {
				success: true,
				transactionHash: tx.hash,
				asset: assetAddress,
				newRateMode: rateMode,
			};
		}

		case 'getBorrowedAssets': {
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress() || '';
			
			const reserves = await client.getReservesList();
			const borrowedAssets = [];
			
			for (const reserve of reserves) {
				try {
					const tokenAddresses = await client.getReserveTokensAddresses(reserve);
					const variableDebt = await client.getVariableDebtBalance(tokenAddresses.variableDebtTokenAddress, userAddress);
					const stableDebt = await client.getStableDebtBalance(tokenAddresses.stableDebtTokenAddress, userAddress);
					
					if (BigInt(variableDebt) > 0n || BigInt(stableDebt) > 0n) {
						borrowedAssets.push({
							asset: reserve,
							variableDebt: variableDebt.toString(),
							stableDebt: stableDebt.toString(),
							totalDebt: (BigInt(variableDebt) + BigInt(stableDebt)).toString(),
						});
					}
				} catch (error) {
					// Skip assets that fail
				}
			}
			
			return {
				userAddress,
				borrowedAssets,
				totalBorrowedCount: borrowedAssets.length,
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
