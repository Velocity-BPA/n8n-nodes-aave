import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { AaveClient } from '../../transport/aaveClient';
import { ethers } from 'ethers';
import { SAFETY_MODULE_ADDRESSES } from '../../constants/networks';
import { STK_AAVE_ABI } from '../../constants/abis';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['safetyModule'],
			},
		},
		options: [
			{
				name: 'Get Staked Balance',
				value: 'getStakedBalance',
				description: 'Get stkAAVE balance',
				action: 'Get staked balance',
			},
			{
				name: 'Get Claimable Rewards',
				value: 'getClaimableRewards',
				description: 'Get claimable AAVE rewards',
				action: 'Get claimable rewards',
			},
			{
				name: 'Get Cooldown Status',
				value: 'getCooldownStatus',
				description: 'Check cooldown activation and unstake window',
				action: 'Get cooldown status',
			},
			{
				name: 'Get Staking APY',
				value: 'getStakingAPY',
				description: 'Get current staking APY',
				action: 'Get staking APY',
			},
			{
				name: 'Stake AAVE',
				value: 'stakeAave',
				description: 'Stake AAVE tokens',
				action: 'Stake AAVE',
			},
			{
				name: 'Activate Cooldown',
				value: 'activateCooldown',
				description: 'Start cooldown period before unstaking',
				action: 'Activate cooldown',
			},
			{
				name: 'Redeem Staked',
				value: 'redeemStaked',
				description: 'Redeem staked AAVE after cooldown',
				action: 'Redeem staked',
			},
			{
				name: 'Claim Rewards',
				value: 'claimRewards',
				description: 'Claim staking rewards',
				action: 'Claim rewards',
			},
		],
		default: 'getStakedBalance',
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
				resource: ['safetyModule'],
				operation: ['getStakedBalance', 'getClaimableRewards', 'getCooldownStatus'],
			},
		},
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		default: '',
		placeholder: '100.0',
		description: 'Amount of AAVE tokens',
		displayOptions: {
			show: {
				resource: ['safetyModule'],
				operation: ['stakeAave', 'redeemStaked'],
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
	const provider = client.getProvider();
	const networkConfig = client.getNetworkConfig();
	const safetyModuleAddresses = SAFETY_MODULE_ADDRESSES[networkConfig.network as keyof typeof SAFETY_MODULE_ADDRESSES];
	
	if (!safetyModuleAddresses) {
		return {
			error: 'Safety Module is only available on Ethereum mainnet',
			supportedNetwork: 'ethereum',
		};
	}

	switch (operation) {
		case 'getStakedBalance': {
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress()  || "";
			
			const stkAaveContract = new ethers.Contract(safetyModuleAddresses.stkAave, STK_AAVE_ABI, provider);
			const balance = await stkAaveContract.balanceOf(userAddress);
			
			return {
				userAddress,
				stkAaveBalance: balance.toString(),
				stkAaveBalanceFormatted: ethers.utils.formatUnits(balance, 18),
			};
		}

		case 'getClaimableRewards': {
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress()  || "";
			
			const stkAaveContract = new ethers.Contract(safetyModuleAddresses.stkAave, STK_AAVE_ABI, provider);
			const rewards = await stkAaveContract.getTotalRewardsBalance(userAddress);
			
			return {
				userAddress,
				claimableRewards: rewards.toString(),
				claimableRewardsFormatted: ethers.utils.formatUnits(rewards, 18),
			};
		}

		case 'getCooldownStatus': {
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress()  || "";
			
			const stkAaveContract = new ethers.Contract(safetyModuleAddresses.stkAave, STK_AAVE_ABI, provider);
			const cooldownStartTimestamp = await stkAaveContract.stakersCooldowns(userAddress);
			const COOLDOWN_SECONDS = await stkAaveContract.COOLDOWN_SECONDS();
			const UNSTAKE_WINDOW = await stkAaveContract.UNSTAKE_WINDOW();
			
			const now = Math.floor(Date.now() / 1000);
			const cooldownEnd = Number(cooldownStartTimestamp) + Number(COOLDOWN_SECONDS);
			const unstakeWindowEnd = cooldownEnd + Number(UNSTAKE_WINDOW);
			
			let status = 'not_activated';
			if (cooldownStartTimestamp > 0) {
				if (now < cooldownEnd) {
					status = 'cooling_down';
				} else if (now < unstakeWindowEnd) {
					status = 'ready_to_unstake';
				} else {
					status = 'expired';
				}
			}
			
			return {
				userAddress,
				cooldownStartTimestamp: cooldownStartTimestamp.toString(),
				cooldownSeconds: COOLDOWN_SECONDS.toString(),
				unstakeWindow: UNSTAKE_WINDOW.toString(),
				status,
				cooldownEndTime: new Date(cooldownEnd * 1000).toISOString(),
				unstakeWindowEndTime: new Date(unstakeWindowEnd * 1000).toISOString(),
			};
		}

		case 'getStakingAPY': {
			// Staking APY would need to be calculated from emission rates
			// This is a simplified version
			return {
				stakingAPY: 4.5, // Example APY
				message: 'Staking APY varies based on emission rate and total staked',
			};
		}

		case 'stakeAave': {
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const wallet = new ethers.Wallet(networkConfig.privateKey, provider);
			const stkAaveContract = new ethers.Contract(safetyModuleAddresses.stkAave, STK_AAVE_ABI, wallet);
			
			const amountWei = ethers.utils.parseUnits(amount, 18);
			const tx = await stkAaveContract.stake(await wallet.getAddress(), amountWei);
			
			return {
				success: true,
				transactionHash: tx.hash,
				amount,
				message: 'AAVE staked successfully',
			};
		}

		case 'activateCooldown': {
			const wallet = new ethers.Wallet(networkConfig.privateKey, provider);
			const stkAaveContract = new ethers.Contract(safetyModuleAddresses.stkAave, STK_AAVE_ABI, wallet);
			
			const tx = await stkAaveContract.cooldown();
			
			return {
				success: true,
				transactionHash: tx.hash,
				message: 'Cooldown activated. Wait for cooldown period before redeeming.',
			};
		}

		case 'redeemStaked': {
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const wallet = new ethers.Wallet(networkConfig.privateKey, provider);
			const stkAaveContract = new ethers.Contract(safetyModuleAddresses.stkAave, STK_AAVE_ABI, wallet);
			
			const amountWei = ethers.utils.parseUnits(amount, 18);
			const tx = await stkAaveContract.redeem(await wallet.getAddress(), amountWei);
			
			return {
				success: true,
				transactionHash: tx.hash,
				amount,
				message: 'Staked AAVE redeemed successfully',
			};
		}

		case 'claimRewards': {
			const wallet = new ethers.Wallet(networkConfig.privateKey, provider);
			const stkAaveContract = new ethers.Contract(safetyModuleAddresses.stkAave, STK_AAVE_ABI, wallet);
			
			const userAddress = await wallet.getAddress();
			const rewards = await stkAaveContract.getTotalRewardsBalance(userAddress);
			const tx = await stkAaveContract.claimRewards(userAddress, rewards);
			
			return {
				success: true,
				transactionHash: tx.hash,
				claimedAmount: ethers.utils.formatUnits(rewards, 18),
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
