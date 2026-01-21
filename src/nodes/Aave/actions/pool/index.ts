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
				resource: ['pool'],
			},
		},
		options: [
			{
				name: 'Get Pool Address',
				value: 'getPoolAddress',
				description: 'Get the Aave pool contract address',
				action: 'Get pool address',
			},
			{
				name: 'Get Reserves List',
				value: 'getReservesList',
				description: 'Get all reserve assets in the pool',
				action: 'Get reserves list',
			},
			{
				name: 'Get Flash Loan Premium',
				value: 'getFlashLoanPremium',
				description: 'Get flash loan premium percentage',
				action: 'Get flash loan premium',
			},
		],
		default: 'getPoolAddress',
	},
];

export async function execute(
	this: IExecuteFunctions,
	client: AaveClient,
	operation: string,
	_itemIndex: number,
): Promise<any> {
	switch (operation) {
		case 'getPoolAddress': {
			const poolAddress = client.getPoolAddress();
			const networkConfig = client.getNetworkConfig();
			
			return {
				network: networkConfig.name,
				poolAddress,
			};
		}

		case 'getReservesList': {
			const reserves = await client.getReservesList();
			const networkConfig = client.getNetworkConfig();
			
			return {
				network: networkConfig.name,
				totalReserves: reserves.length,
				reserves,
			};
		}

		case 'getFlashLoanPremium': {
			const premium = await client.getFlashLoanPremium();
			
			return {
				totalPremiumBps: premium.total,
				toProtocolBps: premium.toProtocol,
				totalPercentage: `${Number(premium.total) / 100}%`,
				toProtocolPercentage: `${Number(premium.toProtocol) / 100}%`,
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
