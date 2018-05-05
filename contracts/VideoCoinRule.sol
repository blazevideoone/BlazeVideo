pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/lifecycle/Destructible.sol';
import './IVideoBase.sol';
import './VideoBaseAccessor.sol';
import './BitVideoCoin.sol';


contract VideoCoinRule
    is
    IVideoListener,
    VideoBaseAccessor,
    Destructible
  {

  using SafeMath for uint256;

  /*** EVENTS ***/
  /// @dev Emitted when a payout is done
  /// @param receiver who receive the payout and burn the coin.
  /// @param burnedCoins that have been burned for the payout.
  /// @param value amount of eth received.
  event Payout(address receiver, uint256 burnedCoins, uint256 value);

  /*** STORAGE ***/

  /// @dev bitVideoCoin contract
  BitVideoCoin bitVideoCoin;

  /// @dev Number of coins per million 10^6 view count.
  /// Default to 1M, i.e., 1 coin per view count,
  ///   or 1 BTVC per 1M view count.
  uint256 public coinPerMilliViewCount = 1000000;

  /// @dev Minimum amount of coins allowed for a payout.
  /// Default to 10,000, or 0.01 BTVC for 6 decimals.
  uint256 public minimumPayoutAmount = 10000;


  function VideoCoinRule() public payable {}

  function () external payable {}

  /// @dev whether it supports this interface, for sanity check.
  function supportsVideoListener() public view returns (bool) {
    return true;
  }

  /// @dev listen to onVideoAdded, initiialize auction for video added by
  ///   videoBase's owner.
  /// @param _tokenId whose video id is associated to.
  function onVideoAdded(uint256 _tokenId) public onlyFromVideoBase {
    // Do nothing
  }

  /// @dev listener when a video is updated.
  /// @param _oldViewCount old view count.
  /// @param _newViewCount new view count.
  /// @param _tokenId whose the video is associated to.
  function onVideoUpdated(
      uint256 _oldViewCount,
      uint256 _newViewCount,
      uint256 _tokenId)
      public
      onlyFromVideoBase
      onlyVideoBaseExistingToken(_tokenId)
      whenVideoBaseNotPaused
      {
    require(_newViewCount >= _oldViewCount);
    uint256 amount = coinPerMilliViewCount.
                          mul(_newViewCount.sub(_oldViewCount)).
                          div(1000000);
    assert(bitVideoCoin.mintTrusted(videoBase.ownerOf(_tokenId), amount));
  }

  /// @dev listener when a video is transferred.
  /// @param _from sender.
  /// @param _to receiver.
  /// @param _tokenId whose the video is associated to.
  function onVideoTransferred(
      address _from,
      address _to,
      uint256 _tokenId)
      public onlyFromVideoBase {
    // Do nothing
  }

  /// @dev Payout certain amount of BitVideoCoin, in exchange of part of
  ///     videoBaseOwner's eth balance. The amount is burned if successful.
  /// @param amount of BitVideoCoin to be payed out.
  function payout(uint256 amount)
      public
      whenVideoBaseNotPaused
      {
    require(amount <= bitVideoCoin.totalSupply());
    require(amount >= minimumPayoutAmount);
    uint256 contractBalance = this.balance;
    uint256 payoutValue = contractBalance.mul(amount).
                              div(bitVideoCoin.totalSupply());
    require(payoutValue <= contractBalance);

    bitVideoCoin.burnTrusted(msg.sender, amount);
    msg.sender.send(payoutValue);

    Payout(msg.sender, amount, payoutValue);
  }

  /// @dev Set bitVideoCoin, only by videoBase owner
  /// @param _coinAddress address of coin contract
  function setBitVideoCoin(address _coinAddress) public onlyVideoBaseOwner {
    require(_coinAddress != address(0));
    bitVideoCoin = BitVideoCoin(_coinAddress);
  }

  /// @dev Set coinPerMilliViewCount, only by videoBase owner
  /// @param _cpm new value
  function setCoinPerMilliViewCount(uint256 _cpm) public onlyVideoBaseOwner {
    coinPerMilliViewCount = _cpm;
  }

  /// @dev Set minimumPayoutAmount, only by videoBase owner
  /// @param _amount new value
  function setMinimumPayoutAmount(uint256 _amount) public onlyVideoBaseOwner {
    minimumPayoutAmount = _amount;
  }
}
