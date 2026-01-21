/**
 * Common reserve token addresses across Aave-supported networks
 */

export interface ReserveToken {
  symbol: string;
  name: string;
  decimals: number;
  addresses: Record<string, string>;
}

export const COMMON_TOKENS: Record<string, ReserveToken> = {
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    addresses: {
      ethereum: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      polygon: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      arbitrum: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      optimism: '0x4200000000000000000000000000000000000006',
      base: '0x4200000000000000000000000000000000000006',
      avalanche: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
    },
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    addresses: {
      ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      optimism: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      avalanche: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    },
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    addresses: {
      ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      optimism: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      avalanche: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    },
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    addresses: {
      ethereum: '0x6B175474E89094C44Da98b954EescdeCB5BE3830',
      polygon: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      arbitrum: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      optimism: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      base: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      avalanche: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
    },
  },
  WBTC: {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    addresses: {
      ethereum: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      polygon: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      arbitrum: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
      optimism: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
      avalanche: '0x50b7545627a5162F82A992c33b87aDc75187B218',
    },
  },
  LINK: {
    symbol: 'LINK',
    name: 'Chainlink',
    decimals: 18,
    addresses: {
      ethereum: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      polygon: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
      arbitrum: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
      optimism: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6',
      avalanche: '0x5947BB275c521040051D82396192181b413227A3',
    },
  },
  AAVE: {
    symbol: 'AAVE',
    name: 'Aave',
    decimals: 18,
    addresses: {
      ethereum: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      polygon: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
      arbitrum: '0xba5DdD1f9d7F570dc94a51479a000E3BCE967196',
      optimism: '0x76FB31fb4af56892A25e32cFC43De717950c9278',
      avalanche: '0x63a72806098Bd3D9520cC43356dD78afe5D386D9',
    },
  },
  GHO: {
    symbol: 'GHO',
    name: 'GHO',
    decimals: 18,
    addresses: {
      ethereum: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f',
    },
  },
  MATIC: {
    symbol: 'MATIC',
    name: 'Polygon',
    decimals: 18,
    addresses: {
      ethereum: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      polygon: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    },
  },
  stETH: {
    symbol: 'stETH',
    name: 'Lido Staked Ether',
    decimals: 18,
    addresses: {
      ethereum: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    },
  },
  wstETH: {
    symbol: 'wstETH',
    name: 'Wrapped Staked Ether',
    decimals: 18,
    addresses: {
      ethereum: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
      polygon: '0x03b54A6e9a984069379fae1a4fC4dBAE93B3bCCD',
      arbitrum: '0x5979D7b546E38E414F7E9822514be443A4800529',
      optimism: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
      base: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
    },
  },
  rETH: {
    symbol: 'rETH',
    name: 'Rocket Pool ETH',
    decimals: 18,
    addresses: {
      ethereum: '0xae78736Cd615f374D3085123A210448E74Fc6393',
      arbitrum: '0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8',
      optimism: '0x9Bcef72be871e61ED4fBbc7630889beE758eb81D',
    },
  },
  cbETH: {
    symbol: 'cbETH',
    name: 'Coinbase Wrapped Staked ETH',
    decimals: 18,
    addresses: {
      ethereum: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
      base: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
    },
  },
};

// E-Mode categories
export const EMODE_CATEGORIES = {
  NONE: 0,
  STABLECOINS: 1,
  ETH_CORRELATED: 2,
} as const;

export interface EModeCategory {
  id: number;
  label: string;
  ltv: number;
  liquidationThreshold: number;
  liquidationBonus: number;
  assets: string[];
}

export const EMODE_CONFIGS: Record<string, EModeCategory[]> = {
  ethereum: [
    {
      id: 1,
      label: 'Stablecoins',
      ltv: 9700,
      liquidationThreshold: 9750,
      liquidationBonus: 10100,
      assets: ['USDC', 'USDT', 'DAI', 'FRAX', 'LUSD'],
    },
    {
      id: 2,
      label: 'ETH correlated',
      ltv: 9000,
      liquidationThreshold: 9300,
      liquidationBonus: 10100,
      assets: ['WETH', 'wstETH', 'rETH', 'cbETH'],
    },
  ],
  polygon: [
    {
      id: 1,
      label: 'Stablecoins',
      ltv: 9700,
      liquidationThreshold: 9750,
      liquidationBonus: 10100,
      assets: ['USDC', 'USDT', 'DAI', 'miMATIC'],
    },
    {
      id: 2,
      label: 'MATIC correlated',
      ltv: 9250,
      liquidationThreshold: 9500,
      liquidationBonus: 10100,
      assets: ['WMATIC', 'stMATIC', 'MaticX'],
    },
  ],
  arbitrum: [
    {
      id: 1,
      label: 'Stablecoins',
      ltv: 9700,
      liquidationThreshold: 9750,
      liquidationBonus: 10100,
      assets: ['USDC', 'USDT', 'DAI', 'FRAX', 'LUSD'],
    },
    {
      id: 2,
      label: 'ETH correlated',
      ltv: 9000,
      liquidationThreshold: 9300,
      liquidationBonus: 10100,
      assets: ['WETH', 'wstETH', 'rETH'],
    },
  ],
};

// Interest rate modes
export const INTEREST_RATE_MODES = {
  NONE: 0,
  STABLE: 1,
  VARIABLE: 2,
} as const;

// Referral codes
export const REFERRAL_CODE = 0;

// Flash loan premium rates (in basis points)
export const FLASH_LOAN_PREMIUM = {
  V2: 9, // 0.09%
  V3: 5, // 0.05%
} as const;

// Common configuration values (in basis points or ray)
export const CONFIG_VALUES = {
  MAX_LTV: 10000, // 100%
  MAX_LIQUIDATION_THRESHOLD: 10000, // 100%
  MAX_LIQUIDATION_BONUS: 20000, // 200%
  PERCENTAGE_FACTOR: 10000, // For percentage calculations
  RAY: '1000000000000000000000000000', // 10^27
  WAD: '1000000000000000000', // 10^18
  HALF_RAY: '500000000000000000000000000', // 10^27 / 2
  HALF_WAD: '500000000000000000', // 10^18 / 2
} as const;

// Health factor thresholds
export const HEALTH_FACTOR = {
  SAFE: '2000000000000000000', // 2.0
  WARNING: '1500000000000000000', // 1.5
  DANGER: '1100000000000000000', // 1.1
  LIQUIDATABLE: '1000000000000000000', // 1.0
} as const;

export const getTokenAddress = (symbol: string, network: string): string | undefined => {
  const token = COMMON_TOKENS[symbol];
  return token?.addresses[network];
};

export const getTokenByAddress = (address: string, network: string): ReserveToken | undefined => {
  const normalizedAddress = address.toLowerCase();
  return Object.values(COMMON_TOKENS).find(
    token => token.addresses[network]?.toLowerCase() === normalizedAddress
  );
};
