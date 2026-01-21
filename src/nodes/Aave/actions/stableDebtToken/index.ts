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
				resource: ['stableDebtToken'],
			},
		},
		options: [
			{
				name: 'Get Balance',
				value: 'getBalance',
				description: 'Get stable debt token balance for a user',
				action: 'Get stable debt balance',
			},
			{
				name: 'Get Total Supply',
				value: 'getTotalSupply',
				description: 'Get total stable debt supply',
				action: 'Get total stable debt',
			},
			{
				name: 'Get User Stable Rate',
				value: 'getUserStableRate',
				description: 'Get user\'s individual stable borrow rate',
				action: 'Get user stable rate',
			},
			{
				name: 'Get Average Stable Rate',
				value: 'getAverageStableRate',
				description: 'Get average stable rate for the reserve',
				action: 'Get average stable rate',
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
				resource: ['stableDebtToken'],
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
				resource: ['stableDebtToken'],
				operation: ['getBalance', 'getUserStableRate'],
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
			
			const balance = await client.getStableDebtBalance(assetAddress, userAddress);
			return {
				asset: assetAddress,
				userAddress,
				stableDebtBalance: balance.toString(),
			};
		}

		case 'getTotalSupply': {
			const reserveData = await client.getReserveData(assetAddress);
			return {
				asset: assetAddress,
				totalStableDebt: (reserveData as any)['totalStableDebt'].toString(),
			};
		}

		case 'getUserStableRate': {
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress()  || "";
			
			const userData = await client.getUserReserveData(assetAddress, userAddress);
			const rate = Number(userData.stableBorrowRate || 0);
			const apy = (rate / 1e27) * 100;
			return {
				asset: assetAddress,
				userAddress,
				stableBorrowRate: userData.stableBorrowRate?.toString() || '0',
				stableBorrowAPY: apy,
			};
		}

		case 'getAverageStableRate': {
			const reserveData = await client.getReserveData(assetAddress);
			const rate = Number((reserveData as any).averageStableBorrowRate || 0);
			const apy = (rate / 1e27) * 100;
			return {
				asset: assetAddress,
				averageStableBorrowRate: (reserveData as any).averageStableBorrowRate?.toString() || '0',
				averageStableBorrowAPY: apy,
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
