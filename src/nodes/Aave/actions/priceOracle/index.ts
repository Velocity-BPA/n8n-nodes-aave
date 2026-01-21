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
				resource: ['priceOracle'],
			},
		},
		options: [
			{
				name: 'Get Asset Price',
				value: 'getAssetPrice',
				description: 'Get price of a single asset',
				action: 'Get asset price',
			},
			{
				name: 'Get Asset Prices',
				value: 'getAssetPrices',
				description: 'Get prices of multiple assets',
				action: 'Get asset prices',
			},
			{
				name: 'Get All Reserve Prices',
				value: 'getAllReservePrices',
				description: 'Get prices for all reserves',
				action: 'Get all reserve prices',
			},
			{
				name: 'Get Base Currency',
				value: 'getBaseCurrency',
				description: 'Get the base currency used for prices',
				action: 'Get base currency',
			},
		],
		default: 'getAssetPrice',
	},
	{
		displayName: 'Asset Address',
		name: 'assetAddress',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'The asset address',
		displayOptions: {
			show: {
				resource: ['priceOracle'],
				operation: ['getAssetPrice'],
			},
		},
		required: true,
	},
	{
		displayName: 'Asset Addresses',
		name: 'assetAddresses',
		type: 'string',
		default: '',
		placeholder: '0x...,0x...',
		description: 'Comma-separated list of asset addresses',
		displayOptions: {
			show: {
				resource: ['priceOracle'],
				operation: ['getAssetPrices'],
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
		case 'getAssetPrice': {
			const assetAddress = this.getNodeParameter('assetAddress', itemIndex) as string;
			const price = await client.getAssetPrice(assetAddress);
			
			// Price is returned in base currency units (typically USD with 8 decimals)
			const priceUSD = Number(price) / 1e8;
			
			return {
				asset: assetAddress,
				priceRaw: price.toString(),
				priceUSD,
				priceFormatted: `$${priceUSD.toFixed(2)}`,
			};
		}

		case 'getAssetPrices': {
			const assetAddressesStr = this.getNodeParameter('assetAddresses', itemIndex) as string;
			const assetAddresses = assetAddressesStr.split(',').map(a => a.trim());
			
			const prices = await client.getAssetPrices(assetAddresses);
			
			const results = assetAddresses.map((asset, index) => ({
				asset,
				priceRaw: prices[index].toString(),
				priceUSD: Number(prices[index]) / 1e8,
			}));
			
			return {
				prices: results,
			};
		}

		case 'getAllReservePrices': {
			const reserves = await client.getReservesList();
			const prices = await client.getAssetPrices(reserves);
			
			const results = reserves.map((reserve, index) => ({
				reserve,
				priceRaw: prices[index].toString(),
				priceUSD: Number(prices[index]) / 1e8,
			}));
			
			return {
				reserveCount: reserves.length,
				prices: results,
			};
		}

		case 'getBaseCurrency': {
			// Aave V3 uses USD as base currency with 8 decimals
			return {
				baseCurrency: 'USD',
				decimals: 8,
				unit: 1e8,
				message: 'All prices are denominated in USD with 8 decimal precision',
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
