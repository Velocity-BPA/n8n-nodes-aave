import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class AaveNetwork implements ICredentialType {
  name = 'aaveNetwork';
  displayName = 'Aave Network';
  documentationUrl = 'https://docs.aave.com/';
  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      default: 'ethereum',
      options: [
        { name: 'Ethereum Mainnet', value: 'ethereum' },
        { name: 'Polygon', value: 'polygon' },
        { name: 'Avalanche', value: 'avalanche' },
        { name: 'Arbitrum', value: 'arbitrum' },
        { name: 'Optimism', value: 'optimism' },
        { name: 'Base', value: 'base' },
        { name: 'Fantom', value: 'fantom' },
        { name: 'Metis', value: 'metis' },
        { name: 'BNB Chain', value: 'bnb' },
        { name: 'Gnosis', value: 'gnosis' },
        { name: 'Scroll', value: 'scroll' },
        { name: 'zkSync Era', value: 'zksync' },
        { name: 'Custom', value: 'custom' },
      ],
      description: 'The blockchain network to connect to',
    },
    {
      displayName: 'Aave Version',
      name: 'aaveVersion',
      type: 'options',
      default: 'v3',
      options: [
        { name: 'Aave V2', value: 'v2' },
        { name: 'Aave V3', value: 'v3' },
      ],
      description: 'The Aave protocol version to use',
    },
    {
      displayName: 'RPC Endpoint URL',
      name: 'rpcUrl',
      type: 'string',
      default: '',
      placeholder: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
      description: 'The RPC endpoint URL for blockchain connection',
      required: true,
    },
    {
      displayName: 'Private Key',
      name: 'privateKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Private key for signing transactions (never shared or logged)',
      required: true,
    },
    {
      displayName: 'Chain ID',
      name: 'chainId',
      type: 'number',
      default: 1,
      description: 'The chain ID for the network (auto-populated based on network selection)',
      hint: 'Ethereum: 1, Polygon: 137, Avalanche: 43114, Arbitrum: 42161, Optimism: 10, Base: 8453',
    },
    {
      displayName: 'Flashbots RPC (Optional)',
      name: 'flashbotsRpc',
      type: 'string',
      default: '',
      placeholder: 'https://relay.flashbots.net',
      description: 'Optional Flashbots RPC endpoint for MEV protection',
    },
    {
      displayName: 'Gas Price Oracle (Optional)',
      name: 'gasPriceOracle',
      type: 'string',
      default: '',
      placeholder: 'https://api.etherscan.io/api?module=gastracker&action=gasoracle',
      description: 'Optional gas price oracle endpoint for optimized gas pricing',
    },
    {
      displayName: 'Custom Pool Address (Optional)',
      name: 'customPoolAddress',
      type: 'string',
      default: '',
      placeholder: '0x...',
      description: 'Custom Aave Pool contract address (only for custom networks)',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Custom Pool Data Provider (Optional)',
      name: 'customPoolDataProvider',
      type: 'string',
      default: '',
      placeholder: '0x...',
      description: 'Custom Pool Data Provider contract address',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.rpcUrl}}',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    },
  };
}
