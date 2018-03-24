pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import './VideoSystemAccess.sol';
import './VideoTrusted.sol';

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
    VideoTrusted,
    ERC721Token
  {

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


  /// @dev whether it supports this contract, for sanity check.
  function supportsVideoBase() public pure returns (bool);

  /// @dev retrieve tokenId from videoId for convenience.
  /// @param videoId whose tokenId is being retrieved.
  function getTokenId(bytes32 videoId) public view returns (uint256);

  /// @dev retrieve videoId from tokenId.
  /// @param tokenId whose videoId is being retrieved.
  function getVideoId(uint256 tokenId) public view returns (bytes32);

  /// @dev whether videoId exists.
  /// @param videoId to be checked.
  function videoExists(bytes32 videoId) public view returns (bool);

  /// @dev whether tokenId exists.
  /// @param tokenId to be checked.
  function tokenExists(uint256 tokenId) public view returns (bool);

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

  /// @dev throws if the video is not new.
  /// @param videoId to be checked.
  modifier onlyVideoBaseNewVideo(bytes32 videoId) {
    require(address(videoBase) != address(0) &&
            !videoBase.videoExists(videoId));
    _;
  }

  /// @dev throws if the video does not exist.
  /// @param videoId to be checked.
  modifier onlyVideoBaseExistingVideo(bytes32 videoId) {
    require(address(videoBase) != address(0) &&
            videoBase.videoExists(videoId));
    _;
  }

  /// @dev throws if the token does not exist.
  /// @param tokenId to be checked.
  modifier onlyVideoBaseExistingToken(uint256 tokenId) {
    require(address(videoBase) != address(0) &&
            videoBase.tokenExists(tokenId));
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
