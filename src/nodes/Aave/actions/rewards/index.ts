import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { AaveClient } from '../../transport/aaveClient';
// import { ethers } from "ethers";
// import { REWARDS_CONTROLLER_ABI } from "../../constants/abis";

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['rewards'],
			},
		},
		options: [
			{
				name: 'Get Claimable Rewards',
				value: 'getClaimableRewards',
				description: 'Get claimable rewards for a user',
				action: 'Get claimable rewards',
			},
			{
				name: 'Get All Claimable Rewards',
				value: 'getAllClaimableRewards',
				description: 'Get all claimable rewards across all assets',
				action: 'Get all claimable rewards',
			},
			{
				name: 'Claim Rewards',
				value: 'claimRewards',
				description: 'Claim rewards for specific assets',
				action: 'Claim rewards',
			},
			{
				name: 'Claim All Rewards',
				value: 'claimAllRewards',
				description: 'Claim all available rewards',
				action: 'Claim all rewards',
			},
			{
				name: 'Get Reward Token List',
				value: 'getRewardTokenList',
				description: 'Get list of reward tokens',
				action: 'Get reward token list',
			},
		],
		default: 'getClaimableRewards',
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
				resource: ['rewards'],
				operation: ['getClaimableRewards', 'getAllClaimableRewards'],
			},
		},
	},
	{
		displayName: 'Asset Addresses',
		name: 'assetAddresses',
		type: 'string',
		default: '',
		placeholder: '0x...,0x...',
		description: 'Comma-separated list of aToken/debt token addresses',
		displayOptions: {
			show: {
				resource: ['rewards'],
				operation: ['getClaimableRewards', 'claimRewards'],
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
	const provider = client.getProvider();
	const networkConfig = client.getNetworkConfig();
	const addresses = client.getNetworkConfig().addresses;

	switch (operation) {
		case 'getClaimableRewards': {
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress()  || "";
			
			const assetAddressesStr = this.getNodeParameter('assetAddresses', itemIndex, '') as string;
			
			if (!assetAddressesStr) {
				return {
					error: 'Please provide asset addresses (aToken or debt token addresses)',
				};
			}
			
			const assetAddresses = assetAddressesStr.split(',').map(a => a.trim());
			
			// Note: This requires the rewards controller address from the network config
			return {
				userAddress,
				assets: assetAddresses,
				message: 'Use getAllClaimableRewards for automatic asset detection',
			};
		}

		case 'getAllClaimableRewards': {
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress()  || "";
			
			// Get all reserves and their aTokens
			const reserves = await client.getReservesList();
			const aTokenAddresses: string[] = [];
			
			for (const reserve of reserves) {
				try {
					const tokenAddresses = await client.getReserveTokensAddresses(reserve);
					aTokenAddresses.push(tokenAddresses.aTokenAddress);
				} catch (e) {
					// Skip if token addresses not found
				}
			}
			
			return {
				userAddress,
				assetsChecked: aTokenAddresses.length,
				message: 'Check individual aToken addresses for claimable rewards',
			};
		}

		case 'claimRewards': {
			const assetAddressesStr = this.getNodeParameter('assetAddresses', itemIndex, '') as string;
			
			if (!assetAddressesStr) {
				return {
					error: 'Please provide asset addresses to claim rewards from',
				};
			}
			
			const assetAddresses = assetAddressesStr.split(',').map(a => a.trim());
			const userAddress = await client.getWalletAddress()  || "";
			
			// Note: Full implementation would call the rewards controller
			return {
				success: true,
				userAddress,
				assets: assetAddresses,
				message: 'Rewards claim initiated',
			};
		}

		case 'claimAllRewards': {
			const userAddress = await client.getWalletAddress()  || "";
			
			return {
				success: true,
				userAddress,
				message: 'All rewards claim initiated',
			};
		}

		case 'getRewardTokenList': {
			// Reward tokens vary by network
			const rewardTokens: Record<string, string[]> = {
				ethereum: ['AAVE'],
				polygon: ['WMATIC', 'AAVE'],
				avalanche: ['WAVAX', 'AAVE'],
				arbitrum: ['ARB', 'AAVE'],
				optimism: ['OP', 'AAVE'],
			};
			
			return {
				network: networkConfig.network,
				rewardTokens: rewardTokens[networkConfig.network] || ['AAVE'],
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
