// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import {PrivatePredictionMarket} from "../src/PrivatePredictionMarket.sol";

contract PrivatePredictionMarketTest is Test {
    PrivatePredictionMarket public market;

    address public creator = address(1);
    address public voter1 = address(2);
    address public voter2 = address(3);
    address public voter3 = address(4);

    uint256 public constant COMMIT_DURATION = 1 days;
    uint256 public constant REVEAL_DURATION = 1 days;

    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string description,
        uint256 commitEndTime,
        uint256 revealEndTime
    );
    event VoteCommitted(uint256 indexed marketId, address indexed voter);
    event VoteRevealed(uint256 indexed marketId, address indexed voter, PrivatePredictionMarket.Vote vote);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event MarketStateChanged(uint256 indexed marketId, PrivatePredictionMarket.MarketState newState);

    function setUp() public {
        market = new PrivatePredictionMarket();
    }

    function testCreateMarket() public {
        vm.startPrank(creator);

        vm.expectEmit(true, true, false, true);
        emit MarketCreated(0, creator, "Will it rain tomorrow?", block.timestamp + COMMIT_DURATION, block.timestamp + COMMIT_DURATION + REVEAL_DURATION);

        uint256 marketId = market.createMarket("Will it rain tomorrow?", COMMIT_DURATION, REVEAL_DURATION);

        assertEq(marketId, 0);

        PrivatePredictionMarket.Market memory m = market.getMarket(marketId);
        assertEq(m.creator, creator);
        assertEq(m.description, "Will it rain tomorrow?");
        assertEq(m.commitEndTime, block.timestamp + COMMIT_DURATION);
        assertEq(m.revealEndTime, block.timestamp + COMMIT_DURATION + REVEAL_DURATION);
        assertEq(uint256(m.state), uint256(PrivatePredictionMarket.MarketState.Commit));
        assertEq(m.isResolved, false);

        vm.stopPrank();
    }

    function testCannotCreateMarketWithZeroDuration() public {
        vm.startPrank(creator);

        vm.expectRevert(PrivatePredictionMarket.InvalidTimeParameters.selector);
        market.createMarket("Test", 0, REVEAL_DURATION);

        vm.expectRevert(PrivatePredictionMarket.InvalidTimeParameters.selector);
        market.createMarket("Test", COMMIT_DURATION, 0);

        vm.stopPrank();
    }

    function testCommitVote() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        bytes32 salt = keccak256("secret");
        bytes32 commitment = market.generateCommitment(PrivatePredictionMarket.Vote.Yes, salt);

        vm.startPrank(voter1);

        vm.expectEmit(true, true, false, false);
        emit VoteCommitted(marketId, voter1);

        market.commitVote(marketId, commitment);

        assertTrue(market.hasCommitted(marketId, voter1));
        assertFalse(market.hasRevealed(marketId, voter1));

        vm.stopPrank();
    }

    function testCannotCommitTwice() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        bytes32 salt = keccak256("secret");
        bytes32 commitment = market.generateCommitment(PrivatePredictionMarket.Vote.Yes, salt);

        vm.startPrank(voter1);
        market.commitVote(marketId, commitment);

        vm.expectRevert(PrivatePredictionMarket.AlreadyCommitted.selector);
        market.commitVote(marketId, commitment);

        vm.stopPrank();
    }

    function testCannotCommitAfterCommitPhaseEnds() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        bytes32 salt = keccak256("secret");
        bytes32 commitment = market.generateCommitment(PrivatePredictionMarket.Vote.Yes, salt);

        // Fast forward past commit phase
        vm.warp(block.timestamp + COMMIT_DURATION + 1);

        vm.prank(voter1);
        vm.expectRevert(PrivatePredictionMarket.MarketNotInCommitPhase.selector);
        market.commitVote(marketId, commitment);
    }

    function testRevealVote() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        bytes32 salt = keccak256("secret");
        PrivatePredictionMarket.Vote vote = PrivatePredictionMarket.Vote.Yes;
        bytes32 commitment = market.generateCommitment(vote, salt);

        // Commit
        vm.prank(voter1);
        market.commitVote(marketId, commitment);

        // Move to reveal phase
        vm.warp(block.timestamp + COMMIT_DURATION + 1);

        vm.startPrank(voter1);

        vm.expectEmit(true, true, false, true);
        emit VoteRevealed(marketId, voter1, vote);

        market.revealVote(marketId, vote, salt);

        assertTrue(market.hasRevealed(marketId, voter1));

        vm.stopPrank();
    }

    function testCannotRevealWithWrongSalt() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        bytes32 salt = keccak256("secret");
        bytes32 wrongSalt = keccak256("wrong");
        PrivatePredictionMarket.Vote vote = PrivatePredictionMarket.Vote.Yes;
        bytes32 commitment = market.generateCommitment(vote, salt);

        vm.prank(voter1);
        market.commitVote(marketId, commitment);

        vm.warp(block.timestamp + COMMIT_DURATION + 1);

        vm.prank(voter1);
        vm.expectRevert(PrivatePredictionMarket.InvalidReveal.selector);
        market.revealVote(marketId, vote, wrongSalt);
    }

    function testCannotRevealWithWrongVote() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        bytes32 salt = keccak256("secret");
        PrivatePredictionMarket.Vote vote = PrivatePredictionMarket.Vote.Yes;
        bytes32 commitment = market.generateCommitment(vote, salt);

        vm.prank(voter1);
        market.commitVote(marketId, commitment);

        vm.warp(block.timestamp + COMMIT_DURATION + 1);

        vm.prank(voter1);
        vm.expectRevert(PrivatePredictionMarket.InvalidReveal.selector);
        market.revealVote(marketId, PrivatePredictionMarket.Vote.No, salt);
    }

    function testCannotRevealWithoutCommitting() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        vm.warp(block.timestamp + COMMIT_DURATION + 1);

        bytes32 salt = keccak256("secret");
        vm.prank(voter1);
        vm.expectRevert(PrivatePredictionMarket.NotCommitted.selector);
        market.revealVote(marketId, PrivatePredictionMarket.Vote.Yes, salt);
    }

    function testCannotRevealDuringCommitPhase() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        bytes32 salt = keccak256("secret");
        PrivatePredictionMarket.Vote vote = PrivatePredictionMarket.Vote.Yes;
        bytes32 commitment = market.generateCommitment(vote, salt);

        vm.prank(voter1);
        market.commitVote(marketId, commitment);

        vm.prank(voter1);
        vm.expectRevert(PrivatePredictionMarket.MarketNotInRevealPhase.selector);
        market.revealVote(marketId, vote, salt);
    }

    function testCannotRevealTwice() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        bytes32 salt = keccak256("secret");
        PrivatePredictionMarket.Vote vote = PrivatePredictionMarket.Vote.Yes;
        bytes32 commitment = market.generateCommitment(vote, salt);

        vm.prank(voter1);
        market.commitVote(marketId, commitment);

        vm.warp(block.timestamp + COMMIT_DURATION + 1);

        vm.startPrank(voter1);
        market.revealVote(marketId, vote, salt);

        vm.expectRevert(PrivatePredictionMarket.AlreadyRevealed.selector);
        market.revealVote(marketId, vote, salt);

        vm.stopPrank();
    }

    function testMultipleVoters() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        // Voter 1 commits Yes
        bytes32 salt1 = keccak256("secret1");
        bytes32 commitment1 = market.generateCommitment(PrivatePredictionMarket.Vote.Yes, salt1);
        vm.prank(voter1);
        market.commitVote(marketId, commitment1);

        // Voter 2 commits No
        bytes32 salt2 = keccak256("secret2");
        bytes32 commitment2 = market.generateCommitment(PrivatePredictionMarket.Vote.No, salt2);
        vm.prank(voter2);
        market.commitVote(marketId, commitment2);

        // Voter 3 commits Yes
        bytes32 salt3 = keccak256("secret3");
        bytes32 commitment3 = market.generateCommitment(PrivatePredictionMarket.Vote.Yes, salt3);
        vm.prank(voter3);
        market.commitVote(marketId, commitment3);

        // Move to reveal phase
        vm.warp(block.timestamp + COMMIT_DURATION + 1);

        // All voters reveal
        vm.prank(voter1);
        market.revealVote(marketId, PrivatePredictionMarket.Vote.Yes, salt1);

        vm.prank(voter2);
        market.revealVote(marketId, PrivatePredictionMarket.Vote.No, salt2);

        vm.prank(voter3);
        market.revealVote(marketId, PrivatePredictionMarket.Vote.Yes, salt3);

        // Check vote counts (only creator can access)
        vm.prank(creator);
        (uint256 yesVotes, uint256 noVotes) = market.getVoteCounts(marketId);
        assertEq(yesVotes, 2);
        assertEq(noVotes, 1);
    }

    function testOnlyCreatorCanSeeVoteCounts() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        bytes32 salt = keccak256("secret");
        bytes32 commitment = market.generateCommitment(PrivatePredictionMarket.Vote.Yes, salt);

        vm.prank(voter1);
        market.commitVote(marketId, commitment);

        vm.warp(block.timestamp + COMMIT_DURATION + 1);

        vm.prank(voter1);
        market.revealVote(marketId, PrivatePredictionMarket.Vote.Yes, salt);

        // Non-creator cannot access vote counts
        vm.prank(voter1);
        vm.expectRevert(PrivatePredictionMarket.OnlyCreator.selector);
        market.getVoteCounts(marketId);

        // Creator can access
        vm.prank(creator);
        (uint256 yesVotes, uint256 noVotes) = market.getVoteCounts(marketId);
        assertEq(yesVotes, 1);
        assertEq(noVotes, 0);
    }

    function testOnlyCreatorCanSeeRevealedVotes() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        bytes32 salt = keccak256("secret");
        bytes32 commitment = market.generateCommitment(PrivatePredictionMarket.Vote.Yes, salt);

        vm.prank(voter1);
        market.commitVote(marketId, commitment);

        vm.warp(block.timestamp + COMMIT_DURATION + 1);

        vm.prank(voter1);
        market.revealVote(marketId, PrivatePredictionMarket.Vote.Yes, salt);

        // Non-creator cannot access revealed votes
        vm.prank(voter1);
        vm.expectRevert(PrivatePredictionMarket.OnlyCreator.selector);
        market.getRevealedVotes(marketId);

        // Creator can access
        vm.prank(creator);
        PrivatePredictionMarket.RevealedVote[] memory votes = market.getRevealedVotes(marketId);
        assertEq(votes.length, 1);
        assertEq(votes[0].voter, voter1);
        assertEq(uint256(votes[0].vote), uint256(PrivatePredictionMarket.Vote.Yes));
    }

    function testTransitionToReveal() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        PrivatePredictionMarket.Market memory m = market.getMarket(marketId);
        assertEq(uint256(m.state), uint256(PrivatePredictionMarket.MarketState.Commit));

        // Fast forward past commit phase
        vm.warp(block.timestamp + COMMIT_DURATION + 1);

        vm.expectEmit(true, false, false, true);
        emit MarketStateChanged(marketId, PrivatePredictionMarket.MarketState.Reveal);

        market.transitionToReveal(marketId);

        m = market.getMarket(marketId);
        assertEq(uint256(m.state), uint256(PrivatePredictionMarket.MarketState.Reveal));
    }

    function testCannotTransitionToRevealEarly() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        vm.expectRevert(PrivatePredictionMarket.CommitPhaseNotEnded.selector);
        market.transitionToReveal(marketId);
    }

    function testTransitionToResolved() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        // Move to reveal phase
        vm.warp(block.timestamp + COMMIT_DURATION + 1);
        market.transitionToReveal(marketId);

        // Move to resolved phase
        vm.warp(block.timestamp + REVEAL_DURATION + 1);

        vm.expectEmit(true, false, false, true);
        emit MarketStateChanged(marketId, PrivatePredictionMarket.MarketState.Resolved);

        market.transitionToResolved(marketId);

        PrivatePredictionMarket.Market memory m = market.getMarket(marketId);
        assertEq(uint256(m.state), uint256(PrivatePredictionMarket.MarketState.Resolved));
    }

    function testCannotTransitionToResolvedEarly() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        vm.warp(block.timestamp + COMMIT_DURATION + 1);
        market.transitionToReveal(marketId);

        vm.expectRevert(PrivatePredictionMarket.RevealPhaseNotEnded.selector);
        market.transitionToResolved(marketId);
    }

    function testResolveMarket() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        // Fast forward to resolved state
        vm.warp(block.timestamp + COMMIT_DURATION + REVEAL_DURATION + 1);
        market.transitionToReveal(marketId);
        market.transitionToResolved(marketId);

        vm.prank(creator);
        vm.expectEmit(true, false, false, true);
        emit MarketResolved(marketId, true);

        market.resolveMarket(marketId, true);

        PrivatePredictionMarket.Market memory m = market.getMarket(marketId);
        assertTrue(m.isResolved);
        assertTrue(m.outcome);
    }

    function testOnlyCreatorCanResolve() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        vm.warp(block.timestamp + COMMIT_DURATION + REVEAL_DURATION + 1);
        market.transitionToReveal(marketId);
        market.transitionToResolved(marketId);

        vm.prank(voter1);
        vm.expectRevert(PrivatePredictionMarket.OnlyCreator.selector);
        market.resolveMarket(marketId, true);
    }

    function testCannotResolveBeforeResolvededState() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        vm.prank(creator);
        vm.expectRevert(PrivatePredictionMarket.MarketNotResolved.selector);
        market.resolveMarket(marketId, true);
    }

    function testCannotResolveTwice() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        vm.warp(block.timestamp + COMMIT_DURATION + REVEAL_DURATION + 1);
        market.transitionToReveal(marketId);
        market.transitionToResolved(marketId);

        vm.startPrank(creator);
        market.resolveMarket(marketId, true);

        vm.expectRevert(PrivatePredictionMarket.MarketAlreadyResolved.selector);
        market.resolveMarket(marketId, false);

        vm.stopPrank();
    }

    function testResolveMarketAutoTransitions() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        // Fast forward to after all phases
        vm.warp(block.timestamp + COMMIT_DURATION + REVEAL_DURATION + 1);

        // Resolve should auto-transition
        vm.prank(creator);
        market.resolveMarket(marketId, true);

        PrivatePredictionMarket.Market memory m = market.getMarket(marketId);
        assertTrue(m.isResolved);
        assertEq(uint256(m.state), uint256(PrivatePredictionMarket.MarketState.Resolved));
    }

    function testCompleteWorkflow() public {
        // Create market
        vm.prank(creator);
        uint256 marketId = market.createMarket("Will ETH reach $5000 by end of year?", COMMIT_DURATION, REVEAL_DURATION);

        // Multiple voters commit
        bytes32 salt1 = bytes32(uint256(1));
        bytes32 salt2 = bytes32(uint256(2));
        bytes32 salt3 = bytes32(uint256(3));

        bytes32 commitment1 = market.generateCommitment(PrivatePredictionMarket.Vote.Yes, salt1);
        bytes32 commitment2 = market.generateCommitment(PrivatePredictionMarket.Vote.Yes, salt2);
        bytes32 commitment3 = market.generateCommitment(PrivatePredictionMarket.Vote.No, salt3);

        vm.prank(voter1);
        market.commitVote(marketId, commitment1);

        vm.prank(voter2);
        market.commitVote(marketId, commitment2);

        vm.prank(voter3);
        market.commitVote(marketId, commitment3);

        // Move to reveal phase
        vm.warp(block.timestamp + COMMIT_DURATION + 1);

        // Voters reveal
        vm.prank(voter1);
        market.revealVote(marketId, PrivatePredictionMarket.Vote.Yes, salt1);

        vm.prank(voter2);
        market.revealVote(marketId, PrivatePredictionMarket.Vote.Yes, salt2);

        vm.prank(voter3);
        market.revealVote(marketId, PrivatePredictionMarket.Vote.No, salt3);

        // Check results (creator only)
        vm.prank(creator);
        (uint256 yesVotes, uint256 noVotes) = market.getVoteCounts(marketId);
        assertEq(yesVotes, 2);
        assertEq(noVotes, 1);

        // Move to resolved state
        vm.warp(block.timestamp + REVEAL_DURATION + 1);

        // Resolve market
        vm.prank(creator);
        market.resolveMarket(marketId, true); // Yes wins

        PrivatePredictionMarket.Market memory m = market.getMarket(marketId);
        assertTrue(m.isResolved);
        assertTrue(m.outcome);
        assertEq(uint256(m.state), uint256(PrivatePredictionMarket.MarketState.Resolved));
    }

    function testCannotRevealNoneVote() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        bytes32 salt = keccak256("secret");
        bytes32 commitment = market.generateCommitment(PrivatePredictionMarket.Vote.None, salt);

        vm.prank(voter1);
        market.commitVote(marketId, commitment);

        vm.warp(block.timestamp + COMMIT_DURATION + 1);

        vm.prank(voter1);
        vm.expectRevert(PrivatePredictionMarket.InvalidReveal.selector);
        market.revealVote(marketId, PrivatePredictionMarket.Vote.None, salt);
    }

    function testRevealedVotesListAccuracy() public {
        vm.prank(creator);
        uint256 marketId = market.createMarket("Test market", COMMIT_DURATION, REVEAL_DURATION);

        // Commit votes
        bytes32 salt1 = bytes32(uint256(1));
        bytes32 salt2 = bytes32(uint256(2));

        bytes32 commitment1 = market.generateCommitment(PrivatePredictionMarket.Vote.Yes, salt1);
        bytes32 commitment2 = market.generateCommitment(PrivatePredictionMarket.Vote.No, salt2);

        vm.prank(voter1);
        market.commitVote(marketId, commitment1);

        vm.prank(voter2);
        market.commitVote(marketId, commitment2);

        // Move to reveal phase
        vm.warp(block.timestamp + COMMIT_DURATION + 1);
        uint256 revealTime1 = block.timestamp;

        // Reveal votes
        vm.prank(voter1);
        market.revealVote(marketId, PrivatePredictionMarket.Vote.Yes, salt1);

        vm.warp(block.timestamp + 100);
        uint256 revealTime2 = block.timestamp;

        vm.prank(voter2);
        market.revealVote(marketId, PrivatePredictionMarket.Vote.No, salt2);

        // Check revealed votes list
        vm.prank(creator);
        PrivatePredictionMarket.RevealedVote[] memory votes = market.getRevealedVotes(marketId);

        assertEq(votes.length, 2);
        assertEq(votes[0].voter, voter1);
        assertEq(uint256(votes[0].vote), uint256(PrivatePredictionMarket.Vote.Yes));
        assertEq(votes[0].timestamp, revealTime1);

        assertEq(votes[1].voter, voter2);
        assertEq(uint256(votes[1].vote), uint256(PrivatePredictionMarket.Vote.No));
        assertEq(votes[1].timestamp, revealTime2);
    }
}
