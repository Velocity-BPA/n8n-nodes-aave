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
				resource: ['supply'],
			},
		},
		options: [
			{
				name: 'Supply Asset',
				value: 'supply',
				description: 'Supply an asset to Aave',
				action: 'Supply asset',
			},
			{
				name: 'Supply ETH',
				value: 'supplyETH',
				description: 'Supply native ETH (wrapped automatically)',
				action: 'Supply ETH',
			},
			{
				name: 'Withdraw Asset',
				value: 'withdraw',
				description: 'Withdraw supplied asset',
				action: 'Withdraw asset',
			},
			{
				name: 'Withdraw ETH',
				value: 'withdrawETH',
				description: 'Withdraw ETH from WETH position',
				action: 'Withdraw ETH',
			},
			{
				name: 'Withdraw Max',
				value: 'withdrawMax',
				description: 'Withdraw maximum available amount',
				action: 'Withdraw max',
			},
			{
				name: 'Get Supply Balance',
				value: 'getSupplyBalance',
				description: 'Get aToken balance for an asset',
				action: 'Get supply balance',
			},
			{
				name: 'Get Supply APY',
				value: 'getSupplyAPY',
				description: 'Get current supply APY for an asset',
				action: 'Get supply APY',
			},
			{
				name: 'Set As Collateral',
				value: 'setAsCollateral',
				description: 'Enable/disable asset as collateral',
				action: 'Set as collateral',
			},
			{
				name: 'Get Collateral Status',
				value: 'getCollateralStatus',
				description: 'Check if asset is used as collateral',
				action: 'Get collateral status',
			},
		],
		default: 'supply',
	},
	{
		displayName: 'Asset Address',
		name: 'assetAddress',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'The token address to supply/withdraw',
		displayOptions: {
			show: {
				resource: ['supply'],
				operation: ['supply', 'withdraw', 'withdrawMax', 'getSupplyBalance', 'getSupplyAPY', 'setAsCollateral', 'getCollateralStatus'],
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
		description: 'Amount to supply/withdraw (in token units)',
		displayOptions: {
			show: {
				resource: ['supply'],
				operation: ['supply', 'withdraw', 'supplyETH', 'withdrawETH'],
			},
		},
		required: true,
	},
	{
		displayName: 'Use As Collateral',
		name: 'useAsCollateral',
		type: 'boolean',
		default: true,
		description: 'Whether to use the supplied asset as collateral',
		displayOptions: {
			show: {
				resource: ['supply'],
				operation: ['setAsCollateral'],
			},
		},
	},
	{
		displayName: 'On Behalf Of',
		name: 'onBehalfOf',
		type: 'string',
		default: '',
		placeholder: '0x... (optional)',
		description: 'Address to supply on behalf of (leave empty for self)',
		displayOptions: {
			show: {
				resource: ['supply'],
				operation: ['supply', 'supplyETH'],
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
				resource: ['supply'],
				operation: ['getSupplyBalance', 'getCollateralStatus'],
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
		case 'supply': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const onBehalfOf = this.getNodeParameter('onBehalfOf', itemIndex, '') as string;
			
			const tx = await client.supply(assetAddress, amount, onBehalfOf || undefined);
			return {
				success: true,
				transactionHash: tx.hash,
				asset: assetAddress,
				amount,
				onBehalfOf: onBehalfOf || await client.getWalletAddress()  || "",
			};
		}

		case 'supplyETH': {
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const onBehalfOf = this.getNodeParameter('onBehalfOf', itemIndex, '') as string;
			
			const tx = await client.depositETH(amount, onBehalfOf || undefined);
			return {
				success: true,
				transactionHash: tx.hash,
				amount,
				onBehalfOf: onBehalfOf || await client.getWalletAddress()  || "",
			};
		}

		case 'withdraw': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			
			const tx = await client.withdraw(assetAddress, amount);
			return {
				success: true,
				transactionHash: tx.hash,
				asset: assetAddress,
				amount,
			};
		}

		case 'withdrawETH': {
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			
			const tx = await client.withdrawETH(amount);
			return {
				success: true,
				transactionHash: tx.hash,
				amount,
			};
		}

		case 'withdrawMax': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const userAddress = await client.getWalletAddress()  || "";
			
			// Get max withdrawal amount
			const balance = await client.getATokenBalance(assetAddress, userAddress);
			const tx = await client.withdraw(assetAddress, balance.toString());
			return {
				success: true,
				transactionHash: tx.hash,
				asset: assetAddress,
				amount: balance.toString(),
			};
		}

		case 'getSupplyBalance': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress()  || "";
			
			const balance = await client.getATokenBalance(assetAddress, userAddress);
			return {
				asset: assetAddress,
				userAddress,
				balance: balance.toString(),
			};
		}

		case 'getSupplyAPY': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const reserveData = await client.getReserveData(assetAddress);
			const liquidityRate = Number(reserveData.currentLiquidityRate);
			// Convert ray to APY percentage
			const apy = (liquidityRate / 1e27) * 100;
			return {
				asset: assetAddress,
				liquidityRate: reserveData.currentLiquidityRate.toString(),
				supplyAPY: apy,
				supplyAPYFormatted: `${apy.toFixed(2)}%`,
			};
		}

		case 'setAsCollateral': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const useAsCollateral = this.getNodeParameter('useAsCollateral', itemIndex) as boolean;
			
			const tx = await client.setUserUseReserveAsCollateral(assetAddress, useAsCollateral);
			return {
				success: true,
				transactionHash: tx.hash,
				asset: assetAddress,
				useAsCollateral,
			};
		}

		case 'getCollateralStatus': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress()  || "";
			
			const data = await client.getUserReserveData(assetAddress, userAddress);
			return {
				asset: assetAddress,
				userAddress,
				usedAsCollateral: data.usageAsCollateralEnabled || false,
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
