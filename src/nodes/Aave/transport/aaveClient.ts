/**
 * Aave Client - Main transport layer for Aave Protocol interactions
 * Handles all direct contract interactions across V2 and V3
 */

import { ethers } from 'ethers';
import {
  POOL_V2_ABI,
  POOL_V3_ABI,
  POOL_DATA_PROVIDER_V3_ABI,
  ATOKEN_ABI,
  VARIABLE_DEBT_TOKEN_ABI,
  STABLE_DEBT_TOKEN_ABI,
  ORACLE_ABI,
  ERC20_ABI,
  WETH_GATEWAY_ABI,
} from '../constants/abis';
import { getNetworkConfig, getAaveAddresses, NetworkConfigWithKey } from '../constants/networks';
import { INTEREST_RATE_MODES } from '../constants/reserves';
import { toWei, fromWei } from '../utils/unitConverter';

export interface AaveClientConfig {
  network: string;
  version: 'v2' | 'v3';
  aaveVersion?: 'v2' | 'v3';
  rpcUrl: string;
  privateKey?: string;
  chainId: number;
}

export interface UserAccountData {
  totalCollateralBase: string;
  totalDebtBase: string;
  availableBorrowsBase: string;
  currentLiquidationThreshold: string;
  ltv: string;
  healthFactor: string;
}

export interface ReserveData {
  configuration: string;
  liquidityIndex: string;
  currentLiquidityRate: string;
  variableBorrowIndex: string;
  currentVariableBorrowRate: string;
  currentStableBorrowRate: string;
  lastUpdateTimestamp: number;
  id: number;
  aTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
  interestRateStrategyAddress: string;
  accruedToTreasury: string;
  unbacked: string;
  isolationModeTotalDebt: string;
}

export interface UserReserveData {
  currentATokenBalance: string;
  currentStableDebt: string;
  currentVariableDebt: string;
  principalStableDebt: string;
  scaledVariableDebt: string;
  stableBorrowRate: string;
  liquidityRate: string;
  stableRateLastUpdated: number;
  usageAsCollateralEnabled: boolean;
}

export class AaveClient {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet?: ethers.Wallet;
  private networkConfig: NetworkConfigWithKey;
  private addresses: ReturnType<typeof getAaveAddresses>;
  private version: 'v2' | 'v3';

  // Contract instances
  private poolContract: ethers.Contract;
  private dataProviderContract?: ethers.Contract;
  private oracleContract?: ethers.Contract;
  private wethGatewayContract?: ethers.Contract;

  constructor(config: AaveClientConfig) {
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl, config.chainId);
    this.networkConfig = getNetworkConfig(config.network);
    this.addresses = getAaveAddresses(config.network, config.version);
    this.version = config.version;

    if (config.privateKey) {
      this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    }

    // Initialize pool contract
    const poolAbi = config.version === 'v2' ? POOL_V2_ABI : POOL_V3_ABI;
    this.poolContract = new ethers.Contract(
      this.addresses.pool,
      poolAbi,
      this.wallet || this.provider
    );

    // Initialize data provider (V3 only)
    if (config.version === 'v3' && 'poolDataProvider' in this.addresses) {
      this.dataProviderContract = new ethers.Contract(
        this.addresses.poolDataProvider,
        POOL_DATA_PROVIDER_V3_ABI,
        this.provider
      );
    }

    // Initialize oracle
    this.oracleContract = new ethers.Contract(
      this.addresses.oracle,
      ORACLE_ABI,
      this.provider
    );

    // Initialize WETH Gateway
    this.wethGatewayContract = new ethers.Contract(
      this.addresses.wethGateway,
      WETH_GATEWAY_ABI,
      this.wallet || this.provider
    );
  }

  /**
   * Get user account data
   */
  async getUserAccountData(userAddress: string): Promise<UserAccountData> {
    const data = await this.poolContract.getUserAccountData(userAddress);
    
    return {
      totalCollateralBase: data.totalCollateralBase?.toString() || data.totalCollateralETH?.toString(),
      totalDebtBase: data.totalDebtBase?.toString() || data.totalDebtETH?.toString(),
      availableBorrowsBase: data.availableBorrowsBase?.toString() || data.availableBorrowsETH?.toString(),
      currentLiquidationThreshold: data.currentLiquidationThreshold.toString(),
      ltv: data.ltv.toString(),
      healthFactor: data.healthFactor.toString(),
    };
  }

  /**
   * Get reserve data for an asset
   */
  async getReserveData(asset: string): Promise<ReserveData> {
    const data = await this.poolContract.getReserveData(asset);
    
    if (this.version === 'v3') {
      return {
        configuration: data.configuration.toString(),
        liquidityIndex: data.liquidityIndex.toString(),
        currentLiquidityRate: data.currentLiquidityRate.toString(),
        variableBorrowIndex: data.variableBorrowIndex.toString(),
        currentVariableBorrowRate: data.currentVariableBorrowRate.toString(),
        currentStableBorrowRate: data.currentStableBorrowRate.toString(),
        lastUpdateTimestamp: Number(data.lastUpdateTimestamp),
        id: Number(data.id),
        aTokenAddress: data.aTokenAddress,
        stableDebtTokenAddress: data.stableDebtTokenAddress,
        variableDebtTokenAddress: data.variableDebtTokenAddress,
        interestRateStrategyAddress: data.interestRateStrategyAddress,
        accruedToTreasury: data.accruedToTreasury.toString(),
        unbacked: data.unbacked.toString(),
        isolationModeTotalDebt: data.isolationModeTotalDebt.toString(),
      };
    }

    // V2 format
    return {
      configuration: '0',
      liquidityIndex: data.liquidityIndex.toString(),
      currentLiquidityRate: data.liquidityRate.toString(),
      variableBorrowIndex: data.variableBorrowIndex.toString(),
      currentVariableBorrowRate: data.variableBorrowRate.toString(),
      currentStableBorrowRate: data.stableBorrowRate.toString(),
      lastUpdateTimestamp: Number(data.lastUpdateTimestamp),
      id: 0,
      aTokenAddress: '',
      stableDebtTokenAddress: '',
      variableDebtTokenAddress: '',
      interestRateStrategyAddress: '',
      accruedToTreasury: '0',
      unbacked: '0',
      isolationModeTotalDebt: '0',
    };
  }

  /**
   * Get user reserve data
   */
  async getUserReserveData(asset: string, user: string): Promise<UserReserveData> {
    if (!this.dataProviderContract) {
      throw new Error('Data provider not available for V2');
    }

    const data = await this.dataProviderContract.getUserReserveData(asset, user);
    
    return {
      currentATokenBalance: data.currentATokenBalance.toString(),
      currentStableDebt: data.currentStableDebt.toString(),
      currentVariableDebt: data.currentVariableDebt.toString(),
      principalStableDebt: data.principalStableDebt.toString(),
      scaledVariableDebt: data.scaledVariableDebt.toString(),
      stableBorrowRate: data.stableBorrowRate.toString(),
      liquidityRate: data.liquidityRate.toString(),
      stableRateLastUpdated: Number(data.stableRateLastUpdated),
      usageAsCollateralEnabled: data.usageAsCollateralEnabled,
    };
  }

  /**
   * Get all reserves list
   */
  async getReservesList(): Promise<string[]> {
    return await this.poolContract.getReservesList();
  }

  /**
   * Get asset price from oracle
   */
  async getAssetPrice(asset: string): Promise<string> {
    if (!this.oracleContract) {
      throw new Error('Oracle not initialized');
    }
    const price = await this.oracleContract.getAssetPrice(asset);
    return price.toString();
  }

  /**
   * Get multiple asset prices
   */
  async getAssetPrices(assets: string[]): Promise<string[]> {
    if (!this.oracleContract) {
      throw new Error('Oracle not initialized');
    }
    const prices = await this.oracleContract.getAssetsPrices(assets);
    return prices.map((p: bigint) => p.toString());
  }

  /**
   * Supply asset to the pool
   */
  async supply(
    asset: string,
    amount: string,
    onBehalfOf?: string,
    referralCode: number = 0
  ): Promise<ethers.providers.TransactionResponse> {
    if (!this.wallet) {
      throw new Error('Wallet not configured for write operations');
    }

    const recipient = onBehalfOf || await this.wallet.getAddress();
    
    // Approve token first
    await this.approveToken(asset, this.addresses.pool, amount);

    if (this.version === 'v3') {
      return await this.poolContract.supply(asset, amount, recipient, referralCode);
    } else {
      return await this.poolContract.deposit(asset, amount, recipient, referralCode);
    }
  }

  /**
   * Withdraw asset from the pool
   */
  async withdraw(
    asset: string,
    amount: string,
    to?: string
  ): Promise<ethers.providers.TransactionResponse> {
    if (!this.wallet) {
      throw new Error('Wallet not configured for write operations');
    }

    const recipient = to || await this.wallet.getAddress();
    return await this.poolContract.withdraw(asset, amount, recipient);
  }

  /**
   * Borrow asset from the pool
   */
  async borrow(
    asset: string,
    amount: string,
    interestRateMode: 'variable' | 'stable' = 'variable',
    onBehalfOf?: string,
    referralCode: number = 0
  ): Promise<ethers.providers.TransactionResponse> {
    if (!this.wallet) {
      throw new Error('Wallet not configured for write operations');
    }

    const mode = interestRateMode === 'stable' 
      ? INTEREST_RATE_MODES.STABLE 
      : INTEREST_RATE_MODES.VARIABLE;
    const recipient = onBehalfOf || await this.wallet.getAddress();

    return await this.poolContract.borrow(asset, amount, mode, referralCode, recipient);
  }

  /**
   * Repay borrowed asset
   */
  async repay(
    asset: string,
    amount: string,
    interestRateMode: 'variable' | 'stable' = 'variable',
    onBehalfOf?: string
  ): Promise<ethers.providers.TransactionResponse> {
    if (!this.wallet) {
      throw new Error('Wallet not configured for write operations');
    }

    const mode = interestRateMode === 'stable' 
      ? INTEREST_RATE_MODES.STABLE 
      : INTEREST_RATE_MODES.VARIABLE;
    const recipient = onBehalfOf || await this.wallet.getAddress();

    // Approve token first
    await this.approveToken(asset, this.addresses.pool, amount);

    return await this.poolContract.repay(asset, amount, mode, recipient);
  }

  /**
   * Set asset as collateral
   */
  async setUserUseReserveAsCollateral(
    asset: string,
    useAsCollateral: boolean
  ): Promise<ethers.providers.TransactionResponse> {
    if (!this.wallet) {
      throw new Error('Wallet not configured for write operations');
    }

    return await this.poolContract.setUserUseReserveAsCollateral(asset, useAsCollateral);
  }

  /**
   * Execute flash loan
   */
  async flashLoan(
    receiverAddress: string,
    assets: string[],
    amounts: string[],
    interestRateModes: number[],
    onBehalfOf: string,
    params: string,
    referralCode: number = 0
  ): Promise<ethers.providers.TransactionResponse> {
    if (!this.wallet) {
      throw new Error('Wallet not configured for write operations');
    }

    return await this.poolContract.flashLoan(
      receiverAddress,
      assets,
      amounts,
      interestRateModes,
      onBehalfOf,
      params,
      referralCode
    );
  }

  /**
   * Execute simple flash loan (V3 only)
   */
  async flashLoanSimple(
    receiverAddress: string,
    asset: string,
    amount: string,
    params: string,
    referralCode: number = 0
  ): Promise<ethers.providers.TransactionResponse> {
    if (this.version !== 'v3') {
      throw new Error('flashLoanSimple is only available in Aave V3');
    }
    if (!this.wallet) {
      throw new Error('Wallet not configured for write operations');
    }

    return await this.poolContract.flashLoanSimple(
      receiverAddress,
      asset,
      amount,
      params,
      referralCode
    );
  }

  /**
   * Liquidate a position
   */
  async liquidationCall(
    collateralAsset: string,
    debtAsset: string,
    user: string,
    debtToCover: string,
    receiveAToken: boolean = false
  ): Promise<ethers.providers.TransactionResponse> {
    if (!this.wallet) {
      throw new Error('Wallet not configured for write operations');
    }

    // Approve debt token first
    await this.approveToken(debtAsset, this.addresses.pool, debtToCover);

    return await this.poolContract.liquidationCall(
      collateralAsset,
      debtAsset,
      user,
      debtToCover,
      receiveAToken
    );
  }

  /**
   * Set user E-Mode category (V3 only)
   */
  async setUserEMode(categoryId: number): Promise<ethers.providers.TransactionResponse> {
    if (this.version !== 'v3') {
      throw new Error('E-Mode is only available in Aave V3');
    }
    if (!this.wallet) {
      throw new Error('Wallet not configured for write operations');
    }

    return await this.poolContract.setUserEMode(categoryId);
  }

  /**
   * Get user E-Mode category (V3 only)
   */
  async getUserEMode(user: string): Promise<number> {
    if (this.version !== 'v3') {
      throw new Error('E-Mode is only available in Aave V3');
    }

    const eMode = await this.poolContract.getUserEMode(user);
    return Number(eMode);
  }

  /**
   * Get flash loan premium
   */
  async getFlashLoanPremium(): Promise<{ total: string; toProtocol: string }> {
    if (this.version !== 'v3') {
      return { total: '9', toProtocol: '0' }; // V2 default is 0.09%
    }

    const total = await this.poolContract.FLASHLOAN_PREMIUM_TOTAL();
    const toProtocol = await this.poolContract.FLASHLOAN_PREMIUM_TO_PROTOCOL();

    return {
      total: total.toString(),
      toProtocol: toProtocol.toString(),
    };
  }

  /**
   * Supply ETH using WETH Gateway
   */
  async depositETH(
    amount: string,
    onBehalfOf?: string,
    referralCode: number = 0
  ): Promise<ethers.providers.TransactionResponse> {
    if (!this.wallet || !this.wethGatewayContract) {
      throw new Error('Wallet or WETH Gateway not configured');
    }

    const recipient = onBehalfOf || await this.wallet.getAddress();

    return await this.wethGatewayContract.depositETH(
      this.addresses.pool,
      recipient,
      referralCode,
      { value: amount }
    );
  }

  /**
   * Withdraw ETH using WETH Gateway
   */
  async withdrawETH(
    amount: string,
    to?: string
  ): Promise<ethers.providers.TransactionResponse> {
    if (!this.wallet || !this.wethGatewayContract) {
      throw new Error('Wallet or WETH Gateway not configured');
    }

    const recipient = to || await this.wallet.getAddress();

    return await this.wethGatewayContract.withdrawETH(
      this.addresses.pool,
      amount,
      recipient
    );
  }

  /**
   * Approve token spending
   */
  async approveToken(
    tokenAddress: string,
    spender: string,
    amount: string
  ): Promise<ethers.providers.TransactionResponse | null> {
    if (!this.wallet) {
      throw new Error('Wallet not configured');
    }

    const token = new ethers.Contract(tokenAddress, ERC20_ABI, this.wallet);
    const currentAllowance = await token.allowance(await this.wallet.getAddress(), spender);

    if (BigInt(currentAllowance) >= BigInt(amount)) {
      return null; // Already approved
    }

    return await token.approve(spender, ethers.constants.MaxUint256);
  }

  /**
   * Get aToken balance
   */
  async getATokenBalance(aTokenAddress: string, user: string): Promise<string> {
    const aToken = new ethers.Contract(aTokenAddress, ATOKEN_ABI, this.provider);
    const balance = await aToken.balanceOf(user);
    return balance.toString();
  }

  /**
   * Get variable debt token balance
   */
  async getVariableDebtBalance(debtTokenAddress: string, user: string): Promise<string> {
    const debtToken = new ethers.Contract(debtTokenAddress, VARIABLE_DEBT_TOKEN_ABI, this.provider);
    const balance = await debtToken.balanceOf(user);
    return balance.toString();
  }

  /**
   * Get stable debt token balance
   */
  async getStableDebtBalance(debtTokenAddress: string, user: string): Promise<string> {
    const debtToken = new ethers.Contract(debtTokenAddress, STABLE_DEBT_TOKEN_ABI, this.provider);
    const balance = await debtToken.balanceOf(user);
    return balance.toString();
  }

  /**
   * Get reserve configuration data
   */
  async getReserveConfigurationData(asset: string): Promise<{
    decimals: number;
    ltv: number;
    liquidationThreshold: number;
    liquidationBonus: number;
    reserveFactor: number;
    usageAsCollateralEnabled: boolean;
    borrowingEnabled: boolean;
    stableBorrowRateEnabled: boolean;
    isActive: boolean;
    isFrozen: boolean;
  }> {
    if (!this.dataProviderContract) {
      throw new Error('Data provider not available');
    }

    const data = await this.dataProviderContract.getReserveConfigurationData(asset);
    
    return {
      decimals: Number(data.decimals),
      ltv: Number(data.ltv),
      liquidationThreshold: Number(data.liquidationThreshold),
      liquidationBonus: Number(data.liquidationBonus),
      reserveFactor: Number(data.reserveFactor),
      usageAsCollateralEnabled: data.usageAsCollateralEnabled,
      borrowingEnabled: data.borrowingEnabled,
      stableBorrowRateEnabled: data.stableBorrowRateEnabled,
      isActive: data.isActive,
      isFrozen: data.isFrozen,
    };
  }

  /**
   * Get reserve caps
   */
  async getReserveCaps(asset: string): Promise<{ borrowCap: string; supplyCap: string }> {
    if (!this.dataProviderContract) {
      throw new Error('Data provider not available');
    }

    const caps = await this.dataProviderContract.getReserveCaps(asset);
    
    return {
      borrowCap: caps.borrowCap.toString(),
      supplyCap: caps.supplyCap.toString(),
    };
  }

  /**
   * Get reserve token addresses
   */
  async getReserveTokensAddresses(asset: string): Promise<{
    aTokenAddress: string;
    stableDebtTokenAddress: string;
    variableDebtTokenAddress: string;
  }> {
    if (!this.dataProviderContract) {
      throw new Error('Data provider not available');
    }

    const addresses = await this.dataProviderContract.getReserveTokensAddresses(asset);
    
    return {
      aTokenAddress: addresses.aTokenAddress,
      stableDebtTokenAddress: addresses.stableDebtTokenAddress,
      variableDebtTokenAddress: addresses.variableDebtTokenAddress,
    };
  }

  /**
   * Check if flash loan is enabled for asset
   */
  async isFlashLoanEnabled(asset: string): Promise<boolean> {
    if (!this.dataProviderContract) {
      return true; // V2 doesn't have this restriction
    }

    return await this.dataProviderContract.getFlashLoanEnabled(asset);
  }

  /**
   * Get provider instance
   */
  getProvider(): ethers.providers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * Get wallet address
   */
  async getWalletAddress(): Promise<string | null> {
    if (!this.wallet) return null;
    return await this.wallet.getAddress();
  }

  /**
   * Get reserve decimals
   */
  async getReserveDecimals(asset: string): Promise<number> {
    if (this.dataProviderContract) {
      const config = await this.dataProviderContract.getReserveConfigurationData(asset);
      return Number(config.decimals);
    }
    // Default to 18 for V2 without data provider
    return 18;
  }

  /**
   * Get pool address
   */
  getPoolAddress(): string {
    return this.addresses.pool;
  }

  /**
   * Get network configuration
   */
  getNetworkConfig(): NetworkConfigWithKey {
    return this.networkConfig;
  }
}

export function createAaveClient(config: AaveClientConfig): AaveClient {
  return new AaveClient(config);
}
