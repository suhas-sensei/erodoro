export const CONTRACT_ADDRESS = "0x3BA8aCD0a7F5B281575bD86d65EA90a9b965A0dc" as const;

export const CONTRACT_ABI = [
  {
    type: "function",
    name: "commitVote",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "commitment", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createMarket",
    inputs: [
      { name: "description", type: "string" },
      { name: "commitDuration", type: "uint256" },
      { name: "revealDuration", type: "uint256" },
    ],
    outputs: [{ name: "marketId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "generateCommitment",
    inputs: [
      { name: "vote", type: "uint8" },
      { name: "salt", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "getMarket",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "creator", type: "address" },
          { name: "description", type: "string" },
          { name: "commitEndTime", type: "uint256" },
          { name: "revealEndTime", type: "uint256" },
          { name: "state", type: "uint8" },
          { name: "outcome", type: "bool" },
          { name: "isResolved", type: "bool" },
          { name: "yesVotes", type: "uint256" },
          { name: "noVotes", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRevealedVotes",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "voter", type: "address" },
          { name: "vote", type: "uint8" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getVoteCounts",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [
      { name: "yesVotes", type: "uint256" },
      { name: "noVotes", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasCommitted",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "voter", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasRevealed",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "voter", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "marketCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "resolveMarket",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "outcome", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revealVote",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "vote", type: "uint8" },
      { name: "salt", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transitionToResolved",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transitionToReveal",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "MarketCreated",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "description", type: "string", indexed: false },
      { name: "commitEndTime", type: "uint256", indexed: false },
      { name: "revealEndTime", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "VoteCommitted",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true },
      { name: "voter", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "VoteRevealed",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true },
      { name: "voter", type: "address", indexed: true },
      { name: "vote", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "MarketResolved",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true },
      { name: "outcome", type: "bool", indexed: false },
    ],
  },
  {
    type: "event",
    name: "MarketStateChanged",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true },
      { name: "newState", type: "uint8", indexed: false },
    ],
  },
  {
    type: "error",
    name: "InvalidTimeParameters",
  },
  {
    type: "error",
    name: "MarketNotInCommitPhase",
  },
  {
    type: "error",
    name: "MarketNotInRevealPhase",
  },
  {
    type: "error",
    name: "AlreadyCommitted",
  },
  {
    type: "error",
    name: "NotCommitted",
  },
  {
    type: "error",
    name: "AlreadyRevealed",
  },
  {
    type: "error",
    name: "InvalidReveal",
  },
  {
    type: "error",
    name: "OnlyCreator",
  },
  {
    type: "error",
    name: "MarketNotResolved",
  },
  {
    type: "error",
    name: "MarketAlreadyResolved",
  },
  {
    type: "error",
    name: "CommitPhaseNotEnded",
  },
  {
    type: "error",
    name: "RevealPhaseNotEnded",
  },
] as const;

export enum MarketState {
  Commit = 0,
  Reveal = 1,
  Resolved = 2,
}

export enum Vote {
  None = 0,
  Yes = 1,
  No = 2,
}

export const ERROR_MESSAGES: Record<string, string> = {
  InvalidTimeParameters: "Durations must be > 0.",
  MarketNotInCommitPhase: "Action not allowed in this phase.",
  MarketNotInRevealPhase: "Action not allowed in this phase.",
  AlreadyCommitted: "You already committed.",
  NotCommitted: "You didn't commit in time.",
  AlreadyRevealed: "You already revealed.",
  InvalidReveal: "Vote or salt doesn't match your commitment.",
  OnlyCreator: "Only the market creator can view or perform this action.",
  MarketNotResolved: "You can resolve only after reveal window ends.",
  MarketAlreadyResolved: "Market already resolved.",
  CommitPhaseNotEnded: "Phase hasn't ended yet.",
  RevealPhaseNotEnded: "Phase hasn't ended yet.",
};
