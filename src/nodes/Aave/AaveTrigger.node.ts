import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
} from 'n8n-workflow';

import { ethers } from 'ethers';
import { getNetworkConfig } from './constants/networks';
import { POOL_V3_ABI } from './constants/abis';

export class AaveTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Aave Trigger',
		name: 'aaveTrigger',
		icon: 'file:aave.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Trigger on Aave Protocol events',
		defaults: {
			name: 'Aave Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'aaveNetwork',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Supply',
						value: 'Supply',
						description: 'Triggered when assets are supplied',
					},
					{
						name: 'Withdraw',
						value: 'Withdraw',
						description: 'Triggered when assets are withdrawn',
					},
					{
						name: 'Borrow',
						value: 'Borrow',
						description: 'Triggered when assets are borrowed',
					},
					{
						name: 'Repay',
						value: 'Repay',
						description: 'Triggered when debt is repaid',
					},
					{
						name: 'Flash Loan',
						value: 'FlashLoan',
						description: 'Triggered when flash loans are executed',
					},
					{
						name: 'Liquidation Call',
						value: 'LiquidationCall',
						description: 'Triggered when positions are liquidated',
					},
					{
						name: 'Reserve Used As Collateral',
						value: 'ReserveUsedAsCollateralEnabled',
						description: 'Triggered when collateral status changes',
					},
					{
						name: 'User E-Mode Set',
						value: 'UserEModeSet',
						description: 'Triggered when user E-Mode is changed',
					},
				],
				default: 'Supply',
				description: 'The event to listen for',
			},
			{
				displayName: 'Filter by Address',
				name: 'filterAddress',
				type: 'string',
				default: '',
				placeholder: '0x...',
				description: 'Only trigger for events involving this address (optional)',
			},
			{
				displayName: 'Filter by Asset',
				name: 'filterAsset',
				type: 'string',
				default: '',
				placeholder: '0x...',
				description: 'Only trigger for events involving this asset (optional)',
			},
			{
				displayName: 'Polling Interval',
				name: 'pollInterval',
				type: 'number',
				default: 60,
				description: 'How often to check for new events (in seconds)',
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = await this.getCredentials('aaveNetwork');
		const event = this.getNodeParameter('event') as string;
		const filterAddress = this.getNodeParameter('filterAddress', '') as string;
		const filterAsset = this.getNodeParameter('filterAsset', '') as string;
		const pollInterval = this.getNodeParameter('pollInterval', 60) as number;

		const networkConfig = getNetworkConfig(credentials.network as string);
		const version = credentials.aaveVersion as string || 'v3';
		const poolAddress = version === 'v2' 
			? networkConfig.aaveV2?.pool 
			: networkConfig.aaveV3?.pool;

		if (!poolAddress) {
			throw new Error(`Aave ${version} not available on ${credentials.network}`);
		}

		const provider = new ethers.providers.JsonRpcProvider(credentials.rpcUrl as string);
		const poolContract = new ethers.Contract(
			poolAddress,
			POOL_V3_ABI,
			provider,
		);

		let lastBlockProcessed = await provider.getBlockNumber();

		const checkEvents = async () => {
			const currentBlock = await provider.getBlockNumber();
			
			if (currentBlock <= lastBlockProcessed) {
				return;
			}

			try {
				const filter = poolContract.filters[event]?.();
				if (!filter) {
					console.error(`Event ${event} not found in contract`);
					return;
				}

				const events = await poolContract.queryFilter(
					filter,
					lastBlockProcessed + 1,
					currentBlock,
				);

				for (const eventLog of events) {
					const parsed = poolContract.interface.parseLog({
						topics: eventLog.topics as string[],
						data: eventLog.data,
					});

					if (!parsed) continue;

					// Apply filters
					if (filterAddress) {
						const hasAddress = Object.values(parsed.args).some(
							(arg) => typeof arg === 'string' && arg.toLowerCase() === filterAddress.toLowerCase()
						);
						if (!hasAddress) continue;
					}

					if (filterAsset) {
						const hasAsset = Object.values(parsed.args).some(
							(arg) => typeof arg === 'string' && arg.toLowerCase() === filterAsset.toLowerCase()
						);
						if (!hasAsset) continue;
					}

					// Format the event data
					const eventData: Record<string, any> = {
						event: event,
						blockNumber: eventLog.blockNumber,
						transactionHash: eventLog.transactionHash,
						logIndex: eventLog.logIndex,
						network: credentials.network,
						timestamp: new Date().toISOString(),
					};

					// Add parsed arguments
					if (parsed.args) {
						for (const [key, value] of Object.entries(parsed.args)) {
							if (isNaN(Number(key))) {
								eventData[key] = typeof value === 'bigint' ? value.toString() : value;
							}
						}
					}

					this.emit([this.helpers.returnJsonArray([eventData])]);
				}

				lastBlockProcessed = currentBlock;
			} catch (error) {
				console.error('Error checking events:', error);
			}
		};

		// Initial check
		await checkEvents();

		// Set up polling
		const intervalId = setInterval(checkEvents, pollInterval * 1000);

		const closeFunction = async () => {
			clearInterval(intervalId);
		};

		return {
			closeFunction,
		};
	}
}
