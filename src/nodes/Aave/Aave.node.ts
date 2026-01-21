import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { createAaveClient, AaveClient } from './transport/aaveClient';
import * as account from './actions/account';
import * as supply from './actions/supply';
import * as borrow from './actions/borrow';
import * as flashLoan from './actions/flashLoan';
import * as liquidation from './actions/liquidation';
import * as reserve from './actions/reserve';
import * as interestRate from './actions/interestRate';
import * as aToken from './actions/aToken';
import * as variableDebtToken from './actions/variableDebtToken';
import * as stableDebtToken from './actions/stableDebtToken';
import * as eMode from './actions/eMode';
import * as isolationMode from './actions/isolationMode';
import * as gho from './actions/gho';
import * as safetyModule from './actions/safetyModule';
import * as governance from './actions/governance';
import * as rewards from './actions/rewards';
import * as priceOracle from './actions/priceOracle';
import * as pool from './actions/pool';
import * as portal from './actions/portal';
import * as creditDelegation from './actions/creditDelegation';
import * as permit from './actions/permit';
import * as utility from './actions/utility';

export class Aave implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Aave',
		name: 'aave',
		icon: 'file:aave.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with Aave Protocol - DeFi lending and borrowing',
		defaults: {
			name: 'Aave',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'aaveNetwork',
				required: true,
			},
			{
				name: 'aaveApi',
				required: false,
			},
			{
				name: 'priceOracle',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account', description: 'User account data and positions' },
					{ name: 'aToken', value: 'aToken', description: 'Interest-bearing supply tokens' },
					{ name: 'Borrow', value: 'borrow', description: 'Borrow assets from Aave' },
					{ name: 'Credit Delegation', value: 'creditDelegation', description: 'Delegate borrowing power' },
					{ name: 'E-Mode', value: 'eMode', description: 'Efficiency mode for correlated assets' },
					{ name: 'Flash Loan', value: 'flashLoan', description: 'Execute flash loans' },
					{ name: 'GHO', value: 'gho', description: 'Aave native stablecoin operations' },
					{ name: 'Governance', value: 'governance', description: 'Aave DAO governance' },
					{ name: 'Interest Rate', value: 'interestRate', description: 'Interest rate data' },
					{ name: 'Isolation Mode', value: 'isolationMode', description: 'Isolation mode status' },
					{ name: 'Liquidation', value: 'liquidation', description: 'Liquidate unhealthy positions' },
					{ name: 'Permit', value: 'permit', description: 'Gasless approvals (EIP-2612)' },
					{ name: 'Pool', value: 'pool', description: 'Pool configuration and data' },
					{ name: 'Portal', value: 'portal', description: 'Cross-chain operations' },
					{ name: 'Price Oracle', value: 'priceOracle', description: 'Asset price data' },
					{ name: 'Reserve', value: 'reserve', description: 'Reserve data and configuration' },
					{ name: 'Rewards', value: 'rewards', description: 'Claim incentive rewards' },
					{ name: 'Safety Module', value: 'safetyModule', description: 'stkAAVE staking' },
					{ name: 'Stable Debt Token', value: 'stableDebtToken', description: 'Stable rate debt tokens' },
					{ name: 'Supply', value: 'supply', description: 'Supply assets to Aave' },
					{ name: 'Utility', value: 'utility', description: 'Helper functions and calculations' },
					{ name: 'Variable Debt Token', value: 'variableDebtToken', description: 'Variable rate debt tokens' },
				],
				default: 'account',
			},
			// Account operations
			...account.description,
			// Supply operations
			...supply.description,
			// Borrow operations
			...borrow.description,
			// Flash Loan operations
			...flashLoan.description,
			// Liquidation operations
			...liquidation.description,
			// Reserve operations
			...reserve.description,
			// Interest Rate operations
			...interestRate.description,
			// aToken operations
			...aToken.description,
			// Variable Debt Token operations
			...variableDebtToken.description,
			// Stable Debt Token operations
			...stableDebtToken.description,
			// E-Mode operations
			...eMode.description,
			// Isolation Mode operations
			...isolationMode.description,
			// GHO operations
			...gho.description,
			// Safety Module operations
			...safetyModule.description,
			// Governance operations
			...governance.description,
			// Rewards operations
			...rewards.description,
			// Price Oracle operations
			...priceOracle.description,
			// Pool operations
			...pool.description,
			// Portal operations
			...portal.description,
			// Credit Delegation operations
			...creditDelegation.description,
			// Permit operations
			...permit.description,
			// Utility operations
			...utility.description,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Get credentials
		const credentials = await this.getCredentials('aaveNetwork');
		
		// Create Aave client
		let client: AaveClient;
		try {
			const version = (credentials.aaveVersion as string || 'v3').toLowerCase() as 'v2' | 'v3';
			client = await createAaveClient({
				network: credentials.network as string,
				version: version,
				rpcUrl: credentials.rpcUrl as string,
				privateKey: credentials.privateKey as string,
				chainId: credentials.chainId as number,
			});
		} catch (error) {
			throw new NodeOperationError(
				this.getNode(),
				`Failed to initialize Aave client: ${(error as Error).message}`,
			);
		}

		for (let i = 0; i < items.length; i++) {
			try {
				let result: any;

				switch (resource) {
					case 'account':
						result = await account.execute.call(this, client, operation, i);
						break;
					case 'supply':
						result = await supply.execute.call(this, client, operation, i);
						break;
					case 'borrow':
						result = await borrow.execute.call(this, client, operation, i);
						break;
					case 'flashLoan':
						result = await flashLoan.execute.call(this, client, operation, i);
						break;
					case 'liquidation':
						result = await liquidation.execute.call(this, client, operation, i);
						break;
					case 'reserve':
						result = await reserve.execute.call(this, client, operation, i);
						break;
					case 'interestRate':
						result = await interestRate.execute.call(this, client, operation, i);
						break;
					case 'aToken':
						result = await aToken.execute.call(this, client, operation, i);
						break;
					case 'variableDebtToken':
						result = await variableDebtToken.execute.call(this, client, operation, i);
						break;
					case 'stableDebtToken':
						result = await stableDebtToken.execute.call(this, client, operation, i);
						break;
					case 'eMode':
						result = await eMode.execute.call(this, client, operation, i);
						break;
					case 'isolationMode':
						result = await isolationMode.execute.call(this, client, operation, i);
						break;
					case 'gho':
						result = await gho.execute.call(this, client, operation, i);
						break;
					case 'safetyModule':
						result = await safetyModule.execute.call(this, client, operation, i);
						break;
					case 'governance':
						result = await governance.execute.call(this, client, operation, i);
						break;
					case 'rewards':
						result = await rewards.execute.call(this, client, operation, i);
						break;
					case 'priceOracle':
						result = await priceOracle.execute.call(this, client, operation, i);
						break;
					case 'pool':
						result = await pool.execute.call(this, client, operation, i);
						break;
					case 'portal':
						result = await portal.execute.call(this, client, operation, i);
						break;
					case 'creditDelegation':
						result = await creditDelegation.execute.call(this, client, operation, i);
						break;
					case 'permit':
						result = await permit.execute.call(this, client, operation, i);
						break;
					case 'utility':
						result = await utility.execute.call(this, client, operation, i);
						break;
					default:
						throw new NodeOperationError(
							this.getNode(),
							`Unknown resource: ${resource}`,
							{ itemIndex: i },
						);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(result),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
