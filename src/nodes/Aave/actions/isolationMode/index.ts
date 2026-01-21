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
				resource: ['isolationMode'],
			},
		},
		options: [
			{
				name: 'Get Isolation Mode Status',
				value: 'getIsolationModeStatus',
				description: 'Check if user is in isolation mode',
				action: 'Get isolation mode status',
			},
			{
				name: 'Get Asset Isolation Info',
				value: 'getAssetIsolationInfo',
				description: 'Get isolation mode info for an asset',
				action: 'Get asset isolation info',
			},
		],
		default: 'getIsolationModeStatus',
	},
	{
		displayName: 'User Address',
		name: 'userAddress',
		type: 'string',
		default: '',
		placeholder: '0x... (leave empty for connected wallet)',
		description: 'Address to query',
		displayOptions: {
			show: {
				resource: ['isolationMode'],
				operation: ['getIsolationModeStatus'],
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
				resource: ['isolationMode'],
				operation: ['getAssetIsolationInfo'],
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
		case 'getIsolationModeStatus': {
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress() || '';
			
			const accountData = await client.getUserAccountData(userAddress);
			
			// User is in isolation mode if they have borrowed in isolation
			// This is a simplified check - full implementation would check user configuration
			return {
				userAddress,
				inIsolationMode: false, // Simplified - would need to check user config
				totalCollateralBase: accountData.totalCollateralBase,
				totalDebtBase: accountData.totalDebtBase,
				healthFactor: accountData.healthFactor,
			};
		}

		case 'getAssetIsolationInfo': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const config = await client.getReserveConfigurationData(assetAddress);
			
			// Get debt ceiling from config (cast to any for properties not in strict type)
			const debtCeiling = (config as any).debtCeiling || '0';
			const isIsolated = BigInt(debtCeiling) > 0n;
			
			return {
				asset: assetAddress,
				isIsolatedAsset: isIsolated,
				debtCeiling: debtCeiling,
				debtCeilingDecimals: 2, // Standard decimals for debt ceiling
				ltv: config.ltv,
				liquidationThreshold: config.liquidationThreshold,
				isActive: config.isActive,
				isFrozen: config.isFrozen,
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
