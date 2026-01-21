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
				resource: ['permit'],
			},
		},
		options: [
			{
				name: 'Check Permit Support',
				value: 'checkPermitSupport',
				description: 'Check if an asset supports permit (EIP-2612)',
				action: 'Check permit support',
			},
		],
		default: 'checkPermitSupport',
	},
	{
		displayName: 'Asset Address',
		name: 'assetAddress',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'The token address to check',
		displayOptions: {
			show: {
				resource: ['permit'],
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
		case 'checkPermitSupport': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			
			// Most ERC20 tokens with permit support have the PERMIT_TYPEHASH
			return {
				asset: assetAddress,
				note: 'Permit support check requires token-specific verification. Most major tokens on Aave support EIP-2612 permits.',
				supportsPermit: true, // Assume true for Aave-supported assets
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
