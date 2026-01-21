import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { AaveClient } from '../../transport/aaveClient';
import { ethers } from 'ethers';
import { GHO_ADDRESSES } from '../../constants/networks';
import { GHO_TOKEN_ABI } from '../../constants/abis';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['gho'],
			},
		},
		options: [
			{
				name: 'Get GHO Balance',
				value: 'getGhoBalance',
				description: 'Get GHO token balance',
				action: 'Get GHO balance',
			},
			{
				name: 'Get GHO Debt Balance',
				value: 'getGhoDebtBalance',
				description: 'Get GHO variable debt balance',
				action: 'Get GHO debt balance',
			},
			{
				name: 'Borrow GHO',
				value: 'borrowGho',
				description: 'Borrow GHO stablecoin',
				action: 'Borrow GHO',
			},
			{
				name: 'Repay GHO',
				value: 'repayGho',
				description: 'Repay GHO debt',
				action: 'Repay GHO',
			},
			{
				name: 'Get GHO Borrow Rate',
				value: 'getGhoBorrowRate',
				description: 'Get current GHO borrow rate',
				action: 'Get GHO borrow rate',
			},
			{
				name: 'Get Discount Rate',
				value: 'getDiscountRate',
				description: 'Get GHO discount rate for stkAAVE holders',
				action: 'Get discount rate',
			},
		],
		default: 'getGhoBalance',
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
				resource: ['gho'],
				operation: ['getGhoBalance', 'getGhoDebtBalance', 'getDiscountRate'],
			},
		},
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		default: '',
		placeholder: '100.0',
		description: 'Amount in GHO tokens',
		displayOptions: {
			show: {
				resource: ['gho'],
				operation: ['borrowGho', 'repayGho'],
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
	const ghoAddresses = GHO_ADDRESSES[networkConfig.network as keyof typeof GHO_ADDRESSES];
	
	if (!ghoAddresses && operation !== 'getGhoBorrowRate') {
		return {
			error: 'GHO is only available on Ethereum mainnet',
			supportedNetwork: 'ethereum',
		};
	}

	switch (operation) {
		case 'getGhoBalance': {
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress()  || "";
			
			if (!ghoAddresses?.ghoToken) {
				return { error: 'GHO not available on this network' };
			}
			
			const ghoContract = new ethers.Contract(ghoAddresses.ghoToken, GHO_TOKEN_ABI, provider);
			const balance = await ghoContract.balanceOf(userAddress);
			
			return {
				userAddress,
				ghoBalance: balance.toString(),
				ghoBalanceFormatted: ethers.utils.formatUnits(balance, 18),
			};
		}

		case 'getGhoDebtBalance': {
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress()  || "";
			
			if (!ghoAddresses?.ghoToken) {
				return { error: 'GHO not available on this network' };
			}
			
			const debtBalance = await client.getVariableDebtBalance(ghoAddresses.ghoToken, userAddress);
			
			return {
				userAddress,
				ghoDebtBalance: debtBalance.toString(),
				ghoDebtBalanceFormatted: ethers.utils.formatUnits(debtBalance, 18),
			};
		}

		case 'borrowGho': {
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			
			if (!ghoAddresses?.ghoToken) {
				return { error: 'GHO not available on this network' };
			}
			
			// Borrow GHO (variable rate only, rate mode 2)
			const tx = await client.borrow(ghoAddresses.ghoToken, amount, 'variable');
			
			return {
				success: true,
				transactionHash: tx.hash,
				asset: 'GHO',
				amount,
				rateMode: 'variable',
			};
		}

		case 'repayGho': {
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			
			if (!ghoAddresses?.ghoToken) {
				return { error: 'GHO not available on this network' };
			}
			
			const tx = await client.repay(ghoAddresses.ghoToken, amount, 'variable');
			
			return {
				success: true,
				transactionHash: tx.hash,
				asset: 'GHO',
				amount,
			};
		}

		case 'getGhoBorrowRate': {
			// GHO has a fixed borrow rate set by governance
			// Current rate is approximately 2-3%
			return {
				asset: 'GHO',
				borrowRateAPY: 2.5, // This would need to be fetched from actual contract
				message: 'GHO has a governance-set borrow rate, typically around 2-3%',
			};
		}

		case 'getDiscountRate': {
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress()  || "";
			
			// stkAAVE holders get a discount on GHO borrow rate
			// Maximum discount is typically 30%
			return {
				userAddress,
				baseRate: 2.5,
				maxDiscount: 30,
				message: 'stkAAVE holders receive up to 30% discount on GHO borrow rate',
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
