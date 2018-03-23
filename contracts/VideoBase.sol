pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import './IVideoBase.sol';

contract VideoBase
    is
    IVideoBase
  {

  modifier whenTokenExists(uint256 tokenId) {
    require(ownerOf(tokenId) != address(0));
    _;
  }

  /// @dev Initialize with tokenId 0 video.
  function VideoBase() public {
    Video memory _invalidVideo = Video({
        tokenId: 0,
        videoId: "INVALID",
        birthTime: 0,
        viewCount: 0,
        viewCountUpdateTime: 0
    });
    videos.push(_invalidVideo);

    _mint(msg.sender, _invalidVideo.tokenId);
    _burn(_invalidVideo.tokenId);
  }

  /// @dev throws if the video is not new.
  /// @param videoId to be checked.
  function _requireNewVideo(bytes32 videoId) internal view {
    require(videoIdToTokenId[videoId] == 0);
  }

  /// @dev throws if the video does not exist.
  /// @param videoId to be checked.
  function _requireExistingVideo(bytes32 videoId) internal view {
    uint256 tokenId = videoIdToTokenId[videoId];
    require(tokenId > 0);

    // Hopefully does not happen. Assert that the retrieved tokenId is indeed
    // mapped to videoId, since videoId is converted to bytes32.
    require(videos[tokenId].videoId == videoId);
  }

  /// @dev retrieve tokenId from videoId for convenience.
  /// @param videoId whose tokenId is being retrieved.
  function getTokenId(bytes32 videoId) public view returns (uint256) {
    _requireExistingVideo(videoId);

    return videoIdToTokenId[videoId];
  }

  /// @dev retrieve videoId from tokenId.
  /// @param tokenId whose videoId is being retrieved.
  function getVideoId(uint256 tokenId)
      public view whenTokenExists(tokenId)
      returns (bytes32) {
    return videos[tokenId].videoId;
  }

  /// @dev propose to add a video, must be a new video. Emitting NewVideoProposed event
  ///   for the oracle to add a new video. Only the owner is allowed to propose.
  /// @param videoId to be proposed as a new video.
  function proposeNewVideo(bytes32 videoId) public onlyOwner whenNotPaused {
    _requireNewVideo(videoId);
    NewVideoProposed(videoId);
  }

  /// @dev actually add a new video, usually proposed by the owner and added by
  ///   a system account.
  /// @param videoId to be proposed as a new video.
  /// @param viewCount fetched from the video platform.
  function addNewVideo(bytes32 videoId, uint256 viewCount)
      public onlySystemAccounts whenNotPaused {
    addNewVideoTrusted(owner, videoId, viewCount);
  }

  /// @dev internal function to add a new video and return the new token id.
  ///   Only accessible to trusted contracts.
  /// @param videoOwner owner of the new video.
  /// @param videoId to be proposed as a new video.
  /// @param viewCount fetched from the video platform.
  function addNewVideoTrusted(
      address videoOwner,
      bytes32 videoId,
      uint256 viewCount)
      public
      returns (uint256) {
    _requireNewVideo(videoId);
    Video memory _newVideo = Video({
        tokenId: 0,
        videoId: videoId,
        birthTime: uint64(now),
        viewCount: 0,
        viewCountUpdateTime: 0
    });
    uint256 newTokenId = videos.push(_newVideo) - 1;
    videos[newTokenId].tokenId = newTokenId;
    videoIdToTokenId[videoId] = newTokenId;

    // Mint the video token and send to the owner.
    _mint(videoOwner, newTokenId);

    _initVideo(newTokenId, viewCount);

    for (uint i = 0; i < listeners.length; i++) {
      if (address(listeners[i]) != address(0)) {
        listeners[i].onVideoAdded(newTokenId);
      }
    }

    return newTokenId;
  }

  /// @dev initialize the view count and viewCountUpdateTime for a video.
  /// @param tokenId whose video id is associated to.
  /// @param viewCount to updated.
  function _initVideo(uint256 tokenId, uint256 viewCount) internal {
    videos[tokenId].viewCount = viewCount;
    videos[tokenId].viewCountUpdateTime = uint64(now);
  }

  /// @dev get the view count for a video.
  /// @param videoId whose view count is being retrieved.
  function getVideoViewCount(bytes32 videoId)
      public view onlyBoardMembers
      returns (uint256) {
    _requireExistingVideo(videoId);
    return videos[getTokenId(videoId)].viewCount;
  }

}
