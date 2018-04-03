pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/lifecycle/Destructible.sol';
import 'zeppelin-solidity/contracts/ownership/HasNoEther.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './IVideoBase.sol';
import './VideoBaseAccessor.sol';


contract VideoAuction
    is
    Ownable,
    Pausable,
    Destructible,
    VideoBaseAccessor
  {

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
  }

  /*** STORAGE ***/

  /// @dev Cut owner takes on each auction, measured in basis points
  ///   (1/100 of a percent).
  /// Values 0-10,000 map to 0%-100%
  /// Default to 10%
  uint256 public ownerCut = 1000;

  /// @dev Map from token ID to their corresponding auction.
  mapping (uint256 => Auction) tokenIdToAuction;


  /// @dev Throws when the token is not in auction.
  /// @param tokenId to be checked.
  modifier onlyTokenInAuction(uint256 tokenId) {
    require(tokenIdToAuction[tokenId].startedAt > 0);
    _;
  }

  /// @dev Create an auction for a token with lowest bidding price.
  /// @param tokenId to be sent for the auction.
  /// @param price lowest bidding price.
  function createAuction(uint256 tokenId, uint256 price)
      public
      onlyVideoBaseTokenOwnerOf(tokenId)
      whenVideoBaseNotPaused
      {
    require(price > 0);
    require(tokenIdToAuction[tokenId].startedAt == 0);
    Auction memory auction = Auction({
      price: price,
      startedAt: uint64(now)
    });
    tokenIdToAuction[tokenId] = auction;

    AuctionCreated(tokenId, price);
  }

  /// @dev Bid a token with ether. Only the bidding price except the owner cut
  ///   is sent to the seller. The owner get the cut, while the rest is
  ///   returned.
  /// @param tokenId to bid for.
  function bid(uint256 tokenId)
      public
      payable
      onlyTokenInAuction(tokenId)
      whenVideoBaseNotPaused
      {
    Auction storage auction = tokenIdToAuction[tokenId];

    uint256 bidAmount = msg.value;
    address buyer = msg.sender;
    address seller = videoBase.ownerOf(tokenId);
    uint256 price = auction.price;

    require(bidAmount >= auction.price);
    require(seller != buyer);

    uint256 auctioneerCut = price * ownerCut / 10000;
    uint256 sellerProceeds = price - auctioneerCut;
    uint256 bidExcess = bidAmount - price;

    delete tokenIdToAuction[tokenId];

    videoBase.transferVideoTrusted(seller, buyer, tokenId);

    seller.transfer(sellerProceeds);
    buyer.transfer(bidExcess);
    videoBase.owner().transfer(auctioneerCut);

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
    delete tokenIdToAuction[tokenId];
    AuctionCancelled(tokenId);
  }

  /// @dev set owner cut.
  /// @param _ownerCut values 0-10,000 map to 0%-100%
  function setOwnerCut(uint256 _ownerCut)
      public onlyVideoBaseOwner {
    require(_ownerCut >= 0 && _ownerCut <= 10000);
    ownerCut = _ownerCut;
  }

  /// @dev get auction price for a token.
  /// @param tokenId whose auction price is being retrieved.
  function getAuctionPrice(uint256 tokenId)
      public view onlyTokenInAuction(tokenId)
      returns (uint256) {
    return tokenIdToAuction[tokenId].price;
  }
}
