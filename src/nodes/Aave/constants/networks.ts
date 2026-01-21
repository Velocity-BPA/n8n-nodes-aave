/**
 * Network configuration constants for Aave Protocol
 * Supports both V2 and V3 across multiple chains
 */

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  subgraphUrl: {
    v2?: string;
    v3?: string;
  };
  aaveV2?: {
    pool: string;
    poolDataProvider: string;
    poolAddressesProvider: string;
    wethGateway: string;
    oracle: string;
  };
  aaveV3?: {
    pool: string;
    poolDataProvider: string;
    poolAddressesProvider: string;
    wethGateway: string;
    oracle: string;
    aclManager: string;
    poolConfigurator: string;
  };
  gho?: {
    token: string;
    debtToken: string;
    flashMinter: string;
  };
  safetyModule?: {
    stkAave: string;
    stkAbpt: string;
  };
  governance?: {
    governor: string;
    executorShort: string;
    executorLong: string;
    strategy: string;
  };
}

export const NETWORKS: Record<string, NetworkConfig> = {
  ethereum: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    subgraphUrl: {
      v2: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2',
      v3: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3',
    },
    aaveV2: {
      pool: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
      poolDataProvider: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
      poolAddressesProvider: '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
      wethGateway: '0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04',
      oracle: '0xA50ba011c48153De246E5192C8f9258A2ba79Ca9',
    },
    aaveV3: {
      pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      poolDataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
      poolAddressesProvider: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e',
      wethGateway: '0xD322A49006FC828F9B5B37Ab215F99B4E5caB19C',
      oracle: '0x54586bE62E3c3580375aE3723C145253060Ca0C2',
      aclManager: '0xc2aaCf6553D20d1e9d78E365AAba8032af9c85b0',
      poolConfigurator: '0x64b761D848206f447Fe2dd461b0c635Ec39EbB27',
    },
    gho: {
      token: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f',
      debtToken: '0x80aa933EfF12213022Fd3d17c2c59C066cBb91c7',
      flashMinter: '0xb639D208Bcf0589D54FaC24E655C79EC529762B8',
    },
    safetyModule: {
      stkAave: '0x4da27a545c0c5B758a6BA100e3a049001de870f5',
      stkAbpt: '0xa1116930326D21fB917d5A27F1E9943A9595fb47',
    },
    governance: {
      governor: '0xEC568fffba86c094cf06b22134B23074DFE2252c',
      executorShort: '0xEE56e2B3D491590B5b31738cC34d5232F378a8D5',
      executorLong: '0x61910EcD7e8e942136CE7Fe7943f956cea1CC2f7',
      strategy: '0xb7e383ef9B1E9189Fc0F71fb30af8aa14377429e',
    },
  },

  polygon: {
    name: 'Polygon',
    chainId: 137,
    rpcUrl: 'https://polygon.llamarpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    subgraphUrl: {
      v2: 'https://api.thegraph.com/subgraphs/name/aave/aave-v2-matic',
      v3: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-polygon',
    },
    aaveV2: {
      pool: '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf',
      poolDataProvider: '0x7551b5D2763519d4e37e8B81929D336De671d46d',
      poolAddressesProvider: '0xd05e3E715d945B59290df0ae8eF85c1BdB684744',
      wethGateway: '0xbEadf48d62aCC944a06EEaE0A9054A90E5A7dc97',
      oracle: '0x0229F777B0fAb107F9591a41d5F02E4e98dB6f2d',
    },
    aaveV3: {
      pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      poolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
      poolAddressesProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
      wethGateway: '0x1e4b7A6b903680eab0c5dAbcb8fD429cD2a9598c',
      oracle: '0xb023e699F5a33916Ea823A16485e259257cA8Bd1',
      aclManager: '0xa72636CbcAa8F5FF95B2cc47F3CDEe83F3294a0B',
      poolConfigurator: '0x8145eddDf43f50276641b55bd3AD95944510021E',
    },
  },

  avalanche: {
    name: 'Avalanche',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    blockExplorer: 'https://snowtrace.io',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    subgraphUrl: {
      v2: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2-avalanche',
      v3: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-avalanche',
    },
    aaveV2: {
      pool: '0x4F01AeD16D97E3aB5ab2B501154DC9bb0F1A5A2C',
      poolDataProvider: '0x65285E9dfab318f57051ab2b139ccCf232945451',
      poolAddressesProvider: '0xb6A86025F0FE1862B372cb0ca18CE3EDe02A318f',
      wethGateway: '0x8a47F74d1eE0e2edEB4F3A7e64EF3bD8e11D27C8',
      oracle: '0xdC336Cd4769f4cC7E9d726DA53e6d3fC710cEB89',
    },
    aaveV3: {
      pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      poolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
      poolAddressesProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
      wethGateway: '0x6F143FE2F7B02424ad3CaD1593D6f36c0Aab69d7',
      oracle: '0xEBd36016B3eD09D4693Ed4251c67Bd858c3c7C9C',
      aclManager: '0xa72636CbcAa8F5FF95B2cc47F3CDEe83F3294a0B',
      poolConfigurator: '0x8145eddDf43f50276641b55bd3AD95944510021E',
    },
  },

  arbitrum: {
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    subgraphUrl: {
      v3: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-arbitrum',
    },
    aaveV3: {
      pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      poolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
      poolAddressesProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
      wethGateway: '0xC09e69E79106861dF5d289dA88349f10e2dc6b5C',
      oracle: '0xb56c2F0B653B2e0b10C9b928C8580Ac5Df02C7C7',
      aclManager: '0xa72636CbcAa8F5FF95B2cc47F3CDEe83F3294a0B',
      poolConfigurator: '0x8145eddDf43f50276641b55bd3AD95944510021E',
    },
  },

  optimism: {
    name: 'Optimism',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    blockExplorer: 'https://optimistic.etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    subgraphUrl: {
      v3: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-optimism',
    },
    aaveV3: {
      pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      poolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
      poolAddressesProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
      wethGateway: '0x76D3030728e52DEB8848d5613aBaDE88441cbc59',
      oracle: '0xD81eb3728a631871a7eBBaD631b5f424909f0c77',
      aclManager: '0xa72636CbcAa8F5FF95B2cc47F3CDEe83F3294a0B',
      poolConfigurator: '0x8145eddDf43f50276641b55bd3AD95944510021E',
    },
  },

  base: {
    name: 'Base',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    subgraphUrl: {
      v3: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-base',
    },
    aaveV3: {
      pool: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
      poolDataProvider: '0x2d8A3C5677189723C4cB8873CfC9C8976FDF38Ac',
      poolAddressesProvider: '0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D',
      wethGateway: '0x8be473dCfA93132559B118a2c311aD49817edb96',
      oracle: '0x2Cc0Fc26eD4563A5ce5e8bdcfe1A2878676Ae156',
      aclManager: '0x43955b0899Ab7232E3a454cf84AedD22Ad46FD33',
      poolConfigurator: '0x5731a04B1E775f0fdd454Bf70f3335886e9A96be',
    },
  },

  fantom: {
    name: 'Fantom',
    chainId: 250,
    rpcUrl: 'https://rpc.ftm.tools',
    blockExplorer: 'https://ftmscan.com',
    nativeCurrency: {
      name: 'Fantom',
      symbol: 'FTM',
      decimals: 18,
    },
    subgraphUrl: {
      v3: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-fantom',
    },
    aaveV3: {
      pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      poolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
      poolAddressesProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
      wethGateway: '0x1DcDA4de2Bf6c7AD9a34788D22aE6b7d55016e1f',
      oracle: '0xfd6f3c1845604C8AE6c6E402ad17fb9885160754',
      aclManager: '0xa72636CbcAa8F5FF95B2cc47F3CDEe83F3294a0B',
      poolConfigurator: '0x8145eddDf43f50276641b55bd3AD95944510021E',
    },
  },

  metis: {
    name: 'Metis',
    chainId: 1088,
    rpcUrl: 'https://andromeda.metis.io/?owner=1088',
    blockExplorer: 'https://andromeda-explorer.metis.io',
    nativeCurrency: {
      name: 'Metis',
      symbol: 'METIS',
      decimals: 18,
    },
    subgraphUrl: {
      v3: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-metis',
    },
    aaveV3: {
      pool: '0x90df02551bB792286e8D4f13E0e357b4Bf1D6a57',
      poolDataProvider: '0x99411FC17Ad1B56f49719E3850B2CDcc0f9bBFd8',
      poolAddressesProvider: '0xB9FABd7500B2C6781c35Dd48d54f81fc2299D7AF',
      wethGateway: '0x8a47F74d1eE0e2edEB4F3A7e64EF3bD8e11D27C8',
      oracle: '0x38D36e85E47eA6ff0d18B0adF12E5fC8984A6f8e',
      aclManager: '0xD7b5d9E6B0b6B8b5b5b5b5b5b5b5b5b5b5b5b5b5',
      poolConfigurator: '0xDb67732477E6D0fa2d1d6b3e93E62fBf3c1b69e2',
    },
  },

  bnb: {
    name: 'BNB Chain',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    subgraphUrl: {
      v3: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-bsc',
    },
    aaveV3: {
      pool: '0x6807dc923806fE8Fd134338EABCA509979a7e0cB',
      poolDataProvider: '0x41585C50524fb8c3899B43D7D797d9486AAc94DB',
      poolAddressesProvider: '0xff75B6da14FfbbfD355Daf7a2731456b3562Ba6D',
      wethGateway: '0xFF3c522F7A5A8C1C74e2e3Ad5Fdb9e3A8d6d4C9b',
      oracle: '0x39bc1bfDa2130d6Bb6DBEfd366939b4c7aa7C697',
      aclManager: '0xF27B4c89f0B15A64d6F8E1e83D3D11e6D5D2E59d',
      poolConfigurator: '0x67bdF23C7fCE7C65fF7415Ba3F2520B45D6f9584',
    },
  },

  gnosis: {
    name: 'Gnosis',
    chainId: 100,
    rpcUrl: 'https://rpc.gnosischain.com',
    blockExplorer: 'https://gnosisscan.io',
    nativeCurrency: {
      name: 'xDAI',
      symbol: 'xDAI',
      decimals: 18,
    },
    subgraphUrl: {
      v3: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-gnosis',
    },
    aaveV3: {
      pool: '0xb50201558B00496A145fE76f7424749556E326D8',
      poolDataProvider: '0x501B4c19dd9C2e06E94dA7b6D5Ed4ddA013EC741',
      poolAddressesProvider: '0x36616cf17557639614c1cdDb356b1B83fc0B2132',
      wethGateway: '0xfE76366A986B72c3f2923e05E6ba07b7de5401e4',
      oracle: '0xeb0a051bE10228213BAEb449db63719d6742F7c4',
      aclManager: '0xb50201558B00496A145fE76f7424749556E326D8',
      poolConfigurator: '0x2Fc8823E1b967D474b47Ae0aD041c2ED562ab588',
    },
  },

  scroll: {
    name: 'Scroll',
    chainId: 534352,
    rpcUrl: 'https://rpc.scroll.io',
    blockExplorer: 'https://scrollscan.com',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    subgraphUrl: {
      v3: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-scroll',
    },
    aaveV3: {
      pool: '0x11fCfe756c05AD438e312a7fd934381537D3cFfe',
      poolDataProvider: '0xa99F4E69acF23C6838DE90dD1B5c02EA928A53ee',
      poolAddressesProvider: '0x69850D0B276776781C063771b161bd8894BCdD04',
      wethGateway: '0xFF75A4B698E3Ec95E608ac0f22A03B8368E05F5D',
      oracle: '0x04421D8C506E2fA2371a08EfAaBf791F624054F3',
      aclManager: '0x7633F981a6248F25bA3e55f6D2F968C53d2e4b9C',
      poolConfigurator: '0x0E1C67CD20C1bB0Aa7d6c21C0B2Cc8F6d2C3f7e1',
    },
  },

  zksync: {
    name: 'zkSync Era',
    chainId: 324,
    rpcUrl: 'https://mainnet.era.zksync.io',
    blockExplorer: 'https://explorer.zksync.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    subgraphUrl: {
      v3: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-zksync',
    },
    aaveV3: {
      pool: '0x78e30497a3c7527d953C6B1E3541b021A98Ac43c',
      poolDataProvider: '0x063eE6d3C8E5B2B0C0E3A5C61F5C8B8C8C8C8C8C',
      poolAddressesProvider: '0x2a58E9bbb5434FdA7FF78051a4B82cb0EF669C17',
      wethGateway: '0xC5Ee5c09DE8f70E9B99e3F5CE9e7ea5D8D8D8D8D',
      oracle: '0x785765De3E9ac3D8eEb42B4724A7FEA8990142B8',
      aclManager: '0x063eE6d3C8E5B2B0C0E3A5C61F5C8B8C8C8C8C8C',
      poolConfigurator: '0x82A8d4cB31032965891B62E5F4E5A61F5C8B8C8C',
    },
  },
};

export const CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  polygon: 137,
  avalanche: 43114,
  arbitrum: 42161,
  optimism: 10,
  base: 8453,
  fantom: 250,
  metis: 1088,
  bnb: 56,
  gnosis: 100,
  scroll: 534352,
  zksync: 324,
};

export interface NetworkConfigWithKey extends NetworkConfig {
  network: string;
  privateKey?: string;
  aaveVersion?: 'v2' | 'v3';
  addresses?: ReturnType<typeof getAaveAddresses>;
}

export const getNetworkConfig = (network: string, version?: string): NetworkConfigWithKey => {
  const config = NETWORKS[network];
  if (!config) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return { ...config, network };
};

export const getAaveAddresses = (network: string, version: 'v2' | 'v3') => {
  const config = getNetworkConfig(network);
  if (version === 'v2') {
    if (!config.aaveV2) {
      throw new Error(`Aave V2 not available on ${network}`);
    }
    return config.aaveV2;
  }
  if (!config.aaveV3) {
    throw new Error(`Aave V3 not available on ${network}`);
  }
  return config.aaveV3;
};

// Helper exports for specific address types
export const GHO_ADDRESSES: Record<string, { ghoToken: string; debtToken: string; flashMinter: string } | undefined> = {
  ethereum: NETWORKS.ethereum.gho ? {
    ghoToken: NETWORKS.ethereum.gho.token,
    debtToken: NETWORKS.ethereum.gho.debtToken,
    flashMinter: NETWORKS.ethereum.gho.flashMinter,
  } : undefined,
};

export const SAFETY_MODULE_ADDRESSES: Record<string, { stkAave: string; stkAbpt: string } | undefined> = {
  ethereum: NETWORKS.ethereum.safetyModule,
};

export const GOVERNANCE_ADDRESSES: Record<string, { governor: string; executorShort: string; executorLong: string; strategy: string } | undefined> = {
  ethereum: NETWORKS.ethereum.governance,
};

/**
 * Get list of supported network names
 */
export const getSupportedNetworks = (): string[] => {
  return Object.keys(NETWORKS);
};
