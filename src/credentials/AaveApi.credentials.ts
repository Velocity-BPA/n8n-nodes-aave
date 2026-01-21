import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class AaveApi implements ICredentialType {
  name = 'aaveApi';
  displayName = 'Aave API';
  documentationUrl = 'https://docs.aave.com/';
  properties: INodeProperties[] = [
    {
      displayName: 'The Graph Subgraph URL',
      name: 'subgraphUrl',
      type: 'string',
      default: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3',
      placeholder: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3',
      description: 'The Graph subgraph URL for Aave protocol data',
      required: true,
    },
    {
      displayName: 'Subgraph Network',
      name: 'subgraphNetwork',
      type: 'options',
      default: 'ethereum-v3',
      options: [
        { name: 'Ethereum V2', value: 'ethereum-v2' },
        { name: 'Ethereum V3', value: 'ethereum-v3' },
        { name: 'Polygon V2', value: 'polygon-v2' },
        { name: 'Polygon V3', value: 'polygon-v3' },
        { name: 'Avalanche V2', value: 'avalanche-v2' },
        { name: 'Avalanche V3', value: 'avalanche-v3' },
        { name: 'Arbitrum V3', value: 'arbitrum-v3' },
        { name: 'Optimism V3', value: 'optimism-v3' },
        { name: 'Base V3', value: 'base-v3' },
        { name: 'Custom', value: 'custom' },
      ],
      description: 'The subgraph network to query',
    },
    {
      displayName: 'API Key (Optional)',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'API key for The Graph (if using a paid plan)',
    },
    {
      displayName: 'Custom Subgraph URL',
      name: 'customSubgraphUrl',
      type: 'string',
      default: '',
      placeholder: 'https://api.thegraph.com/subgraphs/name/...',
      description: 'Custom subgraph URL',
      displayOptions: {
        show: {
          subgraphNetwork: ['custom'],
        },
      },
    },
    {
      displayName: 'Rate Limit (Requests per Second)',
      name: 'rateLimit',
      type: 'number',
      default: 10,
      description: 'Maximum requests per second to prevent rate limiting',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{"Bearer " + $credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.subgraphUrl}}',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ _meta { block { number } } }',
      }),
    },
  };
}
