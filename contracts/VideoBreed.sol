pragma solidity ^0.4.4;

import './VideoBase.sol';

contract VideoBreed
    is
    VideoBase
  {

  /*** DATA TYPES ***/

  /// @dev Breeding info for a given video.
  struct Breeding {

    // The minimum timestamp after which this video can engage in breeding
    // activities again.
    uint64 cooldownEndBlock;

    // Set to the index in the cooldown array (see below) that represents
    // the current cooldown duration for this video. This starts at zero
    // for gen0 videos, and is initialized to floor(generation/2) for others.
    // Incremented by one for each successful breeding action.
    uint16 cooldownIndex;

    // The "generation number" of this video. Video minted by the owner
    // for sale are called "gen0" and have a generation number of 0. The
    // generation number of all other videos is the parent video plus one.
    uint16 generation;
  }

  /*** CONSTANTS ***/

  /// @dev A lookup table indicating the cooldown duration after any successful
  ///  breeding action. Caps out at one week (a video can breed an unbounded
  ///  number of times, and the maximum cooldown is always seven days).
  uint32[10] public cooldowns = [
      uint32(10 minutes),
      uint32(1 hours),
      uint32(2 hours),
      uint32(4 hours),
      uint32(8 hours),
      uint32(16 hours),
      uint32(1 days),
      uint32(2 days),
      uint32(4 days),
      uint32(7 days)
  ];

  /*** STORAGE ***/

  /// @dev The video token id mapping to Breed structure.
  mapping (uint256 => Breeding) public tokenIdToBreed;


}
