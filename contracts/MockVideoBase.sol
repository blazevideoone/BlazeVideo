pragma solidity ^0.4.4;

import './IVideoBase.sol';
import './MockVideoBaseAccessor.sol';

/// @dev Mock implementation for IVideoBase, for test only
contract MockVideoBase is IVideoBase {

  /*** STORAGE ***/

  /// @dev whehter it supports VideoBase.
  bool private _supportsVideoBase;

  /// @dev the only valid token id in the mock.
  uint256 private _validTokenId;

  /// @dev the only valid video id which maps to validTokenId in the mock.
  bytes32 private _validVideoId;

  /// @dev mock videoBaseAccessor for test.
  MockVideoBaseAccessor private _mockVideoBaseAccessor;

  function MockVideoBase() ERC721Token("MOCKVIDEOBASE", "MVB") {
  }

  /// @dev whether it supports this contract, for sanity check.
  function supportsVideoBase() public view returns (bool) {
    return _supportsVideoBase;
  }

  /// @dev set _supportsVideoBase in the mock
  /// @param _value to be set.
  function mockSetSupportsVideoBase(bool _value) public {
    _supportsVideoBase = _value;
  }

  /// @dev set _validTokenId in the mock
  /// @param _tokenId to be set.
  function mockSetValidTokenId(address _owner, uint256 _tokenId) public {
    _validTokenId = _tokenId;
    _mint(_owner, _tokenId);
  }

  /// @dev set _validVideoId in the mock
  /// @param _videoId to be set.
  function mockSetValidVideoId(bytes32 _videoId) public {
    _validVideoId = _videoId;
  }

  /// @dev retrieve tokenId from videoId for convenience.
  /// @param videoId whose tokenId is being retrieved.
  function getTokenId(bytes32 videoId) public view returns (uint256) {
    require(videoId == _validVideoId);
    return _validTokenId;
  }

  /// @dev retrieve videoId from tokenId.
  /// @param tokenId whose videoId is being retrieved.
  function getVideoId(uint256 tokenId) public view returns (bytes32) {
    require(tokenId == _validTokenId);
    return _validVideoId;
  }

  /// @dev whether videoId exists.
  /// @param videoId to be checked.
  function videoExists(bytes32 videoId) public view returns (bool) {
    return videoId == _validVideoId;
  }

  /// @dev whether tokenId exists.
  /// @param tokenId to be checked.
  function tokenExists(uint256 tokenId) public view returns (bool) {
    return tokenId == _validTokenId;
  }

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
      returns (uint256) {
    // Should not called.
    revert();
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
      public {
    // Should not called.
    revert();
  }

  /// @dev get a video info in (birthTime, viewCount, viewCountUpdateTime).
  /// @param tokenId whose video info is being retrieved.
  function getVideoTrusted(uint256 tokenId)
      public view
      returns (uint64, uint256, uint64) {
    // Should not called.
    revert();
  }

  /// @dev set mock VideoBaseAccessor.
  /// @param _address to be set.
  function setMockVideoBaseAccessor(address _address) public {
    _mockVideoBaseAccessor = MockVideoBaseAccessor(_address);
  }

  /// @dev test funcWithOnlyFromVideoBase for MockVideoBaseAccessor.
  function funcWithOnlyFromVideoBaseForMockVideoBaseAccessor()
      public view
      returns (bool){
    return _mockVideoBaseAccessor.funcWithOnlyFromVideoBase();
  }
}
