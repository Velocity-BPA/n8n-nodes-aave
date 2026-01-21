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
				resource: ['portal'],
			},
		},
		options: [
			{
				name: 'Get Bridge Protocol Fee',
				value: 'getBridgeProtocolFee',
				description: 'Get the bridge protocol fee for portal operations',
				action: 'Get bridge protocol fee',
			},
			{
				name: 'Get Portal Info',
				value: 'getPortalInfo',
				description: 'Get portal information for an asset',
				action: 'Get portal info',
			},
		],
		default: 'getBridgeProtocolFee',
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
				resource: ['portal'],
				operation: ['getPortalInfo'],
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
		case 'getBridgeProtocolFee': {
			// Portal operations are only available in V3
			const networkConfig = client.getNetworkConfig();
			
			return {
				network: networkConfig.name,
				note: 'Portal/bridge operations are only available in Aave V3',
				bridgeProtocolFee: '0', // Would need to query from pool
			};
		}

		case 'getPortalInfo': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const config = await client.getReserveConfigurationData(assetAddress);
			
			// Get unbacked mint cap (V3 feature)
			const unbackedMintCap = (config as any).unbackedMintCap || '0';
			
			return {
				asset: assetAddress,
				unbackedMintCap,
				isActive: config.isActive,
				isFrozen: config.isFrozen,
				note: 'Portal features are only available in Aave V3',
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
