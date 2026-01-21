/**
 * Aave Protocol Contract ABIs
 * Essential ABIs for interacting with Aave V2 and V3 contracts
 */

export const POOL_V3_ABI = [
  // Supply operations
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function supplyWithPermit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode, uint256 deadline, uint8 permitV, bytes32 permitR, bytes32 permitS)',
  'function withdraw(address asset, uint256 amount, address to) returns (uint256)',
  
  // Borrow operations
  'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)',
  'function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf) returns (uint256)',
  'function repayWithPermit(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf, uint256 deadline, uint8 permitV, bytes32 permitR, bytes32 permitS) returns (uint256)',
  'function repayWithATokens(address asset, uint256 amount, uint256 interestRateMode) returns (uint256)',
  'function swapBorrowRateMode(address asset, uint256 interestRateMode)',
  'function rebalanceStableBorrowRate(address asset, address user)',
  
  // Collateral management
  'function setUserUseReserveAsCollateral(address asset, bool useAsCollateral)',
  
  // Flash loans
  'function flashLoan(address receiverAddress, address[] calldata assets, uint256[] calldata amounts, uint256[] calldata interestRateModes, address onBehalfOf, bytes calldata params, uint16 referralCode)',
  'function flashLoanSimple(address receiverAddress, address asset, uint256 amount, bytes calldata params, uint16 referralCode)',
  
  // Liquidation
  'function liquidationCall(address collateralAsset, address debtAsset, address user, uint256 debtToCover, bool receiveAToken)',
  
  // E-Mode
  'function setUserEMode(uint8 categoryId)',
  'function getUserEMode(address user) view returns (uint256)',
  
  // View functions
  'function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)',
  'function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))',
  'function getUserConfiguration(address user) view returns (tuple(uint256 data))',
  'function getConfiguration(address asset) view returns (tuple(uint256 data))',
  'function getReservesList() view returns (address[])',
  'function getReserveNormalizedIncome(address asset) view returns (uint256)',
  'function getReserveNormalizedVariableDebt(address asset) view returns (uint256)',
  'function FLASHLOAN_PREMIUM_TOTAL() view returns (uint128)',
  'function FLASHLOAN_PREMIUM_TO_PROTOCOL() view returns (uint128)',
  'function MAX_NUMBER_RESERVES() view returns (uint16)',
  
  // Portal (Cross-chain)
  'function mintUnbacked(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function backUnbacked(address asset, uint256 amount, uint256 fee)',
];

export const POOL_V2_ABI = [
  // Supply operations
  'function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function withdraw(address asset, uint256 amount, address to) returns (uint256)',
  
  // Borrow operations
  'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)',
  'function repay(address asset, uint256 amount, uint256 rateMode, address onBehalfOf) returns (uint256)',
  'function swapBorrowRateMode(address asset, uint256 rateMode)',
  'function rebalanceStableBorrowRate(address asset, address user)',
  
  // Collateral management
  'function setUserUseReserveAsCollateral(address asset, bool useAsCollateral)',
  
  // Flash loans
  'function flashLoan(address receiverAddress, address[] calldata assets, uint256[] calldata amounts, uint256[] calldata modes, address onBehalfOf, bytes calldata params, uint16 referralCode)',
  
  // Liquidation
  'function liquidationCall(address collateralAsset, address debtAsset, address user, uint256 debtToCover, bool receiveAToken)',
  
  // View functions
  'function getUserAccountData(address user) view returns (uint256 totalCollateralETH, uint256 totalDebtETH, uint256 availableBorrowsETH, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)',
  'function getReserveData(address asset) view returns (uint256 availableLiquidity, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)',
  'function getUserConfiguration(address user) view returns (uint256)',
  'function getReservesList() view returns (address[])',
  'function getReserveNormalizedIncome(address asset) view returns (uint256)',
  'function getReserveNormalizedVariableDebt(address asset) view returns (uint256)',
];

export const POOL_DATA_PROVIDER_V3_ABI = [
  'function getAllReservesTokens() view returns (tuple(string symbol, address tokenAddress)[])',
  'function getAllATokens() view returns (tuple(string symbol, address tokenAddress)[])',
  'function getReserveConfigurationData(address asset) view returns (uint256 decimals, uint256 ltv, uint256 liquidationThreshold, uint256 liquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool stableBorrowRateEnabled, bool isActive, bool isFrozen)',
  'function getReserveEModeCategory(address asset) view returns (uint256)',
  'function getReserveCaps(address asset) view returns (uint256 borrowCap, uint256 supplyCap)',
  'function getPaused(address asset) view returns (bool)',
  'function getSiloedBorrowing(address asset) view returns (bool)',
  'function getLiquidationProtocolFee(address asset) view returns (uint256)',
  'function getUnbackedMintCap(address asset) view returns (uint256)',
  'function getDebtCeiling(address asset) view returns (uint256)',
  'function getDebtCeilingDecimals() pure returns (uint256)',
  'function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)',
  'function getATokenTotalSupply(address asset) view returns (uint256)',
  'function getTotalDebt(address asset) view returns (uint256)',
  'function getUserReserveData(address asset, address user) view returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)',
  'function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)',
  'function getInterestRateStrategyAddress(address asset) view returns (address)',
  'function getFlashLoanEnabled(address asset) view returns (bool)',
];

export const ATOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function scaledBalanceOf(address user) view returns (uint256)',
  'function scaledTotalSupply() view returns (uint256)',
  'function getScaledUserBalanceAndSupply(address user) view returns (uint256, uint256)',
  'function UNDERLYING_ASSET_ADDRESS() view returns (address)',
  'function POOL() view returns (address)',
  'function RESERVE_TREASURY_ADDRESS() view returns (address)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function nonces(address owner) view returns (uint256)',
  'function DOMAIN_SEPARATOR() view returns (bytes32)',
  'function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
];

export const VARIABLE_DEBT_TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function scaledBalanceOf(address user) view returns (uint256)',
  'function scaledTotalSupply() view returns (uint256)',
  'function getScaledUserBalanceAndSupply(address user) view returns (uint256, uint256)',
  'function UNDERLYING_ASSET_ADDRESS() view returns (address)',
  'function POOL() view returns (address)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function approveDelegation(address delegatee, uint256 amount)',
  'function borrowAllowance(address fromUser, address toUser) view returns (uint256)',
  'function delegationWithSig(address delegator, address delegatee, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
];

export const STABLE_DEBT_TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function principalBalanceOf(address user) view returns (uint256)',
  'function getTotalSupplyAndAvgRate() view returns (uint256, uint256)',
  'function getTotalSupplyLastUpdated() view returns (uint40)',
  'function getUserLastUpdated(address user) view returns (uint40)',
  'function getUserStableRate(address user) view returns (uint256)',
  'function getAverageStableRate() view returns (uint256)',
  'function UNDERLYING_ASSET_ADDRESS() view returns (address)',
  'function POOL() view returns (address)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function approveDelegation(address delegatee, uint256 amount)',
  'function borrowAllowance(address fromUser, address toUser) view returns (uint256)',
];

export const ORACLE_ABI = [
  'function getAssetPrice(address asset) view returns (uint256)',
  'function getAssetsPrices(address[] calldata assets) view returns (uint256[])',
  'function getSourceOfAsset(address asset) view returns (address)',
  'function getFallbackOracle() view returns (address)',
  'function BASE_CURRENCY() view returns (address)',
  'function BASE_CURRENCY_UNIT() view returns (uint256)',
];

export const REWARDS_CONTROLLER_ABI = [
  'function claimRewards(address[] calldata assets, uint256 amount, address to, address reward) returns (uint256)',
  'function claimRewardsOnBehalf(address[] calldata assets, uint256 amount, address user, address to, address reward) returns (uint256)',
  'function claimRewardsToSelf(address[] calldata assets, uint256 amount, address reward) returns (uint256)',
  'function claimAllRewards(address[] calldata assets, address to) returns (address[] memory rewardsList, uint256[] memory claimedAmounts)',
  'function claimAllRewardsOnBehalf(address[] calldata assets, address user, address to) returns (address[] memory rewardsList, uint256[] memory claimedAmounts)',
  'function claimAllRewardsToSelf(address[] calldata assets) returns (address[] memory rewardsList, uint256[] memory claimedAmounts)',
  'function getRewardsData(address asset, address reward) view returns (uint256 index, uint256 emissionPerSecond, uint256 lastUpdateTimestamp, uint256 distributionEnd)',
  'function getUserRewards(address[] calldata assets, address user, address reward) view returns (uint256)',
  'function getAllUserRewards(address[] calldata assets, address user) view returns (address[] memory rewardsList, uint256[] memory unclaimedAmounts)',
  'function getRewardsByAsset(address asset) view returns (address[])',
  'function getRewardsList() view returns (address[])',
  'function getUserAssetIndex(address user, address asset, address reward) view returns (uint256)',
];

export const STK_AAVE_ABI = [
  'function stake(address onBehalfOf, uint256 amount)',
  'function redeem(address to, uint256 amount)',
  'function cooldown()',
  'function claimRewards(address to, uint256 amount) returns (uint256)',
  'function claimRewardsOnBehalf(address from, address to, uint256 amount) returns (uint256)',
  'function getTotalRewardsBalance(address staker) view returns (uint256)',
  'function stakersCooldowns(address staker) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function STAKED_TOKEN() view returns (address)',
  'function REWARD_TOKEN() view returns (address)',
  'function COOLDOWN_SECONDS() view returns (uint256)',
  'function UNSTAKE_WINDOW() view returns (uint256)',
  'function DISTRIBUTION_END() view returns (uint256)',
  'function assets(address asset) view returns (uint128 emissionPerSecond, uint128 lastUpdateTimestamp, uint256 index)',
];

export const GHO_TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function getFacilitatorsList() view returns (address[])',
  'function getFacilitator(address facilitator) view returns (uint256 bucketCapacity, uint256 bucketLevel)',
  'function getFacilitatorBucket(address facilitator) view returns (uint256 bucketCapacity, uint256 bucketLevel)',
];

export const GHO_DEBT_TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function scaledBalanceOf(address user) view returns (uint256)',
  'function getDiscountPercent(address user) view returns (uint256)',
  'function getDiscountToken() view returns (address)',
  'function getDiscountRateStrategy() view returns (address)',
  'function updateDiscountDistribution(address sender, address recipient, uint256 senderDiscountTokenBalance, uint256 recipientDiscountTokenBalance, uint256 amount)',
];

export const GOVERNANCE_V3_ABI = [
  'function createProposal(address[] calldata targets, uint256[] calldata values, string[] calldata signatures, bytes[] calldata calldatas, bool[] calldata withDelegatecalls, bytes32 ipfsHash) returns (uint256)',
  'function submitVote(uint256 proposalId, bool support)',
  'function submitVoteWithReason(uint256 proposalId, bool support, string calldata reason)',
  'function executeProposal(uint256 proposalId)',
  'function cancelProposal(uint256 proposalId)',
  'function getProposalById(uint256 proposalId) view returns (tuple(uint256 id, address creator, address executor, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, bool[] withDelegatecalls, uint256 startBlock, uint256 endBlock, uint256 executionTime, uint256 forVotes, uint256 againstVotes, bool executed, bool canceled, address strategy, bytes32 ipfsHash))',
  'function getProposalState(uint256 proposalId) view returns (uint8)',
  'function getVotingPowerAt(address user, uint256 blockNumber) view returns (uint256)',
  'function getProposalsCount() view returns (uint256)',
];

export const WETH_GATEWAY_ABI = [
  'function depositETH(address pool, address onBehalfOf, uint16 referralCode) payable',
  'function withdrawETH(address pool, uint256 amount, address to)',
  'function repayETH(address pool, uint256 amount, uint256 rateMode, address onBehalfOf) payable',
  'function borrowETH(address pool, uint256 amount, uint256 interestRateMode, uint16 referralCode)',
];

export const INTEREST_RATE_STRATEGY_ABI = [
  'function getBaseVariableBorrowRate() view returns (uint256)',
  'function getBaseStableBorrowRate() view returns (uint256)',
  'function getStableRateSlope1() view returns (uint256)',
  'function getStableRateSlope2() view returns (uint256)',
  'function getVariableRateSlope1() view returns (uint256)',
  'function getVariableRateSlope2() view returns (uint256)',
  'function getStableRateExcessOffset() view returns (uint256)',
  'function getOptimalUsageRatio() view returns (uint256)',
  'function getMaxVariableBorrowRate() view returns (uint256)',
  'function calculateInterestRates(tuple(uint256 unbacked, uint256 liquidityAdded, uint256 liquidityTaken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 averageStableBorrowRate, uint256 reserveFactor, address reserve, address aToken) params) view returns (uint256 liquidityRate, uint256 stableBorrowRate, uint256 variableBorrowRate)',
];

export const FLASH_LOAN_RECEIVER_ABI = [
  'function executeOperation(address[] calldata assets, uint256[] calldata amounts, uint256[] calldata premiums, address initiator, bytes calldata params) returns (bool)',
];

export const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
];
