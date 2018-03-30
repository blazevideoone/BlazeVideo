pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import './VideoSystemAccess.sol';
import './VideoTrusted.sol';

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
}
