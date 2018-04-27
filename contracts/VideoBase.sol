pragma solidity ^0.4.18;

import './VideoTrusted.sol';
import './IVideoBase.sol';

contract VideoBase
    is
    VideoTrusted,
    IVideoBase
  {

  /*** STORAGE ***/

  /// @dev An array containing the Video struct for all videos in existence.
  ///   The tokenId of each video is actually an index into this array. The
  ///   tokenId 0 is invalid.
  Video[] internal videos;

  /// @dev The video id mapping to token id.
  mapping (bytes32 => uint256) internal videoIdToTokenId;

  /// @dev An array of listener contracts.
  IVideoListener[] internal listeners;


  /// @dev Initialize with tokenId 0 video.
  function VideoBase() ERC721Token("BITVIDEOS", "BTV") public {
    Video memory _invalidVideo = Video({
        tokenId: 0,
        videoId: "INVALID",
        birthTime: 0,
        viewCount: 0,
        viewCountUpdateTime: 0
    });
    videos.push(_invalidVideo);

    _mint(msg.sender, _invalidVideo.tokenId);
    _burn(msg.sender, _invalidVideo.tokenId);
  }

  /// @dev throws if the video is not new.
  /// @param videoId to be checked.
  modifier onlyNewVideo(bytes32 videoId) {
    require(!videoExists(videoId));
    _;
  }

  /// @dev throws if the video does not exist.
  /// @param videoId to be checked.
  modifier onlyExistingVideo(bytes32 videoId) {
    require(videoExists(videoId));
    _;
  }

  /// @dev throws if the token does not exist.
  /// @param tokenId to be checked.
  modifier onlyExistingToken(uint256 tokenId) {
    require(tokenExists(tokenId));
    _;
  }

  /// @dev whether it supports this contract, for sanity check.
  function supportsVideoBase() public view returns (bool) {
    return true;
  }

  /// @dev add a listener
  /// @param listener to be added
  function addListener(address listener) public onlyOwner {
    for (uint i = 0; i < listeners.length; i++) {
      if (address(listeners[i]) == listener) {
        // Throws if it is already a listener.
        revert();
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
        return;
      }
    }
    revert();
  }

  /// @dev retrieve tokenId from videoId for convenience.
  /// @param videoId whose tokenId is being retrieved.
  function getTokenId(bytes32 videoId)
      public view onlyExistingVideo(videoId)
      returns (uint256) {
    return videoIdToTokenId[videoId];
  }

  /// @dev retrieve videoId from tokenId.
  /// @param tokenId whose videoId is being retrieved.
  function getVideoId(uint256 tokenId)
      public view onlyExistingToken(tokenId)
      returns (bytes32) {
    return videos[tokenId].videoId;
  }

  /// @dev whether videoId exists.
  /// @param videoId to be checked.
  function videoExists(bytes32 videoId) public view returns (bool) {
    // Note that we don't treat a burned token can be treated as non-existing.
    return videoIdToTokenId[videoId] != 0;
  }

  /// @dev whether tokenId exists.
  /// @param tokenId to be checked.
  function tokenExists(uint256 tokenId) public view returns (bool) {
    return ownerOf(tokenId) != address(0);
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
      whenNotPaused
      onlyTrustedContracts
      onlyNewVideo(videoId)
      returns (uint256) {
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

  /// @dev helper function to update a existing video.
  ///   Only accessible to trusted contracts.
  /// @param videoId to be proposed as a new video.
  /// @param viewCount fetched from the video platform.
  function updateVideoTrusted(
      bytes32 videoId,
      uint256 viewCount)
      public
      whenNotPaused
      onlyTrustedContracts
      onlyExistingVideo(videoId) {
    uint256 _tokenId = getTokenId(videoId);
    Video storage _video = videos[_tokenId];
    uint256 _oldViewCount = _video.viewCount;
    _video.viewCount = viewCount;
    _video.viewCountUpdateTime = uint64(now);

    for (uint i = 0; i < listeners.length; i++) {
      if (address(listeners[i]) != address(0)) {
        listeners[i].onVideoUpdated(_oldViewCount, _video.viewCount, _tokenId);
      }
    }

  }

  /// @dev helper function to transfer the ownership of a video's tokenId.
  ///   Only accessible to trusted contracts.
  /// @param _from address which you want to send the token from.
  /// @param _to address which you want to transfer the token to.
  /// @param _tokenId uint256 ID of the token of the video to be transferred.
  function transferVideoTrusted(
      address _from,
      address _to,
      uint256 _tokenId)
      public
      whenNotPaused
      onlyTrustedContracts {
    removeTokenFrom(_from, _tokenId);
    addTokenTo(_to, _tokenId);

    for (uint i = 0; i < listeners.length; i++) {
      if (address(listeners[i]) != address(0)) {
        listeners[i].onVideoTransferred(_from, _to, _tokenId);
      }
    }
  }

  /// @dev initialize the view count and viewCountUpdateTime for a video.
  /// @param tokenId whose video id is associated to.
  /// @param viewCount to updated.
  function _initVideo(uint256 tokenId, uint256 viewCount) internal {
    videos[tokenId].viewCount = viewCount;
    videos[tokenId].viewCountUpdateTime = uint64(now);
  }

  /// @dev get a video info in (birthTime, viewCount, viewCountUpdateTime).
  /// @param tokenId whose video info is being retrieved.
  function getVideoTrusted(uint256 tokenId)
      public view onlyTrustedContracts onlyExistingToken(tokenId)
      returns (uint64, uint256, uint64) {
    Video storage video = videos[tokenId];
    return (video.birthTime, video.viewCount, video.viewCountUpdateTime);
  }

  /// @dev get the view count for a video.
  /// @param videoId whose view count is being retrieved.
  function getVideoViewCount(bytes32 videoId)
      public view onlyBoardMembers onlyExistingVideo(videoId)
      returns (uint256) {
    return videos[getTokenId(videoId)].viewCount;
  }

  /// @dev get the view info for a video, returning a tuple of
  ///   videoId, birthTime, viewCount, viewCountUpdateTime.
  /// @param tokenId whose view info is being retrieved.
  function getVideoInfo(uint256 tokenId)
      public view onlyExistingToken(tokenId)
      returns (bytes32, uint64, uint256, uint64) {
    Video storage _video = videos[tokenId];
    return (_video.videoId, _video.birthTime,
            _video.viewCount, _video.viewCountUpdateTime);
  }
}
