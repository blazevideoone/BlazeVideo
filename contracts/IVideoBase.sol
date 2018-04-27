pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import './VideoSystemAccess.sol';

interface IVideoListener {
  /// @dev whether it supports this interface, for sanity check.
  function supportsVideoListener() public view returns (bool);

  /// @dev listener when a new video is added.
  /// @param tokenId whose the new video is associated to.
  function onVideoAdded(uint256 tokenId) public;
}

contract IVideoBase
    is
    VideoSystemAccess,
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
  function supportsVideoBase() public view returns (bool);

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

  /// @dev helper function to update a existing video.
  ///   Only accessible to trusted contracts.
  /// @param videoId to be proposed as a new video.
  /// @param viewCount fetched from the video platform.
  function updateVideoTrusted(
      bytes32 videoId,
      uint256 viewCount)
      public;

  /// @dev helper function to transfer the ownership of a video's tokenId.
  ///   Only accessible to trusted contracts.
  /// @param _from address which you want to send the token from.
  /// @param _to address which you want to transfer the token to.
  /// @param _tokenId uint256 ID of the token of the video to be transferred.
  function transferVideoTrusted(
      address _from,
      address _to,
      uint256 _tokenId)
      public;

  /// @dev get a video info in (birthTime, viewCount, viewCountUpdateTime).
  /// @param tokenId whose video info is being retrieved.
  function getVideoTrusted(uint256 tokenId)
      public view
      returns (uint64, uint256, uint64);

  /// @dev get the view info for a video, returning a tuple of
  ///   videoId, birthTime, viewCount, viewCountUpdateTime.
  /// @param tokenId whose view info is being retrieved.
  function getVideoInfo(uint256 tokenId)
      public view
      returns (bytes32, uint64, uint256, uint64);

}
