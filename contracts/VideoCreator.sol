pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './IVideoBase.sol';
import './VideoBaseAccessor.sol';

contract VideoCreator
    is
    VideoBaseAccessor
  {

  using SafeMath for uint256;

  /*** STORAGE ***/

  /// @dev  Cost in weis for propose a new video.
  uint256 public newVideoCost = 0.0001 ether;

  /// @dev  Cost in weis for update a video.
  uint256 public videoUpdateCost = 0.0001 ether;

  /*** EVENTS ***/

  /// @dev Emitted when a new video is proposed to added. To be captured by
  ///   an oracle which imports the video.
  /// @param videoId new video id proposed.
  event NewVideoProposed(bytes32 videoId);

  /// @dev Emitted when an existing video is requested to be updated. To be
  ///   captured by an oracle which updates the video.
  /// @param videoId video id requested.
  event VideoUpdateRequested(bytes32 videoId);

  /// @dev propose to add a video, must be a new video. Emitting
  ///   NewVideoProposed event for the oracle to add a new video.
  ///   Payable to the videoBase owner and payee, and free for the owner and
  ///   board members.
  /// @param videoId to be proposed as a new video.
  function proposeNewVideo(bytes32 videoId)
      public
      payable
      whenVideoBaseNotPaused
      onlyVideoBaseNewVideo(videoId)
      {
    uint256 _cost = newVideoCost;
    if (videoBase.owner() == msg.sender ||
        videoBase.findBoardMember(msg.sender) >= 0) {
      _cost = 0;  // free for the owner and board members.
    }
    require(msg.value >= _cost);
    uint256 senderRemaining = msg.value.sub(_cost);
    uint256 payeeSplit = getPayeeSplit(_cost);
    NewVideoProposed(videoId);

    if (_cost > 0) {
      if (payeeSplit > 0) {
        payee.transfer(payeeSplit);
      }
      videoBase.owner().transfer(_cost - payeeSplit);
    }
    msg.sender.transfer(senderRemaining);
  }

  /// @dev actually add a new video, usually proposed by the owner/board member
  ///   and added by a system account.
  /// @param videoId to be proposed as a new video.
  /// @param viewCount fetched from the video platform.
  function addNewVideo(bytes32 videoId, uint256 viewCount)
      public
      onlyVideoBaseSystemAccounts
      whenVideoBaseNotPaused
      onlyVideoBaseNewVideo(videoId) {
    videoBase.addNewVideoTrusted(videoBase.owner(), videoId, viewCount);
  }

  /// @dev request to update a video, must be an existing video.
  ///   Emitting updateVideoRequested event for the oracle to update an
  ///   existing video. Only the video's owner is allowed to request.
  ///   payable to the videoBase owner and payee.
  /// @param tokenId of the video to be requested.
  function requestVideoUpdate(uint256 tokenId)
      public
      payable
      onlyVideoBaseTokenOwnerOf(tokenId)
      whenVideoBaseNotPaused
      {
    require(msg.value >= videoUpdateCost);
    uint256 senderRemaining = msg.value.sub(videoUpdateCost);
    uint256 payeeSplit = getPayeeSplit(videoUpdateCost);
    VideoUpdateRequested(videoBase.getVideoId(tokenId));

    if (payeeSplit > 0) {
      payee.transfer(payeeSplit);
    }
    videoBase.owner().transfer(videoUpdateCost - payeeSplit);
    msg.sender.transfer(senderRemaining);
  }

  /// @dev actually update an existing video, usually requested by the video's
  ///   owner and updated by a system account.
  /// @param videoId to be requested For an update.
  /// @param viewCount fetched from the video platform.
  function updateVideo(bytes32 videoId, uint256 viewCount)
      public
      onlyVideoBaseSystemAccounts
      whenVideoBaseNotPaused
      onlyVideoBaseExistingVideo(videoId) {
    videoBase.updateVideoTrusted(videoId, viewCount);
  }

  /// @dev set newVideoCost in wei, only by videoBase onwer.
  /// @param _newCost in wei.
  function setNewVideoCost(uint256 _newCost)
      public
      onlyVideoBaseOwner {
    require(address(videoBase) != address(0));
    newVideoCost = _newCost;
  }

  /// @dev set videoUpdateCost in wei, only by videoBase onwer.
  /// @param _newCost in wei.
  function setVideoUpdateCost(uint256 _newCost)
      public
      onlyVideoBaseOwner {
    require(address(videoBase) != address(0));
    videoUpdateCost = _newCost;
  }
}
