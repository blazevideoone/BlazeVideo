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

  /// @dev propose to add a video, must be a new video. Emitting NewVideoProposed event
  ///   for the oracle to add a new video. Only the owner and board members is
  ///   allowed to propose.
  /// @param videoId to be proposed as a new video.
  function proposeNewVideo(bytes32 videoId)
      public
      onlyVideoBaseBoardMembers
      whenVideoBaseNotPaused
      onlyVideoBaseNewVideo(videoId)
      {
    NewVideoProposed(videoId);
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
  ///   payable to the videoBase owner.
  /// @param tokenId of the video to be requested.
  function requestVideoUpdate(uint256 tokenId)
      public
      payable
      onlyVideoBaseTokenOwnerOf(tokenId)
      whenVideoBaseNotPaused
      {
    require(msg.value >= videoUpdateCost);
    uint256 senderRemaining = msg.value.sub(videoUpdateCost);
    VideoUpdateRequested(videoBase.getVideoId(tokenId));

    videoBase.owner().send(videoUpdateCost);
    msg.sender.send(senderRemaining);
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

  /// @dev set videoUpdateCost in wei, only by videoBase onwer.
  /// @param _newCost in wei.
  function setVideoUpdateCost(uint256 _newCost)
      public
      onlyVideoBaseOwner {
    require(address(videoBase) != address(0));
    videoUpdateCost = _newCost;
  }
}
