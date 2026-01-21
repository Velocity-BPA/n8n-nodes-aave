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
				resource: ['eMode'],
			},
		},
		options: [
			{
				name: 'Get User E-Mode',
				value: 'getUserEMode',
				description: 'Get user\'s current E-Mode category',
				action: 'Get user E-Mode',
			},
			{
				name: 'Set User E-Mode',
				value: 'setUserEMode',
				description: 'Set user\'s E-Mode category',
				action: 'Set user E-Mode',
			},
			{
				name: 'Exit E-Mode',
				value: 'exitEMode',
				description: 'Exit E-Mode (set category to 0)',
				action: 'Exit E-Mode',
			},
			{
				name: 'Get E-Mode Category Data',
				value: 'getEModeCategoryData',
				description: 'Get configuration for an E-Mode category',
				action: 'Get E-Mode category data',
			},
		],
		default: 'getUserEMode',
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
				resource: ['eMode'],
				operation: ['getUserEMode'],
			},
		},
	},
	{
		displayName: 'E-Mode Category ID',
		name: 'categoryId',
		type: 'number',
		default: 1,
		description: 'The E-Mode category ID (0 = no E-Mode, 1 = Stablecoins, 2 = ETH correlated, etc.)',
		displayOptions: {
			show: {
				resource: ['eMode'],
				operation: ['setUserEMode', 'getEModeCategoryData'],
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
		case 'getUserEMode': {
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress()  || "";
			
			const categoryId = await client.getUserEMode(userAddress);
			const categoryNames: Record<number, string> = {
				0: 'None',
				1: 'Stablecoins',
				2: 'ETH Correlated',
				3: 'MATIC Correlated',
			};
			
			return {
				userAddress,
				eModeCategory: categoryId,
				eModeName: categoryNames[categoryId] || `Category ${categoryId}`,
				isInEMode: categoryId > 0,
			};
		}

		case 'setUserEMode': {
			const categoryId = this.getNodeParameter('categoryId', itemIndex) as number;
			const tx = await client.setUserEMode(categoryId);
			
			return {
				success: true,
				transactionHash: tx.hash,
				eModeCategory: categoryId,
			};
		}

		case 'exitEMode': {
			const tx = await client.setUserEMode(0);
			
			return {
				success: true,
				transactionHash: tx.hash,
				eModeCategory: 0,
				message: 'Exited E-Mode successfully',
			};
		}

		case 'getEModeCategoryData': {
			const categoryId = this.getNodeParameter('categoryId', itemIndex) as number;
			
			// E-Mode category data would need a specific contract call
			// This is a simplified version
			const categoryNames: Record<number, string> = {
				0: 'None',
				1: 'Stablecoins',
				2: 'ETH Correlated',
				3: 'MATIC Correlated',
			};
			
			// Typical E-Mode configurations
			const categoryConfigs: Record<number, any> = {
				0: { ltv: 0, liquidationThreshold: 0, liquidationBonus: 0 },
				1: { ltv: 9700, liquidationThreshold: 9750, liquidationBonus: 10100, label: 'Stablecoins' },
				2: { ltv: 9000, liquidationThreshold: 9300, liquidationBonus: 10100, label: 'ETH correlated' },
			};
			
			return {
				categoryId,
				categoryName: categoryNames[categoryId] || `Category ${categoryId}`,
				config: categoryConfigs[categoryId] || { ltv: 0, liquidationThreshold: 0, liquidationBonus: 0 },
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
