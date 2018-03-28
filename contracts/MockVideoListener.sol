pragma solidity ^0.4.4;

import './IVideoBase.sol';

/// @dev Mock implementation for IVideoListener, for test only
contract MockVideoListener is IVideoListener {

  /*** STORAGE ***/

  /// @dev whehter it supports VideoListener.
  bool private _supportsVideoListener;

  /// @dev last tokenId when onVideoAdded() is called..
  uint256 private _lastAddedTokenId;


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
  /// @param tokenId whose the new video is associated to.
  function onVideoAdded(uint256 tokenId) public {
    _lastAddedTokenId = tokenId;
  }

  /// @dev reset _onVideoAddedCalledin the mock
  function mockResetOnVideoAddedCalled() public {
    _lastAddedTokenId = 0;
  }

  /// @dev get last added token id the mock
  function mockGetLastAddedTokenId() public view returns (uint256) {
    return _lastAddedTokenId;
  }

}
