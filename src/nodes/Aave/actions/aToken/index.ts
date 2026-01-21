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
				resource: ['aToken'],
			},
		},
		options: [
			{
				name: 'Get Balance',
				value: 'getBalance',
				description: 'Get aToken balance for a user',
				action: 'Get aToken balance',
			},
			{
				name: 'Get Total Supply',
				value: 'getTotalSupply',
				description: 'Get total aToken supply',
				action: 'Get total supply',
			},
			{
				name: 'Get Underlying Asset',
				value: 'getUnderlyingAsset',
				description: 'Get the underlying asset address',
				action: 'Get underlying asset',
			},
			{
				name: 'Get Reserve Token Addresses',
				value: 'getReserveTokens',
				description: 'Get aToken, variable debt, and stable debt token addresses',
				action: 'Get reserve token addresses',
			},
		],
		default: 'getBalance',
	},
	{
		displayName: 'Asset Address',
		name: 'assetAddress',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'The underlying reserve asset address',
		displayOptions: {
			show: {
				resource: ['aToken'],
			},
		},
		required: true,
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
				resource: ['aToken'],
				operation: ['getBalance'],
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
	const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;

	switch (operation) {
		case 'getBalance': {
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress()  || "";
			
			const balance = await client.getATokenBalance(assetAddress, userAddress);
			return {
				asset: assetAddress,
				userAddress,
				aTokenBalance: balance.toString(),
			};
		}

		case 'getTotalSupply': {
			const reserveData = await client.getReserveData(assetAddress);
			return {
				asset: assetAddress,
				totalSupply: (reserveData as any)['totalAToken']?.toString() || '0',
				availableLiquidity: (reserveData as any)['availableLiquidity'].toString(),
			};
		}

		case 'getUnderlyingAsset': {
			const tokenAddresses = await client.getReserveTokensAddresses(assetAddress);
			return {
				underlyingAsset: assetAddress,
				aTokenAddress: tokenAddresses.aTokenAddress,
			};
		}

		case 'getReserveTokens': {
			const tokenAddresses = await client.getReserveTokensAddresses(assetAddress);
			return {
				underlyingAsset: assetAddress,
				aTokenAddress: tokenAddresses.aTokenAddress,
				variableDebtTokenAddress: tokenAddresses.variableDebtTokenAddress,
				stableDebtTokenAddress: tokenAddresses.stableDebtTokenAddress,
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
