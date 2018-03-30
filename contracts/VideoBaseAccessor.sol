pragma solidity ^0.4.4;

import './IVideoBase.sol';

contract VideoBaseAccessor {

  /*** STORAGE ***/

  /// @dev VideoBase contract.
  IVideoBase videoBase;


  /// @dev check if the owner of the given token in videoBase is the sender.
  /// @param tokenId to be checked
  modifier onlyVideoBaseTokenOwnerOf(uint256 tokenId) {
    require(address(videoBase) != address(0) &&
            msg.sender == videoBase.ownerOf(tokenId));
    _;
  }

  /// @dev check if videoBase is not paused.
  modifier whenVideoBaseNotPaused() {
    require(address(videoBase) != address(0) &&
            !videoBase.paused());
    _;
  }

  /// @dev check if the sender is one of the board members of videoBase.
  modifier onlyVideoBaseBoardMembers() {
    require(address(videoBase) != address(0) && (
            msg.sender == videoBase.owner() ||
            videoBase.findBoardMember(msg.sender) >= 0));
    _;
  }

  /// @dev check if the sender is one of the system accounts of videoBase.
  modifier onlyVideoBaseSystemAccounts() {
    require(address(videoBase) != address(0) && (
            msg.sender == videoBase.owner() ||
            videoBase.findSystemAccount(msg.sender) >= 0));
    _;
  }

  /// @dev check if the sender is the owner of videoBase.
  modifier onlyVideoBaseOwner() {
    require(address(videoBase) == address(0) || msg.sender == videoBase.owner());
    _;
  }

  /// @dev check if the sender is the owner of the given videoBase.
  /// @param _videoBase whose owner is to be checked.
  modifier onlyVideoBaseOwnerOf(address _videoBase) {
    require(_videoBase != address(0) &&
            msg.sender == IVideoBase(_videoBase).owner());
    _;
  }

  /// @dev check if the video is new.
  /// @param videoId to be checked.
  modifier onlyVideoBaseNewVideo(bytes32 videoId) {
    require(address(videoBase) != address(0) &&
            !videoBase.videoExists(videoId));
    _;
  }

  /// @dev check if the video does exist.
  /// @param videoId to be checked.
  modifier onlyVideoBaseExistingVideo(bytes32 videoId) {
    require(address(videoBase) != address(0) &&
            videoBase.videoExists(videoId));
    _;
  }

  /// @dev check if the token does exist.
  /// @param tokenId to be checked.
  modifier onlyVideoBaseExistingToken(uint256 tokenId) {
    require(address(videoBase) != address(0) &&
            videoBase.tokenExists(tokenId));
    _;
  }

  /// @dev check if the sender is from videoBase contract.
  modifier onlyFromVideoBase() {
    require(address(videoBase) != address(0) &&
            msg.sender == address(videoBase));
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

  /// @dev reset IVideoBase contract.
  function resetVideoBase()
      public
      onlyVideoBaseOwner {
    require(address(videoBase) != address(0));
    delete videoBase;
  }

  /// @dev get the address of the current IVideoBase contract.
  function getVideoBase()
      public
      view
      onlyVideoBaseOwner
      returns(address) {
    return address(videoBase);
  }

}
