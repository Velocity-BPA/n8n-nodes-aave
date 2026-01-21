import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { AaveClient } from '../../transport/aaveClient';
import { ethers } from 'ethers';
import { VARIABLE_DEBT_TOKEN_ABI } from '../../constants/abis';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['creditDelegation'],
			},
		},
		options: [
			{
				name: 'Approve Delegation',
				value: 'approveDelegation',
				description: 'Approve credit delegation to another address',
				action: 'Approve delegation',
			},
			{
				name: 'Get Borrow Allowance',
				value: 'getBorrowAllowance',
				description: 'Get borrow allowance from delegator to delegatee',
				action: 'Get borrow allowance',
			},
			{
				name: 'Borrow With Delegation',
				value: 'borrowWithDelegation',
				description: 'Borrow using delegated credit',
				action: 'Borrow with delegation',
			},
			{
				name: 'Revoke Delegation',
				value: 'revokeDelegation',
				description: 'Revoke credit delegation (set allowance to 0)',
				action: 'Revoke delegation',
			},
		],
		default: 'getBorrowAllowance',
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
				resource: ['creditDelegation'],
			},
		},
		required: true,
	},
	{
		displayName: 'Delegatee Address',
		name: 'delegatee',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'The address to delegate borrowing power to',
		displayOptions: {
			show: {
				resource: ['creditDelegation'],
				operation: ['approveDelegation', 'getBorrowAllowance', 'revokeDelegation'],
			},
		},
		required: true,
	},
	{
		displayName: 'Delegator Address',
		name: 'delegator',
		type: 'string',
		default: '',
		placeholder: '0x... (leave empty for connected wallet)',
		description: 'The address delegating borrowing power',
		displayOptions: {
			show: {
				resource: ['creditDelegation'],
				operation: ['getBorrowAllowance', 'borrowWithDelegation'],
			},
		},
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		default: '',
		placeholder: '1000.0',
		description: 'Amount to delegate/borrow',
		displayOptions: {
			show: {
				resource: ['creditDelegation'],
				operation: ['approveDelegation', 'borrowWithDelegation'],
			},
		},
		required: true,
	},
	{
		displayName: 'Rate Mode',
		name: 'rateMode',
		type: 'options',
		options: [
			{ name: 'Variable', value: 2 },
			{ name: 'Stable', value: 1 },
		],
		default: 2,
		description: 'Interest rate mode for delegation',
		displayOptions: {
			show: {
				resource: ['creditDelegation'],
				operation: ['approveDelegation', 'getBorrowAllowance', 'borrowWithDelegation', 'revokeDelegation'],
			},
		},
	},
];

const getRateMode = (mode: number): 'variable' | 'stable' => mode === 1 ? 'stable' : 'variable';
export async function execute(
	this: IExecuteFunctions,
	client: AaveClient,
	operation: string,
	itemIndex: number,
): Promise<any> {
	const provider = client.getProvider();
	const networkConfig = client.getNetworkConfig();
	const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
	const rateMode = this.getNodeParameter('rateMode', itemIndex, 2) as number;

	// Get debt token address
	const tokenAddresses = await client.getReserveTokensAddresses(assetAddress);
	const debtTokenAddress = rateMode === 2 
		? tokenAddresses.variableDebtTokenAddress 
		: tokenAddresses.stableDebtTokenAddress;

	switch (operation) {
		case 'approveDelegation': {
			const delegatee = this.getNodeParameter('delegatee', itemIndex) as string;
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			
			const wallet = new ethers.Wallet(networkConfig.privateKey, provider);
			const debtToken = new ethers.Contract(debtTokenAddress, VARIABLE_DEBT_TOKEN_ABI, wallet);
			
			const amountWei = ethers.utils.parseUnits(amount, 18); // Assuming 18 decimals
			const tx = await debtToken.approveDelegation(delegatee, amountWei);
			
			return {
				success: true,
				transactionHash: tx.hash,
				asset: assetAddress,
				delegatee,
				amount,
				rateMode: rateMode === 2 ? 'variable' : 'stable',
			};
		}

		case 'getBorrowAllowance': {
			const delegatee = this.getNodeParameter('delegatee', itemIndex) as string;
			let delegator = this.getNodeParameter('delegator', itemIndex, '') as string;
			if (!delegator) delegator = await client.getWalletAddress()  || "";
			
			const debtToken = new ethers.Contract(debtTokenAddress, VARIABLE_DEBT_TOKEN_ABI, provider);
			const allowance = await debtToken.borrowAllowance(delegator, delegatee);
			
			return {
				asset: assetAddress,
				delegator,
				delegatee,
				allowance: allowance.toString(),
				allowanceFormatted: ethers.utils.formatUnits(allowance, 18),
				rateMode: rateMode === 2 ? 'variable' : 'stable',
			};
		}

		case 'borrowWithDelegation': {
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			let delegator = this.getNodeParameter('delegator', itemIndex, '') as string;
			if (!delegator) {
				return {
					error: 'Delegator address is required for borrowing with delegation',
				};
			}
			
			// Borrow on behalf of delegator
			const rateModeStr = getRateMode(rateMode);
			const tx = await client.borrow(assetAddress, amount, rateModeStr, delegator);
			
			return {
				success: true,
				transactionHash: tx.hash,
				asset: assetAddress,
				amount,
				delegator,
				rateMode: rateModeStr,
			};
		}

		case 'revokeDelegation': {
			const delegatee = this.getNodeParameter('delegatee', itemIndex) as string;
			
			const wallet = new ethers.Wallet(networkConfig.privateKey, provider);
			const debtToken = new ethers.Contract(debtTokenAddress, VARIABLE_DEBT_TOKEN_ABI, wallet);
			
			const tx = await debtToken.approveDelegation(delegatee, 0);
			
			return {
				success: true,
				transactionHash: tx.hash,
				asset: assetAddress,
				delegatee,
				message: 'Delegation revoked',
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
