pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import './VideoSystemAccess.sol';

interface IVideoListener {
  /// @dev whether it supports this interface, for sanity check.
  function supportsVideoListener() public pure returns (bool);

  /// @dev listener when a new video is added.
  /// @param tokenId whose the new video is associated to.
  function onVideoAdded(uint256 tokenId) public;
}

contract IVideoBase
    is
    VideoSystemAccess,
    ERC721Token
  {

  /*** EVENTS ***/

  /// @dev Emitted when a new video is proposed to added. To be captured by
  ///   an oracle which imports the video.
  /// @param videoId new video id proposed.
  event NewVideoProposed(bytes32 videoId);

  /*** DATA TYPES ***/

  /// @dev The main video struct.
  struct Video {
    // The unique token id of the video.
    uint256 tokenId;

    // The video id. The first 4 characters are platform prefix, followed by
    // an underscore, and the video id on that platform.
    bytes32 videoId;

    // The timestamp from the block when this video is generated in the block.
    uint64 birthTime;

    // The last updated view count for the video.
    uint256 viewCount;

    // The timestamp from the block when the view count is last updated.
    uint64 viewCountUpdateTime;
  }


  /*** STORAGE ***/

  /// @dev An array containing the Video struct for all videos in existence.
  ///   The tokenId of each video is actually an index into this array. The
  ///   tokenId 0 is invalid.
  Video[] public videos;

  /// @dev The video id mapping to token id.
  mapping (bytes32 => uint256) public videoIdToTokenId;

  /// @dev An array of listener contracts.
  IVideoListener[] public listeners;


  /// @dev add a listener
  /// @param listener to be added
  function addListener(address listener) public onlyOwner {
    for (uint i = 0; i < listeners.length; i++) {
      if (address(listeners[i]) == listener) {
        // Do nothing if it is already a listener.
        return;
      }
    }

    IVideoListener _listener = IVideoListener(listener);
    require(_listener.supportsVideoListener());
    listeners.push(_listener);
  }

  /// @dev remove a listener
  /// @param listener to be remove
  function removeListener(address listener) public onlyOwner {
    for (uint i = 0; i < listeners.length; i++) {
      if (address(listeners[i]) == listener) {
        delete listeners[i];
        break;
      }
    }
  }

  /// @dev whether it supports this contract, for sanity check.
  function supportsVideoBase() public pure returns (bool) {
    return true;
  }

  /// @dev retrieve tokenId from videoId for convenience.
  /// @param videoId whose tokenId is being retrieved.
  function getTokenId(bytes32 videoId) public view returns (uint256);

  /// @dev retrieve videoId from tokenId.
  /// @param tokenId whose videoId is being retrieved.
  function getVideoId(uint256 tokenId) public view returns (bytes32);

  /// @dev helper function to add a new video and return the new token id.
  ///   Only accessible to trusted contracts.
  /// @param videoOwner owner of the new video.
  /// @param videoId to be proposed as a new video.
  /// @param viewCount fetched from the video platform.
  function addNewVideoTrusted(
      address videoOwner,
      bytes32 videoId,
      uint256 viewCount)
      public
      returns (uint256);
}

contract IVideoBaseAccessor {

  /*** STORAGE ***/

  /// @dev VideoBase contract.
  IVideoBase videoBase;

  modifier whenVideoBaseTokenExists(uint256 tokenId) {
    require(address(videoBase) != address(0) &&
            videoBase.ownerOf(tokenId) != address(0));
    _;
  }

  modifier onlyVideoBaseTokenOwnerOf(uint256 tokenId) {
    require(address(videoBase) != address(0) &&
            msg.sender == videoBase.ownerOf(tokenId));
    _;
  }

  modifier whenVideoBaseNotPaused() {
    require(address(videoBase) != address(0) &&
            !videoBase.paused());
    _;
  }

  modifier onlyVideoBaseBoardMembers() {
    require(address(videoBase) != address(0) && (
            msg.sender == videoBase.owner() ||
            videoBase.findBoardMember(msg.sender) >= 0));
    _;
  }

  modifier onlyVideoBaseSystemAccounts() {
    require(address(videoBase) != address(0) && (
            msg.sender == videoBase.owner() ||
            videoBase.findSystemAccount(msg.sender) >= 0));
    _;
  }

  modifier onlyVideoBaseOwner() {
    require(address(videoBase) == address(0) || msg.sender == videoBase.owner());
    _;
  }

  modifier onlyVideoBaseOwnerOf(address _videoBase) {
    require(_videoBase != address(0) &&
            msg.sender == IVideoBase(_videoBase).owner());
    _;
  }

  modifier onlyFromVideoBase() {
    require(address(videoBase) == address(0) || msg.sender == address(videoBase));
    _;
  }

  /// @dev set IVideoBase contract.
  /// @param _videoBase to be set.
  function setVideoBase(address _videoBase)
      public
      onlyVideoBaseOwnerOf(_videoBase) {
    IVideoBase myVideoBase = IVideoBase(_videoBase);
    require(myVideoBase.supportsVideoBase());
    videoBase = myVideoBase;
  }

  function resetVideoBase()
      public
      onlyVideoBaseOwner {
    if (address(videoBase) == address(0)) {
      return;
    }
    delete videoBase;
  }

  function getVideoBase()
      public
      view
      onlyVideoBaseOwner
      returns(address) {
    return address(videoBase);
  }

}
