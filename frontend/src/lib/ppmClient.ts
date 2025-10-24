import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
} from "wagmi/actions";
import { type Address } from "viem";
import { config } from "./wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI, Vote, MarketState } from "./contract";
import { keccak256, encodeAbiParameters } from "viem";

export interface Market {
  creator: Address;
  description: string;
  commitEndTime: bigint;
  revealEndTime: bigint;
  state: MarketState;
  outcome: boolean;
  isResolved: boolean;
  yesVotes: bigint;
  noVotes: bigint;
}

export interface RevealedVote {
  voter: Address;
  vote: Vote;
  timestamp: bigint;
}

export async function getMarketCount(): Promise<bigint> {
  return (await readContract(config, {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "marketCount",
  })) as bigint;
}

export async function getMarket(marketId: number): Promise<Market> {
  const result = await readContract(config, {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getMarket",
    args: [BigInt(marketId)],
  });

  return result as Market;
}

export async function hasCommitted(
  marketId: number,
  voter: Address
): Promise<boolean> {
  return (await readContract(config, {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "hasCommitted",
    args: [BigInt(marketId), voter],
  })) as boolean;
}

export async function hasRevealed(
  marketId: number,
  voter: Address
): Promise<boolean> {
  return (await readContract(config, {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "hasRevealed",
    args: [BigInt(marketId), voter],
  })) as boolean;
}

export async function getVoteCounts(
  marketId: number
): Promise<{ yesVotes: bigint; noVotes: bigint }> {
  const result = await readContract(config, {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getVoteCounts",
    args: [BigInt(marketId)],
  });

  return {
    yesVotes: (result as [bigint, bigint])[0],
    noVotes: (result as [bigint, bigint])[1],
  };
}

export async function getRevealedVotes(
  marketId: number
): Promise<RevealedVote[]> {
  return (await readContract(config, {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getRevealedVotes",
    args: [BigInt(marketId)],
  })) as RevealedVote[];
}

export function generateCommitmentHash(vote: Vote, salt: `0x${string}`): `0x${string}` {
  return keccak256(
    encodeAbiParameters(
      [{ type: "uint8" }, { type: "bytes32" }],
      [vote, salt]
    )
  );
}

export async function createMarket(
  description: string,
  commitDuration: number,
  revealDuration: number
): Promise<{ hash: `0x${string}`; marketId?: bigint }> {
  const hash = await writeContract(config, {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "createMarket",
    args: [description, BigInt(commitDuration), BigInt(revealDuration)],
  });

  const receipt = await waitForTransactionReceipt(config, { hash });

  // Extract marketId from logs if needed
  return { hash };
}

export async function commitVote(
  marketId: number,
  commitment: `0x${string}`
): Promise<`0x${string}`> {
  const hash = await writeContract(config, {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "commitVote",
    args: [BigInt(marketId), commitment],
  });

  await waitForTransactionReceipt(config, { hash });
  return hash;
}

export async function revealVote(
  marketId: number,
  vote: Vote,
  salt: `0x${string}`
): Promise<`0x${string}`> {
  const hash = await writeContract(config, {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "revealVote",
    args: [BigInt(marketId), vote, salt],
  });

  await waitForTransactionReceipt(config, { hash });
  return hash;
}

export async function transitionToReveal(marketId: number): Promise<`0x${string}`> {
  const hash = await writeContract(config, {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "transitionToReveal",
    args: [BigInt(marketId)],
  });

  await waitForTransactionReceipt(config, { hash });
  return hash;
}

export async function transitionToResolved(marketId: number): Promise<`0x${string}`> {
  const hash = await writeContract(config, {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "transitionToResolved",
    args: [BigInt(marketId)],
  });

  await waitForTransactionReceipt(config, { hash });
  return hash;
}

export async function resolveMarket(
  marketId: number,
  outcome: boolean
): Promise<`0x${string}`> {
  const hash = await writeContract(config, {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "resolveMarket",
    args: [BigInt(marketId), outcome],
  });

  await waitForTransactionReceipt(config, { hash });
  return hash;
}
