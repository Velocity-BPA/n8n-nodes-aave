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
				resource: ['liquidation'],
			},
		},
		options: [
			{
				name: 'Liquidate Position',
				value: 'liquidate',
				description: 'Liquidate an unhealthy position',
				action: 'Liquidate position',
			},
			{
				name: 'Get Liquidation Bonus',
				value: 'getLiquidationBonus',
				description: 'Get liquidation bonus for an asset',
				action: 'Get liquidation bonus',
			},
			{
				name: 'Get Liquidation Threshold',
				value: 'getLiquidationThreshold',
				description: 'Get liquidation threshold for an asset',
				action: 'Get liquidation threshold',
			},
			{
				name: 'Check Position Health',
				value: 'checkPositionHealth',
				description: 'Check if a position is liquidatable',
				action: 'Check position health',
			},
			{
				name: 'Calculate Liquidation Amount',
				value: 'calculateLiquidationAmount',
				description: 'Calculate max liquidation amount',
				action: 'Calculate liquidation amount',
			},
			{
				name: 'Simulate Liquidation',
				value: 'simulateLiquidation',
				description: 'Simulate liquidation profitability',
				action: 'Simulate liquidation',
			},
			{
				name: 'Monitor Liquidation Risk',
				value: 'monitorRisk',
				description: 'Monitor position liquidation risk',
				action: 'Monitor liquidation risk',
			},
		],
		default: 'checkPositionHealth',
	},
	{
		displayName: 'Collateral Asset',
		name: 'collateralAsset',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'The collateral asset to receive',
		displayOptions: {
			show: {
				resource: ['liquidation'],
				operation: ['liquidate', 'getLiquidationBonus', 'getLiquidationThreshold', 'calculateLiquidationAmount', 'simulateLiquidation'],
			},
		},
		required: true,
	},
	{
		displayName: 'Debt Asset',
		name: 'debtAsset',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'The debt asset to repay',
		displayOptions: {
			show: {
				resource: ['liquidation'],
				operation: ['liquidate', 'calculateLiquidationAmount', 'simulateLiquidation'],
			},
		},
		required: true,
	},
	{
		displayName: 'User Address',
		name: 'userAddress',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'The address of the user to liquidate/monitor',
		displayOptions: {
			show: {
				resource: ['liquidation'],
				operation: ['liquidate', 'checkPositionHealth', 'calculateLiquidationAmount', 'simulateLiquidation', 'monitorRisk'],
			},
		},
		required: true,
	},
	{
		displayName: 'Debt to Cover',
		name: 'debtToCover',
		type: 'string',
		default: '',
		placeholder: '1000',
		description: 'Amount of debt to repay (in token units)',
		displayOptions: {
			show: {
				resource: ['liquidation'],
				operation: ['liquidate', 'simulateLiquidation'],
			},
		},
		required: true,
	},
	{
		displayName: 'Receive aToken',
		name: 'receiveAToken',
		type: 'boolean',
		default: false,
		description: 'Whether to receive collateral as aToken (true) or underlying (false)',
		displayOptions: {
			show: {
				resource: ['liquidation'],
				operation: ['liquidate'],
			},
		},
	},
	{
		displayName: 'Health Factor Threshold',
		name: 'healthFactorThreshold',
		type: 'number',
		default: 1.5,
		description: 'Health factor threshold for risk monitoring',
		displayOptions: {
			show: {
				resource: ['liquidation'],
				operation: ['monitorRisk'],
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
		case 'liquidate': {
			const collateralAsset = this.getNodeParameter('collateralAsset', itemIndex) as string;
			const debtAsset = this.getNodeParameter('debtAsset', itemIndex) as string;
			const userAddress = this.getNodeParameter('userAddress', itemIndex) as string;
			const debtToCover = this.getNodeParameter('debtToCover', itemIndex) as string;
			const receiveAToken = this.getNodeParameter('receiveAToken', itemIndex) as boolean;
			
			const tx = await client.liquidationCall(
				collateralAsset,
				debtAsset,
				userAddress,
				debtToCover,
				receiveAToken,
			);
			
			return {
				success: true,
				transactionHash: tx.hash,
				collateralAsset,
				debtAsset,
				userLiquidated: userAddress,
				debtCovered: debtToCover,
				receivedAToken: receiveAToken,
			};
		}

		case 'getLiquidationBonus': {
			const collateralAsset = this.getNodeParameter('collateralAsset', itemIndex) as string;
			const configData = await client.getReserveConfigurationData(collateralAsset);
			
			const bonusBps = Number(configData.liquidationBonus) - 10000;
			return {
				asset: collateralAsset,
				liquidationBonus: configData.liquidationBonus.toString(),
				liquidationBonusPercentage: bonusBps / 100,
				liquidationBonusFormatted: `${bonusBps / 100}%`,
			};
		}

		case 'getLiquidationThreshold': {
			const collateralAsset = this.getNodeParameter('collateralAsset', itemIndex) as string;
			const configData = await client.getReserveConfigurationData(collateralAsset);
			
			return {
				asset: collateralAsset,
				liquidationThreshold: configData.liquidationThreshold.toString(),
				liquidationThresholdPercentage: Number(configData.liquidationThreshold) / 100,
				liquidationThresholdFormatted: `${Number(configData.liquidationThreshold) / 100}%`,
			};
		}

		case 'checkPositionHealth': {
			const userAddress = this.getNodeParameter('userAddress', itemIndex) as string;
			const accountData = await client.getUserAccountData(userAddress);
			
			const healthFactor = Number(accountData.healthFactor) / 1e18;
			const isLiquidatable = healthFactor < 1;
			const totalCollateralUSD = Number(accountData.totalCollateralBase) / 1e8;
			const totalDebtUSD = Number(accountData.totalDebtBase) / 1e8;
			
			let riskLevel = 'safe';
			if (healthFactor < 1) riskLevel = 'liquidatable';
			else if (healthFactor < 1.1) riskLevel = 'danger';
			else if (healthFactor < 1.5) riskLevel = 'warning';
			
			return {
				userAddress,
				healthFactor,
				isLiquidatable,
				riskLevel,
				totalCollateralUSD,
				totalDebtUSD,
				netWorthUSD: totalCollateralUSD - totalDebtUSD,
				ltv: Number(accountData.ltv) / 100,
				liquidationThreshold: Number(accountData.currentLiquidationThreshold) / 100,
			};
		}

		case 'calculateLiquidationAmount': {
			const collateralAsset = this.getNodeParameter('collateralAsset', itemIndex) as string;
			const debtAsset = this.getNodeParameter('debtAsset', itemIndex) as string;
			const userAddress = this.getNodeParameter('userAddress', itemIndex) as string;
			
			const accountData = await client.getUserAccountData(userAddress);
			const healthFactor = Number(accountData.healthFactor) / 1e18;
			
			if (healthFactor >= 1) {
				return {
					userAddress,
					healthFactor,
					isLiquidatable: false,
					maxLiquidationAmount: '0',
					message: 'Position is healthy and cannot be liquidated',
				};
			}
			
			// Get debt balance
			const variableDebt = await client.getVariableDebtBalance(debtAsset, userAddress);
			const stableDebt = await client.getStableDebtBalance(debtAsset, userAddress);
			const totalDebt = BigInt(variableDebt) + BigInt(stableDebt);
			
			// Close factor is typically 50% - max debt that can be liquidated
			const closeFactor = 0.5;
			const maxLiquidatable = (Number(totalDebt) * closeFactor).toString();
			
			// Get collateral and liquidation bonus
			const collateralBalance = await client.getATokenBalance(collateralAsset, userAddress);
			const configData = await client.getReserveConfigurationData(collateralAsset);
			const bonusMultiplier = Number(configData.liquidationBonus) / 10000;
			
			return {
				userAddress,
				healthFactor,
				isLiquidatable: true,
				collateralAsset,
				debtAsset,
				totalDebt: totalDebt.toString(),
				maxDebtLiquidatable: maxLiquidatable,
				collateralBalance: collateralBalance.toString(),
				liquidationBonus: `${(bonusMultiplier - 1) * 100}%`,
			};
		}

		case 'simulateLiquidation': {
			const collateralAsset = this.getNodeParameter('collateralAsset', itemIndex) as string;
			const debtAsset = this.getNodeParameter('debtAsset', itemIndex) as string;
			const userAddress = this.getNodeParameter('userAddress', itemIndex) as string;
			const debtToCover = this.getNodeParameter('debtToCover', itemIndex) as string;
			
			const accountData = await client.getUserAccountData(userAddress);
			const healthFactor = Number(accountData.healthFactor) / 1e18;
			
			if (healthFactor >= 1) {
				return {
					userAddress,
					healthFactor,
					canLiquidate: false,
					message: 'Position is healthy',
				};
			}
			
			// Get prices
			const collateralPrice = await client.getAssetPrice(collateralAsset);
			const debtPrice = await client.getAssetPrice(debtAsset);
			
			// Get liquidation bonus
			const configData = await client.getReserveConfigurationData(collateralAsset);
			const bonusMultiplier = Number(configData.liquidationBonus) / 10000;
			
			// Calculate collateral received
			const debtValueUSD = (Number(debtToCover) / 1e18) * (Number(debtPrice) / 1e8);
			const collateralValueUSD = debtValueUSD * bonusMultiplier;
			const collateralReceived = collateralValueUSD / (Number(collateralPrice) / 1e8);
			
			// Estimate gas (approximately 500k gas for liquidation)
			const estimatedGas = 500000;
			const gasPrice = 30; // Gwei
			const gasCostWei = BigInt(estimatedGas) * BigInt(gasPrice * 1e9);
			const gasCostETH = Number(gasCostWei) / 1e18;
			const gasCostUSD = gasCostETH * 2000; // Approximate ETH price
			
			const grossProfit = collateralValueUSD - debtValueUSD;
			const netProfit = grossProfit - gasCostUSD;
			
			return {
				userAddress,
				healthFactor,
				canLiquidate: true,
				collateralAsset,
				debtAsset,
				debtToCover,
				debtValueUSD,
				collateralReceived: collateralReceived.toString(),
				collateralValueUSD,
				liquidationBonus: `${(bonusMultiplier - 1) * 100}%`,
				grossProfitUSD: grossProfit,
				estimatedGasCostUSD: gasCostUSD,
				netProfitUSD: netProfit,
				isProfitable: netProfit > 0,
			};
		}

		case 'monitorRisk': {
			const userAddress = this.getNodeParameter('userAddress', itemIndex) as string;
			const healthFactorThreshold = this.getNodeParameter('healthFactorThreshold', itemIndex) as number;
			
			const accountData = await client.getUserAccountData(userAddress);
			const healthFactor = Number(accountData.healthFactor) / 1e18;
			
			const isAtRisk = healthFactor < healthFactorThreshold;
			const isLiquidatable = healthFactor < 1;
			
			let status = 'safe';
			let recommendation = 'Position is healthy';
			
			if (isLiquidatable) {
				status = 'liquidatable';
				recommendation = 'URGENT: Position can be liquidated. Repay debt or add collateral immediately.';
			} else if (healthFactor < 1.1) {
				status = 'danger';
				recommendation = 'CRITICAL: Position is at high risk. Consider repaying debt or adding collateral.';
			} else if (healthFactor < 1.5) {
				status = 'warning';
				recommendation = 'Position health is declining. Monitor closely and consider rebalancing.';
			} else if (healthFactor < healthFactorThreshold) {
				status = 'caution';
				recommendation = 'Position is below your threshold. Consider taking action.';
			}
			
			// Calculate buffer
			const bufferToLiquidation = ((healthFactor - 1) / healthFactor) * 100;
			
			return {
				userAddress,
				healthFactor,
				threshold: healthFactorThreshold,
				isAtRisk,
				isLiquidatable,
				status,
				recommendation,
				bufferToLiquidation: bufferToLiquidation > 0 ? `${bufferToLiquidation.toFixed(2)}%` : '0%',
				totalCollateralUSD: Number(accountData.totalCollateralBase) / 1e8,
				totalDebtUSD: Number(accountData.totalDebtBase) / 1e8,
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
