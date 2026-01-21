/**
 * Permit Utilities for Aave Protocol
 * EIP-2612 permit signatures for gasless token approvals
 */

import { ethers, Wallet } from 'ethers';

export interface PermitParams {
  owner: string;
  spender: string;
  value: bigint;
  nonce: number;
  deadline: number;
}

export interface PermitSignature {
  v: number;
  r: string;
  s: string;
}

export interface SignedPermit extends PermitParams, PermitSignature {}

// EIP-712 type definitions for permit
const PERMIT_TYPES = {
  Permit: [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};

/**
 * Build EIP-712 domain for permit
 */
export function buildPermitDomain(
  name: string,
  version: string,
  chainId: number,
  verifyingContract: string
): {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
} {
  return {
    name,
    version,
    chainId,
    verifyingContract,
  };
}

/**
 * Get permit nonce for an address from a token contract
 */
export async function getPermitNonce(
  tokenAddress: string,
  owner: string,
  provider: ethers.providers.Provider
): Promise<number> {
  const abi = ['function nonces(address owner) view returns (uint256)'];
  const contract = new ethers.Contract(tokenAddress, abi, provider);
  const nonce = await contract.nonces(owner);
  return Number(nonce);
}

/**
 * Get the domain separator for a token
 */
export async function getDomainSeparator(
  tokenAddress: string,
  provider: ethers.providers.Provider
): Promise<string> {
  const abi = ['function DOMAIN_SEPARATOR() view returns (bytes32)'];
  const contract = new ethers.Contract(tokenAddress, abi, provider);
  return await contract.DOMAIN_SEPARATOR();
}

/**
 * Generate deadline timestamp
 */
export function generateDeadline(minutesFromNow: number = 30): number {
  return Math.floor(Date.now() / 1000) + (minutesFromNow * 60);
}

/**
 * Sign a permit message
 */
export async function signPermit(
  wallet: Wallet,
  tokenAddress: string,
  tokenName: string,
  spender: string,
  value: bigint,
  nonce: number,
  deadline: number,
  chainId: number
): Promise<SignedPermit> {
  const domain = buildPermitDomain(tokenName, '1', chainId, tokenAddress);
  
  const permitParams: PermitParams = {
    owner: await wallet.getAddress(),
    spender,
    value,
    nonce,
    deadline,
  };

  const signature = await wallet._signTypedData(domain, PERMIT_TYPES, permitParams);
  const { v, r, s } = ethers.utils.splitSignature(signature);

  return {
    ...permitParams,
    v,
    r,
    s,
  };
}

/**
 * Build permit parameters for Aave supply/repay with permit
 */
export function buildAavePermitParams(
  signedPermit: SignedPermit
): {
  deadline: number;
  permitV: number;
  permitR: string;
  permitS: string;
} {
  return {
    deadline: signedPermit.deadline,
    permitV: signedPermit.v,
    permitR: signedPermit.r,
    permitS: signedPermit.s,
  };
}

/**
 * Verify a permit signature
 */
export function verifyPermitSignature(
  tokenName: string,
  chainId: number,
  tokenAddress: string,
  permit: SignedPermit
): boolean {
  try {
    const domain = buildPermitDomain(tokenName, '1', chainId, tokenAddress);
    
    const permitData = {
      owner: permit.owner,
      spender: permit.spender,
      value: permit.value,
      nonce: permit.nonce,
      deadline: permit.deadline,
    };

    const recoveredAddress = ethers.utils.verifyTypedData(
      domain,
      PERMIT_TYPES,
      permitData,
      { v: permit.v, r: permit.r, s: permit.s }
    );

    return recoveredAddress.toLowerCase() === permit.owner.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Check if a permit is still valid (not expired)
 */
export function isPermitValid(deadline: number): boolean {
  return deadline > Math.floor(Date.now() / 1000);
}

/**
 * Calculate permit expiry time remaining
 */
export function getPermitTimeRemaining(deadline: number): {
  expired: boolean;
  secondsRemaining: number;
  humanReadable: string;
} {
  const now = Math.floor(Date.now() / 1000);
  const secondsRemaining = deadline - now;
  
  if (secondsRemaining <= 0) {
    return {
      expired: true,
      secondsRemaining: 0,
      humanReadable: 'Expired',
    };
  }

  const minutes = Math.floor(secondsRemaining / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let humanReadable: string;
  if (days > 0) {
    humanReadable = `${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    humanReadable = `${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    humanReadable = `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    humanReadable = `${secondsRemaining} second${secondsRemaining > 1 ? 's' : ''}`;
  }

  return {
    expired: false,
    secondsRemaining,
    humanReadable,
  };
}

/**
 * Encode permit data for bundled transactions
 */
export function encodePermitCalldata(
  tokenAddress: string,
  permit: SignedPermit
): string {
  const abi = [
    'function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
  ];
  const iface = new ethers.utils.Interface(abi);
  
  return iface.encodeFunctionData('permit', [
    permit.owner,
    permit.spender,
    permit.value,
    permit.deadline,
    permit.v,
    permit.r,
    permit.s,
  ]);
}

/**
 * Check if token supports EIP-2612 permit
 */
export async function supportsPermit(
  tokenAddress: string,
  provider: ethers.providers.Provider
): Promise<boolean> {
  try {
    const abi = ['function DOMAIN_SEPARATOR() view returns (bytes32)'];
    const contract = new ethers.Contract(tokenAddress, abi, provider);
    await contract.DOMAIN_SEPARATOR();
    return true;
  } catch {
    return false;
  }
}

/**
 * Build credit delegation signature for borrowing
 */
export async function signCreditDelegation(
  wallet: Wallet,
  debtTokenAddress: string,
  debtTokenName: string,
  delegatee: string,
  value: bigint,
  nonce: number,
  deadline: number,
  chainId: number
): Promise<SignedPermit> {
  const DELEGATION_TYPES = {
    DelegationWithSig: [
      { name: 'delegatee', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };

  const domain = buildPermitDomain(debtTokenName, '1', chainId, debtTokenAddress);
  
  const delegationData = {
    delegatee,
    value,
    nonce,
    deadline,
  };

  const signature = await wallet._signTypedData(domain, DELEGATION_TYPES, delegationData);
  const { v, r, s } = ethers.utils.splitSignature(signature);

  return {
    owner: await wallet.getAddress(),
    spender: delegatee,
    value,
    nonce,
    deadline,
    v,
    r,
    s,
  };
}
