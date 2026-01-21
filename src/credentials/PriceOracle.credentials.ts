import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class PriceOracle implements ICredentialType {
  name = 'priceOracle';
  displayName = 'Price Oracle';
  documentationUrl = 'https://docs.chain.link/';
  properties: INodeProperties[] = [
    {
      displayName: 'Oracle Type',
      name: 'oracleType',
      type: 'options',
      default: 'chainlink',
      options: [
        { name: 'Chainlink', value: 'chainlink' },
        { name: 'Aave Oracle', value: 'aave' },
        { name: 'Custom Oracle', value: 'custom' },
      ],
      description: 'The type of price oracle to use',
    },
    {
      displayName: 'RPC Endpoint URL',
      name: 'rpcUrl',
      type: 'string',
      default: '',
      placeholder: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
      description: 'The RPC endpoint URL for oracle queries',
      required: true,
    },
    {
      displayName: 'Chainlink Price Feed Registry',
      name: 'chainlinkRegistry',
      type: 'string',
      default: '0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf',
      description: 'Chainlink Price Feed Registry contract address',
      displayOptions: {
        show: {
          oracleType: ['chainlink'],
        },
      },
    },
    {
      displayName: 'Aave Oracle Address',
      name: 'aaveOracleAddress',
      type: 'string',
      default: '',
      placeholder: '0x...',
      description: 'Aave Price Oracle contract address',
      displayOptions: {
        show: {
          oracleType: ['aave'],
        },
      },
    },
    {
      displayName: 'Custom Oracle Endpoint',
      name: 'customOracleEndpoint',
      type: 'string',
      default: '',
      placeholder: 'https://api.example.com/prices',
      description: 'Custom price oracle API endpoint',
      displayOptions: {
        show: {
          oracleType: ['custom'],
        },
      },
    },
    {
      displayName: 'Fallback Oracle Endpoint',
      name: 'fallbackOracleEndpoint',
      type: 'string',
      default: '',
      placeholder: 'https://api.coingecko.com/api/v3',
      description: 'Fallback price oracle endpoint',
    },
    {
      displayName: 'API Key (Optional)',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'API key for the price oracle service',
    },
    {
      displayName: 'Price Staleness Threshold (Seconds)',
      name: 'stalenessThreshold',
      type: 'number',
      default: 3600,
      description: 'Maximum age of price data before considered stale (in seconds)',
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
