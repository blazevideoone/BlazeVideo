pragma solidity ^0.4.4;

import './VideoBase.sol';

contract VideoBreed
    is
    VideoBase
  {

  /*** EVENTS ***/

  /// @dev Emitted when a new video starts breeding. To be captured by
  ///   an oracle which breeds a new video.
  /// @param videoOwner of the video, and the newly bred video.
  /// @param videoId to start breeding
  event VideoStartBreeding(address videoOwner, string videoId);

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
  mapping (uint256 => Breeding) public tokenIdToBreeding;

  /// @dev An approximation of currently how many seconds are in between blocks.
  uint256 public secondsPerBlock = 15;

  /// @dev override VideoBase._initVideo, initiialize gen0 video.
  /// @param tokenId whose video id is associated to.
  /// @param viewCount to updated.
  function _initVideo(uint256 tokenId, uint256 viewCount) internal {
    VideoBase._initVideo(tokenId, viewCount);

    Breeding memory _newBreeding = Breeding({
      // Initial cooldown index is 0.
      cooldownEndBlock: uint64((cooldowns[0]/secondsPerBlock) + block.number),
      cooldownIndex: 0,
      generation: 0
    });
    tokenIdToBreeding[tokenId] = _newBreeding;
  }

  /// @dev start breeding a new video from a given token id of an existing
  ///   video owned by the sender.
  /// @param tokenId whose video id is associated to.
  function startBreeding(uint256 tokenId)
      public
      onlyOwnerOf(tokenId)
      whenNotPaused {
    _startBreeding(tokenId);
  }

  /// @dev internal function to start breeding.
  /// @param tokenId whose video id is associated to.
  function _startBreeding(uint256 tokenId) internal {
    Video storage video = videos[tokenId];
    Breeding storage breeding = tokenIdToBreeding[tokenId];
    breeding.cooldownIndex = breeding.cooldownIndex >= 10 ?
        10 : breeding.cooldownIndex + 1;
    breeding.cooldownEndBlock =
        uint64((cooldowns[breeding.cooldownIndex]/secondsPerBlock) +
            block.number);
    VideoStartBreeding(msg.sender, video.videoId);
  }

  /// @dev actually breed a new video added by a system account.
  /// @param videoOwner the owner of the parent video and the new video.
  /// @param parentVideoId parent video.
  /// @param videoId to be bred.
  /// @param viewCount of the bred video fetched from the video platform.
  function breedVideo(address videoOwner,
                      string parentVideoId,
                      string videoId,
                      uint256 viewCount)
      public onlySystemAccounts whenNotPaused {
    uint256 parentTokenId = getTokenId(parentVideoId);
    require(videoOwner == ownerOf(parentTokenId));

    uint256 tokenId = _addNewVideo(videoOwner, videoId, viewCount);
    Breeding storage parentBreeding = tokenIdToBreeding[parentTokenId];
    Breeding storage breeding = tokenIdToBreeding[tokenId];
    breeding.generation = parentBreeding.generation + 1;
  }

  /// @dev Any board member can fix how many seconds per blocks are currently
  ///   observed.
  /// @param secs new seconds per block to be set.
  function setSecondsPerBlock(uint256 secs) public onlyBoardMembers {
    require(secs < cooldowns[0]);
    secondsPerBlock = secs;
  }

  /// @dev Any board member can get seconds per blocks.
  function getSecondsPerBlock() public view onlyBoardMembers returns (uint256) {
    return secondsPerBlock;
  }
}
