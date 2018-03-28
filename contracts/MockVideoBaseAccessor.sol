pragma solidity ^0.4.4;

import './VideoBaseAccessor.sol';

/// @dev Mock implementation for VideoBaesAccessor, for test only.
contract MockVideoBaseAccessor is VideoBaseAccessor {

  /// @dev function to test onlyVideoBaseTokenOwnerOf
  /// @param tokenId to be checked
  function funcWithOnlyVideoBaseTokenOwnerOf(uint256 tokenId)
      public view onlyVideoBaseTokenOwnerOf(tokenId)
      returns (bool) {
    return true;
  }

  /// @dev function to test whenVideoBaseNotPaused
  function funcWithWhenVideoBaseNotPaused()
      public view whenVideoBaseNotPaused
      returns (bool) {
    return true;
  }

  /// @dev function to test onlyVideoBaseBoardMembers
  function funcWithOnlyVideoBaseBoardMembers()
      public view onlyVideoBaseBoardMembers
      returns (bool) {
    return true;
  }

  /// @dev function to test onlyVideoBaseSystemAccounts
  function funcWithOnlyVideoBaseSystemAccounts()
      public view onlyVideoBaseSystemAccounts
      returns (bool) {
    return true;
  }

  /// @dev function to test onlyVideoBaseNewVideo
  /// @param videoId to be checked
  function funcWithOnlyVideoBaseNewVideo(bytes32 videoId)
      public view onlyVideoBaseNewVideo(videoId)
      returns (bool) {
    return true;
  }

  /// @dev function to test onlyVideoBaseExistingVideo
  /// @param videoId to be checked
  function funcWithOnlyVideoBaseExistingVideo(bytes32 videoId)
      public view onlyVideoBaseExistingVideo(videoId)
      returns (bool) {
    return true;
  }

  /// @dev function to test onlyVideoBaseExistingToken
  /// @param tokenId to be checked
  function funcWithOnlyVideoBaseExistingToken(uint256 tokenId)
      public view onlyVideoBaseExistingToken(tokenId)
      returns (bool) {
    return true;
  }

  /// @dev function to test onlyFromVideoBase
  function funcWithOnlyFromVideoBase()
      public view onlyFromVideoBase
      returns (bool) {
    return true;
  }

}
