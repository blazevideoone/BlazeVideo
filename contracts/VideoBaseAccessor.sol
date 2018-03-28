pragma solidity ^0.4.4;

import './IVideoBase.sol';

contract VideoBaseAccessor {

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
