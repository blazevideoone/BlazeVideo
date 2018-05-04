pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/lifecycle/Destructible.sol';
import 'zeppelin-solidity/contracts/ownership/HasNoEther.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './IVideoBase.sol';
import './VideoBaseAccessor.sol';
import './BitVideoCoin.sol';


contract VideoCoinRule
    is
    IVideoListener,
    VideoBaseAccessor
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

  /// @dev Ratio on the total balance of owner in each payout, measured in
  ///   basis points (1/100 of a percent).
  /// Values 0-10,000 map to 0%-100%
  /// Default to 70%
  uint256 public payoutRatio = 7000;

  /// @dev Number of coins per million 10^6 view count.
  /// Default to 1M, i.e., 1 coin per view count.
  uint256 public coinPerMilliViewCount = 1000000;


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
    uint256 contractBalance = this.balance;
    uint256 payoutValue = contractBalance.mul(payoutRatio).div(10000).
                              mul(amount).div(bitVideoCoin.totalSupply());
    require(payoutValue <= contractBalance);

    bitVideoCoin.burnTrusted(msg.sender, amount);
    msg.sender.send(payoutValue);

    Payout(msg.sender, amount, payoutValue);
  }
}
