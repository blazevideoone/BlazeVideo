pragma solidity ^0.4.4;

import './IVideoBase.sol';
import './VideoBaseAccessor.sol';

contract VideoCreator
    is
    VideoBaseAccessor
  {

  /*** EVENTS ***/

  /// @dev Emitted when a new video is proposed to added. To be captured by
  ///   an oracle which imports the video.
  /// @param videoId new video id proposed.
  event NewVideoProposed(bytes32 videoId);

  /// @dev propose to add a video, must be a new video. Emitting NewVideoProposed event
  ///   for the oracle to add a new video. Only the owner is allowed to propose.
  /// @param videoId to be proposed as a new video.
  function proposeNewVideo(bytes32 videoId)
      public
      onlyVideoBaseOwner
      whenVideoBaseNotPaused
      onlyVideoBaseNewVideo(videoId)
      {
    NewVideoProposed(videoId);
  }

  /// @dev actually add a new video, usually proposed by the owner and added by
  ///   a system account.
  /// @param videoId to be proposed as a new video.
  /// @param viewCount fetched from the video platform.
  function addNewVideo(bytes32 videoId, uint256 viewCount)
      public
      onlyVideoBaseSystemAccounts
      whenVideoBaseNotPaused
      onlyVideoBaseNewVideo(videoId) {
    videoBase.addNewVideoTrusted(videoBase.owner(), videoId, viewCount);
  }

}
