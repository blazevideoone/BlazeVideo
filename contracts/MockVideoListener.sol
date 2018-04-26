pragma solidity ^0.4.4;

import './IVideoBase.sol';

/// @dev Mock implementation for IVideoListener, for test only
contract MockVideoListener is IVideoListener {

  /*** STORAGE ***/

  /// @dev whehter it supports VideoListener.
  bool private _supportsVideoListener;

  /// @dev last tokenId when onVideoAdded() is called..
  uint256 private _lastAddedTokenId;

  /// @dev last tokenId when onVideoUpdated() is called..
  uint256 private _lastUpdatedTokenId;

  /// @dev last _oldViewCount when onVideoUpdated() is called..
  uint256 private _lastUpdatedOldViewCount;

  /// @dev last _newViewCount when onVideoUpdated() is called..
  uint256 private _lastUpdatedNewViewCount;

  /// @dev last tokenId when onVideoTransfered() is called..
  uint256 private _lastTransferredTokenId;

  /// @dev last _from when onVideoTransfered() is called..
  address private _lastTransferredFrom;

  /// @dev last _to when onVideoTransfered() is called..
  address private _lastTransferredTo;


  /// @dev whether it supports this interface, for sanity check.
  function supportsVideoListener() public view returns (bool) {
    return _supportsVideoListener;
  }

  /// @dev set _supportsVideoListener in the mock.
  /// @param _value to be set.
  function mockSetSupportsVideoListener(bool _value) public {
    _supportsVideoListener = _value;
  }

  /// @dev listener when a new video is added.
  /// @param _tokenId whose the new video is associated to.
  function onVideoAdded(uint256 _tokenId) public {
    _lastAddedTokenId = _tokenId;
  }

  /// @dev reset onVideoAdded() called in the mock
  function mockResetOnVideoAddedCalled() public {
    _lastAddedTokenId = 0;
  }

  /// @dev get last added token id the mock
  function mockGetLastAddedTokenId() public view returns (uint256) {
    return _lastAddedTokenId;
  }

  /// @dev listener when a video is updated.
  /// @param _oldViewCount old view count.
  /// @param _newViewCount new view count.
  /// @param _tokenId whose the video is associated to.
  function onVideoUpdated(
      uint256 _oldViewCount,
      uint256 _newViewCount,
      uint256 _tokenId)
      public {
    _lastUpdatedTokenId = _tokenId;
    _lastUpdatedOldViewCount = _oldViewCount;
    _lastUpdatedNewViewCount = _newViewCount;
  }

  /// @dev reset onVideoUpdated() called in the mock
  function mockResetOnVideoUpdatedCalled() public {
    _lastUpdatedTokenId = 0;
    _lastUpdatedOldViewCount = 0;
    _lastUpdatedNewViewCount = 0;
  }

  /// @dev get last updated info in the mock in
  ///   (_oldViewCount, _newViewCount, _tokenId)
  function mockGetLastUpdatedInfo() public view
      returns (uint256, uint256, uint256) {
    return (_lastUpdatedOldViewCount,
            _lastUpdatedNewViewCount,
            _lastUpdatedTokenId);
  }

  /// @dev listener when a video is transferred.
  /// @param _from sender.
  /// @param _to receiver.
  /// @param _tokenId whose the video is associated to.
  function onVideoTransferred(
      address _from,
      address _to,
      uint256 _tokenId)
      public {
    _lastTransferredFrom = _from;
    _lastTransferredTo = _to;
    _lastTransferredTokenId = _tokenId;
  }

  /// @dev reset onVideoTransferred() called in the mock
  function mockResetOnVideoTransferredCalled() public {
    _lastTransferredTokenId = 0;
    _lastTransferredFrom = address(0);
    _lastTransferredTo = address(0);
  }

  /// @dev get last transferred info in the mock in
  ///   (_drom, _to, _tokenId)
  function mockGetLastVideoTransferredInfo() public view
      returns (address, address, uint256) {
    return (_lastTransferredFrom,
            _lastTransferredTo,
            _lastTransferredTokenId);
  }

}
