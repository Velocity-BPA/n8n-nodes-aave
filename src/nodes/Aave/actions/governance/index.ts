import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { AaveClient } from '../../transport/aaveClient';
import { ethers } from 'ethers';
import { GOVERNANCE_ADDRESSES } from '../../constants/networks';
import { GOVERNANCE_V3_ABI } from '../../constants/abis';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['governance'],
			},
		},
		options: [
			{
				name: 'Get Proposal',
				value: 'getProposal',
				description: 'Get proposal details by ID',
				action: 'Get proposal',
			},
			{
				name: 'Get Proposal State',
				value: 'getProposalState',
				description: 'Get current state of a proposal',
				action: 'Get proposal state',
			},
			{
				name: 'Get Voting Power',
				value: 'getVotingPower',
				description: 'Get voting power for an address',
				action: 'Get voting power',
			},
			{
				name: 'Submit Vote',
				value: 'submitVote',
				description: 'Vote on a proposal',
				action: 'Submit vote',
			},
		],
		default: 'getProposal',
	},
	{
		displayName: 'Proposal ID',
		name: 'proposalId',
		type: 'number',
		default: 0,
		description: 'The proposal ID',
		displayOptions: {
			show: {
				resource: ['governance'],
				operation: ['getProposal', 'getProposalState', 'submitVote'],
			},
		},
		required: true,
	},
	{
		displayName: 'User Address',
		name: 'userAddress',
		type: 'string',
		default: '',
		placeholder: '0x... (leave empty for connected wallet)',
		description: 'Address to query (leave empty for connected wallet)',
		displayOptions: {
			show: {
				resource: ['governance'],
				operation: ['getVotingPower'],
			},
		},
	},
	{
		displayName: 'Vote Support',
		name: 'support',
		type: 'boolean',
		default: true,
		description: 'Whether to vote for (true) or against (false) the proposal',
		displayOptions: {
			show: {
				resource: ['governance'],
				operation: ['submitVote'],
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
	const provider = client.getProvider();
	const networkConfig = client.getNetworkConfig();
	const govAddresses = GOVERNANCE_ADDRESSES[networkConfig.network as keyof typeof GOVERNANCE_ADDRESSES];
	
	if (!govAddresses) {
		return {
			error: 'Governance is only available on Ethereum mainnet',
			supportedNetwork: 'ethereum',
		};
	}

	switch (operation) {
		case 'getProposal': {
			const proposalId = this.getNodeParameter('proposalId', itemIndex) as number;
			
			const govContract = new ethers.Contract(govAddresses.governor, GOVERNANCE_V3_ABI, provider);
			const proposal = await govContract.getProposal(proposalId);
			
			return {
				proposalId,
				creator: proposal.creator,
				votingStartTime: proposal.votingStartTime?.toString(),
				votingEndTime: proposal.votingEndTime?.toString(),
				forVotes: proposal.forVotes?.toString(),
				againstVotes: proposal.againstVotes?.toString(),
				executed: proposal.executed,
				canceled: proposal.canceled,
			};
		}

		case 'getProposalState': {
			const proposalId = this.getNodeParameter('proposalId', itemIndex) as number;
			
			const govContract = new ethers.Contract(govAddresses.governor, GOVERNANCE_V3_ABI, provider);
			const state = await govContract.getProposalState(proposalId);
			
			const stateNames = [
				'Pending',
				'Active',
				'Succeeded',
				'Queued',
				'Expired',
				'Executed',
				'Canceled',
			];
			
			return {
				proposalId,
				state: Number(state),
				stateName: stateNames[Number(state)] || 'Unknown',
			};
		}

		case 'getVotingPower': {
			let userAddress = this.getNodeParameter('userAddress', itemIndex, '') as string;
			if (!userAddress) userAddress = await client.getWalletAddress()  || "";
			
			const govContract = new ethers.Contract(govAddresses.governor, GOVERNANCE_V3_ABI, provider);
			const votingPower = await govContract.getVotingPowerAt(userAddress, await provider.getBlockNumber());
			
			return {
				userAddress,
				votingPower: votingPower.toString(),
				votingPowerFormatted: ethers.utils.formatUnits(votingPower, 18),
			};
		}

		case 'submitVote': {
			const proposalId = this.getNodeParameter('proposalId', itemIndex) as number;
			const support = this.getNodeParameter('support', itemIndex) as boolean;
			
			const wallet = new ethers.Wallet(networkConfig.privateKey, provider);
			const govContract = new ethers.Contract(govAddresses.governor, GOVERNANCE_V3_ABI, wallet);
			
			const tx = await govContract.submitVote(proposalId, support);
			
			return {
				success: true,
				transactionHash: tx.hash,
				proposalId,
				vote: support ? 'for' : 'against',
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
