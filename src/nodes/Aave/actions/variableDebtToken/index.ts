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
				resource: ['variableDebtToken'],
			},
		},
		options: [
			{
				name: 'Get Balance',
				value: 'getBalance',
				description: 'Get variable debt token balance for a user',
				action: 'Get variable debt balance',
			},
			{
				name: 'Get Total Supply',
				value: 'getTotalSupply',
				description: 'Get total variable debt supply',
				action: 'Get total variable debt',
			},
			{
				name: 'Get Scaled Balance',
				value: 'getScaledBalance',
				description: 'Get scaled variable debt balance',
				action: 'Get scaled balance',
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
				resource: ['variableDebtToken'],
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
				resource: ['variableDebtToken'],
				operation: ['getBalance', 'getScaledBalance'],
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
			
			const balance = await client.getVariableDebtBalance(assetAddress, userAddress);
			return {
				asset: assetAddress,
				userAddress,
				variableDebtBalance: balance.toString(),
			};
		}

		case 'getTotalSupply': {
			const reserveData = await client.getReserveData(assetAddress);
			return {
				asset: assetAddress,
				totalVariableDebt: (reserveData as any)['totalVariableDebt'].toString(),
			};
		}

		case 'getScaledBalance': {
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress()  || "";
			
			const userData = await client.getUserReserveData(assetAddress, userAddress);
			return {
				asset: assetAddress,
				userAddress,
				scaledVariableDebt: userData.scaledVariableDebt?.toString() || '0',
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
