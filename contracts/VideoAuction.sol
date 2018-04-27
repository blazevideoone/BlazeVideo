pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/lifecycle/Destructible.sol';
import 'zeppelin-solidity/contracts/ownership/HasNoEther.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './IVideoBase.sol';
import './VideoBaseAccessor.sol';


contract VideoAuction
    is
    IVideoListener,
    VideoBaseAccessor
  {

  using SafeMath for uint256;
  using SafeMath for uint64;
  using SafeMath for uint32;
  using SafeMath for uint16;

  /*** EVENTS ***/

  event AuctionCreated(uint256 tokenId, uint256 price);
  event AuctionSuccessful(uint256 tokenId, uint256 totalPrice, address winner);
  event AuctionCancelled(uint256 tokenId);

  /*** DATA TYPES ***/

  /// @dev Represents an auction on an NFT
  struct Auction {
      // Price (in wei) of the auction
      uint256 price;
      // Time when auction started
      // NOTE: 0 if this auction has been concluded
      uint64 startedAt;
      // An extra add-up price for force sell which will be increased per sold.
      uint256 extraForceSellPrice;
      // Number of solds.
      uint64 soldCount;
  }

  /*** STORAGE ***/

  /// @dev Cut owner takes on each auction, measured in basis points
  ///   (1/100 of a percent).
  /// Values 0-10,000 map to 0%-100%
  /// Default to 10%
  uint256 public ownerCut = 1000;

  /// @dev price per view count for the new video auction.
  uint256 public newVideoPricePerViewCount = 0.1 szabo;

  /// @dev price per view count for a force sale.
  uint256 public forceSellPricePerViewCount = 10 szabo;

  /// @dev extra add-up price ration for force sell, measured in basis points
  ///   (1/100 of a percent).
  /// Values 0-10,000 map to 0%-100%
  /// Default to 10%
  uint256 public extraForceSellPriceRatio = 1000;

  /// @dev Map from token ID to their corresponding auction.
  mapping (uint256 => Auction) tokenIdToAuction;


  /// @dev Throws when the token is not in auction.
  /// @param tokenId to be checked.
  modifier onlyTokenInAuction(uint256 tokenId) {
    require(tokenIdToAuction[tokenId].startedAt > 0);
    _;
  }

  /// @dev whether it supports this interface, for sanity check.
  function supportsVideoListener() public view returns (bool) {
    return true;
  }

  /// @dev listen to onVideoAdded, initiialize auction for video added by
  ///   videoBase's owner.
  /// @param _tokenId whose video id is associated to.
  function onVideoAdded(uint256 _tokenId) public onlyFromVideoBase {
    if (videoBase.ownerOf(_tokenId) == videoBase.owner()) {
      uint256 viewCount;
      (, viewCount, ) = videoBase.getVideoTrusted(_tokenId);
      _createAuction(_tokenId, viewCount.mul(newVideoPricePerViewCount));
    }
  }

  /// @dev listener when a video is updated.
  /// @param _oldViewCount old view count.
  /// @param _newViewCount new view count.
  /// @param _tokenId whose the video is associated to.
  function onVideoUpdated(
      uint256 _oldViewCount,
      uint256 _newViewCount,
      uint256 _tokenId)
      public onlyFromVideoBase {
    // Do nothing
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

  /// @dev Create an auction for a token with lowest bidding price.
  /// @param tokenId to be sent for the auction.
  /// @param price lowest bidding price.
  function createAuction(uint256 tokenId, uint256 price)
      public
      onlyVideoBaseTokenOwnerOf(tokenId)
      whenVideoBaseNotPaused
      {
    _createAuction(tokenId, price);
  }

  /// @dev Private function to create an auction for a token with lowest
  ///   bidding price.
  /// @param tokenId to be sent for the auction.
  /// @param price lowest bidding price.
  function _createAuction(uint256 tokenId, uint256 price) private {
    require(price > 0);
    require(tokenIdToAuction[tokenId].startedAt == 0);
    uint256 viewCount;
    (,,viewCount,) = videoBase.getVideoInfo(tokenId);
    Auction storage auction = tokenIdToAuction[tokenId];
    require(price <= _getForceSellPrice(auction, viewCount));
    auction.price = price;
    auction.startedAt = uint64(now);

    AuctionCreated(tokenId, price);
  }

  function _getForceSellPrice(Auction auction, uint256 viewCount)
      internal view
      returns(uint256) {
    return viewCount.mul(forceSellPricePerViewCount).add(
        auction.extraForceSellPrice);
  }

  /// @dev Bid a token with ether. Only the bidding price except the owner cut
  ///   is sent to the seller. The owner get the cut, while the rest is
  ///   returned.
  ///   Bid price is the auction price or the force sell price if
  ///   not in auction.
  /// @param tokenId to bid for.
  function bid(uint256 tokenId)
      public
      payable
      whenVideoBaseNotPaused
      {
    Auction storage auction = tokenIdToAuction[tokenId];

    uint256 bidAmount = msg.value;
    address buyer = msg.sender;
    address seller = videoBase.ownerOf(tokenId);
    uint256 price;
    if (auction.startedAt > 0) {
      price = auction.price;
    } else {
      uint256 viewCount;
      (,,viewCount,) = videoBase.getVideoInfo(tokenId);
      price = _getForceSellPrice(auction, viewCount);
    }

    require(bidAmount >= price);
    require(seller != buyer);

    uint256 auctioneerCut = price.mul(ownerCut).div(10000);
    uint256 sellerProceeds = price.sub(auctioneerCut);
    uint256 bidExcess = bidAmount.sub(price);

    // Conclude the auction
    auction.price = 0;
    auction.startedAt = 0;

    // Calculate extra price
    auction.extraForceSellPrice = auction.extraForceSellPrice.add(
        price.mul(extraForceSellPriceRatio).div(10000));
    auction.soldCount = uint64(auction.soldCount.add(1));

    videoBase.transferVideoTrusted(seller, buyer, tokenId);

    if (bidExcess >= 0) {
      seller.transfer(sellerProceeds);
      buyer.transfer(bidExcess);
      videoBase.owner().transfer(auctioneerCut);
    }

    AuctionSuccessful(tokenId, price, buyer);
  }

  /// @dev Cancel the auction for a token.
  /// @param tokenId whose auction is being cancelled.
  function cancelAuction(uint256 tokenId)
      public
      onlyVideoBaseTokenOwnerOf(tokenId)
      onlyTokenInAuction(tokenId)
      whenVideoBaseNotPaused
      {
    Auction storage auction = tokenIdToAuction[tokenId];

    // Conclude the auction
    auction.price = 0;
    auction.startedAt = 0;

    AuctionCancelled(tokenId);
  }

  /// @dev set owner cut.
  /// @param _ownerCut values 0-10,000 map to 0%-100%
  function setOwnerCut(uint256 _ownerCut)
      public onlyVideoBaseOwner {
    require(_ownerCut >= 0 && _ownerCut <= 10000);
    ownerCut = _ownerCut;
  }

  /// @dev get owner cut.
  function getOwnerCut() public view onlyVideoBaseOwner returns(uint256) {
    return ownerCut;
  }

  /// @dev set extraForceSellPriceRatio.
  /// @param _ratio values 0-10,000 map to 0%-100%
  function setExtraForceSellPriceRatio(uint256 _ratio)
      public onlyVideoBaseOwner {
    require(_ratio >= 0 && _ratio <= 10000);
    extraForceSellPriceRatio = _ratio;
  }

  /// @dev get extraForceSellPriceRatio.
  function getExtraForceSellPriceRatio()
      public view onlyVideoBaseOwner returns(uint256) {
    return extraForceSellPriceRatio;
  }

  /// @dev set newVideoPricePerViewCount.
  /// @param _price new price.
  function setNewVideoPricePerViewCount(uint256 _price)
      public onlyVideoBaseOwner {
    newVideoPricePerViewCount = _price;
  }

  /// @dev get newVideoPricePerViewCount.
  function getNewVideoPricePerViewCount() public view returns(uint256) {
    return newVideoPricePerViewCount;
  }

  /// @dev set forceSellPricePerViewCount.
  /// @param _price new price.
  function setForceSellPricePerViewCount(uint256 _price)
      public onlyVideoBaseOwner {
    forceSellPricePerViewCount = _price;
  }

  /// @dev get forceSellPricePerViewCount.
  function getForceSellPricePerViewCount() public view returns(uint256) {
    return forceSellPricePerViewCount;
  }

  /// @dev get auction price for a token.
  /// @param tokenId whose auction price is being retrieved.
  function getAuctionPrice(uint256 tokenId)
      public view onlyTokenInAuction(tokenId)
      returns (uint256) {
    return tokenIdToAuction[tokenId].price;
  }

  /// @dev get auction info for a token, in (price, startedAt,
  ///   extraForceSellPrice, soldCount).
  /// @param tokenId whose auction price is being retrieved.
  function getAuctionInfo(uint256 tokenId)
      public view
      returns (uint256, uint64, uint256, uint64) {
    Auction storage auction = tokenIdToAuction[tokenId];
    uint256 price = auction.price;
    if (auction.startedAt == 0) {
      uint256 viewCount;
      (,,viewCount,) = videoBase.getVideoInfo(tokenId);
      price = _getForceSellPrice(auction, viewCount);
    }
    return (price, auction.startedAt, auction.extraForceSellPrice,
            auction.soldCount);
  }
}
