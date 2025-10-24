// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title PrivatePredictionMarket
 * @notice A prediction market where votes are private and only visible to the creator
 * @dev Uses commit-reveal scheme to ensure vote privacy during the voting phase
 */
contract PrivatePredictionMarket {
    enum MarketState {
        Commit,    // Users can commit their votes
        Reveal,    // Users can reveal their votes
        Resolved   // Market has been resolved
    }

    enum Vote {
        None,
        Yes,
        No
    }

    struct Market {
        address creator;
        string description;
        uint256 commitEndTime;
        uint256 revealEndTime;
        MarketState state;
        bool outcome; // true = Yes, false = No
        bool isResolved;
        uint256 yesVotes;
        uint256 noVotes;
    }

    struct CommitInfo {
        bytes32 commitment;
        bool hasCommitted;
        bool hasRevealed;
    }

    struct RevealedVote {
        address voter;
        Vote vote;
        uint256 timestamp;
    }

    // Market ID counter
    uint256 public marketCount;

    // Mapping from market ID to Market
    mapping(uint256 => Market) public markets;

    // Mapping from market ID => voter address => commit info
    mapping(uint256 => mapping(address => CommitInfo)) public commits;

    // Mapping from market ID => voter address => revealed vote
    mapping(uint256 => mapping(address => Vote)) public revealedVotes;

    // Mapping from market ID => list of revealed votes (only accessible by creator)
    mapping(uint256 => RevealedVote[]) private revealedVotesList;

    // Events
    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string description,
        uint256 commitEndTime,
        uint256 revealEndTime
    );
    event VoteCommitted(uint256 indexed marketId, address indexed voter);
    event VoteRevealed(uint256 indexed marketId, address indexed voter, Vote vote);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event MarketStateChanged(uint256 indexed marketId, MarketState newState);

    // Errors
    error InvalidTimeParameters();
    error MarketNotInCommitPhase();
    error MarketNotInRevealPhase();
    error AlreadyCommitted();
    error NotCommitted();
    error AlreadyRevealed();
    error InvalidReveal();
    error OnlyCreator();
    error MarketNotResolved();
    error MarketAlreadyResolved();
    error CommitPhaseNotEnded();
    error RevealPhaseNotEnded();

    /**
     * @notice Create a new prediction market
     * @param description The description of what is being predicted
     * @param commitDuration Duration of the commit phase in seconds
     * @param revealDuration Duration of the reveal phase in seconds
     * @return marketId The ID of the created market
     */
    function createMarket(
        string memory description,
        uint256 commitDuration,
        uint256 revealDuration
    ) external returns (uint256 marketId) {
        if (commitDuration == 0 || revealDuration == 0) revert InvalidTimeParameters();

        marketId = marketCount++;
        uint256 commitEndTime = block.timestamp + commitDuration;
        uint256 revealEndTime = commitEndTime + revealDuration;

        markets[marketId] = Market({
            creator: msg.sender,
            description: description,
            commitEndTime: commitEndTime,
            revealEndTime: revealEndTime,
            state: MarketState.Commit,
            outcome: false,
            isResolved: false,
            yesVotes: 0,
            noVotes: 0
        });

        emit MarketCreated(marketId, msg.sender, description, commitEndTime, revealEndTime);
    }

    /**
     * @notice Commit a vote using a hash
     * @param marketId The ID of the market
     * @param commitment Hash of (vote, salt) using keccak256
     */
    function commitVote(uint256 marketId, bytes32 commitment) external {
        Market storage market = markets[marketId];

        if (market.state != MarketState.Commit) revert MarketNotInCommitPhase();
        if (block.timestamp >= market.commitEndTime) {
            _transitionToReveal(marketId);
            revert MarketNotInCommitPhase();
        }
        if (commits[marketId][msg.sender].hasCommitted) revert AlreadyCommitted();

        commits[marketId][msg.sender] = CommitInfo({
            commitment: commitment,
            hasCommitted: true,
            hasRevealed: false
        });

        emit VoteCommitted(marketId, msg.sender);
    }

    /**
     * @notice Reveal a previously committed vote
     * @param marketId The ID of the market
     * @param vote The vote (Yes or No)
     * @param salt The salt used in the commitment
     */
    function revealVote(uint256 marketId, Vote vote, bytes32 salt) external {
        Market storage market = markets[marketId];
        CommitInfo storage commitInfo = commits[marketId][msg.sender];

        // Transition to reveal phase if commit phase has ended
        if (market.state == MarketState.Commit && block.timestamp >= market.commitEndTime) {
            _transitionToReveal(marketId);
        }

        if (market.state != MarketState.Reveal) revert MarketNotInRevealPhase();
        if (block.timestamp >= market.revealEndTime) {
            _transitionToResolved(marketId);
            revert MarketNotInRevealPhase();
        }
        if (!commitInfo.hasCommitted) revert NotCommitted();
        if (commitInfo.hasRevealed) revert AlreadyRevealed();

        // Verify the commitment
        bytes32 computedCommitment = keccak256(abi.encodePacked(vote, salt));
        if (computedCommitment != commitInfo.commitment) revert InvalidReveal();
        if (vote == Vote.None) revert InvalidReveal();

        // Mark as revealed and record the vote
        commitInfo.hasRevealed = true;
        revealedVotes[marketId][msg.sender] = vote;

        // Add to revealed votes list
        revealedVotesList[marketId].push(RevealedVote({
            voter: msg.sender,
            vote: vote,
            timestamp: block.timestamp
        }));

        // Update vote counts
        if (vote == Vote.Yes) {
            market.yesVotes++;
        } else if (vote == Vote.No) {
            market.noVotes++;
        }

        emit VoteRevealed(marketId, msg.sender, vote);
    }

    /**
     * @notice Manually transition market to reveal phase (can be called by anyone after commit phase ends)
     * @param marketId The ID of the market
     */
    function transitionToReveal(uint256 marketId) external {
        Market storage market = markets[marketId];
        if (market.state != MarketState.Commit) revert MarketNotInCommitPhase();
        if (block.timestamp < market.commitEndTime) revert CommitPhaseNotEnded();

        _transitionToReveal(marketId);
    }

    /**
     * @notice Manually transition market to resolved state (can be called by anyone after reveal phase ends)
     * @param marketId The ID of the market
     */
    function transitionToResolved(uint256 marketId) external {
        Market storage market = markets[marketId];
        if (market.state != MarketState.Reveal) revert MarketNotInRevealPhase();
        if (block.timestamp < market.revealEndTime) revert RevealPhaseNotEnded();

        _transitionToResolved(marketId);
    }

    /**
     * @notice Resolve the market by setting the outcome (creator only)
     * @param marketId The ID of the market
     * @param outcome True for Yes, False for No
     */
    function resolveMarket(uint256 marketId, bool outcome) external {
        Market storage market = markets[marketId];

        if (msg.sender != market.creator) revert OnlyCreator();
        if (market.state != MarketState.Resolved) {
            // Auto-transition if time has passed
            if (market.state == MarketState.Commit && block.timestamp >= market.commitEndTime) {
                _transitionToReveal(marketId);
            }
            if (market.state == MarketState.Reveal && block.timestamp >= market.revealEndTime) {
                _transitionToResolved(marketId);
            }
            if (market.state != MarketState.Resolved) revert MarketNotResolved();
        }
        if (market.isResolved) revert MarketAlreadyResolved();

        market.outcome = outcome;
        market.isResolved = true;

        emit MarketResolved(marketId, outcome);
    }

    /**
     * @notice Get all revealed votes for a market (creator only)
     * @param marketId The ID of the market
     * @return Array of revealed votes
     */
    function getRevealedVotes(uint256 marketId) external view returns (RevealedVote[] memory) {
        if (msg.sender != markets[marketId].creator) revert OnlyCreator();
        return revealedVotesList[marketId];
    }

    /**
     * @notice Get vote counts for a market (creator only)
     * @param marketId The ID of the market
     * @return yesVotes Number of yes votes
     * @return noVotes Number of no votes
     */
    function getVoteCounts(uint256 marketId) external view returns (uint256 yesVotes, uint256 noVotes) {
        if (msg.sender != markets[marketId].creator) revert OnlyCreator();
        Market storage market = markets[marketId];
        return (market.yesVotes, market.noVotes);
    }

    /**
     * @notice Check if a user has committed a vote
     * @param marketId The ID of the market
     * @param voter The address of the voter
     * @return True if the voter has committed
     */
    function hasCommitted(uint256 marketId, address voter) external view returns (bool) {
        return commits[marketId][voter].hasCommitted;
    }

    /**
     * @notice Check if a user has revealed their vote
     * @param marketId The ID of the market
     * @param voter The address of the voter
     * @return True if the voter has revealed
     */
    function hasRevealed(uint256 marketId, address voter) external view returns (bool) {
        return commits[marketId][voter].hasRevealed;
    }

    /**
     * @notice Get market details
     * @param marketId The ID of the market
     * @return market The market struct
     */
    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }

    /**
     * @notice Generate a commitment hash for testing purposes
     * @param vote The vote
     * @param salt The salt
     * @return The commitment hash
     */
    function generateCommitment(Vote vote, bytes32 salt) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(vote, salt));
    }

    // Internal functions

    function _transitionToReveal(uint256 marketId) internal {
        markets[marketId].state = MarketState.Reveal;
        emit MarketStateChanged(marketId, MarketState.Reveal);
    }

    function _transitionToResolved(uint256 marketId) internal {
        markets[marketId].state = MarketState.Resolved;
        emit MarketStateChanged(marketId, MarketState.Resolved);
    }
}
