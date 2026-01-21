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
				resource: ['flashLoan'],
			},
		},
		options: [
			{
				name: 'Get Flash Loan Premium',
				value: 'getFlashLoanPremium',
				description: 'Get flash loan fee percentage',
				action: 'Get flash loan premium',
			},
			{
				name: 'Calculate Flash Loan Fee',
				value: 'calculateFee',
				description: 'Calculate fee for a flash loan amount',
				action: 'Calculate flash loan fee',
			},
			{
				name: 'Get Max Flash Loan Amount',
				value: 'getMaxFlashLoan',
				description: 'Get maximum flash loanable amount for an asset',
				action: 'Get max flash loan amount',
			},
		],
		default: 'getFlashLoanPremium',
	},
	{
		displayName: 'Asset Address',
		name: 'assetAddress',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'The token address for the flash loan',
		displayOptions: {
			show: {
				resource: ['flashLoan'],
				operation: ['getMaxFlashLoan', 'calculateFee'],
			},
		},
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		default: '',
		placeholder: '1000000000000000000',
		description: 'Amount in wei for fee calculation',
		displayOptions: {
			show: {
				resource: ['flashLoan'],
				operation: ['calculateFee'],
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
		case 'getFlashLoanPremium': {
			const premium = await client.getFlashLoanPremium();
			const totalPercentage = Number(premium.total) / 100;
			const protocolPercentage = Number(premium.toProtocol) / 100;
			
			return {
				totalPremium: premium.total,
				protocolPremium: premium.toProtocol,
				totalPercentage: `${totalPercentage.toFixed(2)}%`,
				protocolPercentage: `${protocolPercentage.toFixed(2)}%`,
				lpPercentage: `${(totalPercentage - protocolPercentage).toFixed(2)}%`,
			};
		}

		case 'calculateFee': {
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const premium = await client.getFlashLoanPremium();
			
			const amountBigInt = BigInt(amount);
			const premiumBps = BigInt(premium.total);
			const fee = (amountBigInt * premiumBps) / BigInt(10000);
			
			return {
				amount,
				premiumBps: premium.total,
				fee: fee.toString(),
				totalRequired: (amountBigInt + fee).toString(),
			};
		}

		case 'getMaxFlashLoan': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const isEnabled = await client.isFlashLoanEnabled(assetAddress);
			
			if (!isEnabled) {
				return {
					asset: assetAddress,
					isEnabled: false,
					maxAmount: '0',
					note: 'Flash loans not enabled for this asset',
				};
			}
			
			// Get available liquidity from reserve
			const reserveData = await client.getReserveData(assetAddress);
			
			return {
				asset: assetAddress,
				isEnabled: true,
				note: 'Max flash loan is typically equal to available liquidity',
				liquidityIndex: reserveData.liquidityIndex,
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
