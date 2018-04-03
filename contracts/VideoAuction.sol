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
  event Debug(uint256 tokenId, uint256 price, uint256 price2, uint256 price3, address addr1, address addr2);

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

  // Cut owner takes on each auction, measured in basis points (1/100 of a percent).
  // Values 0-10,000 map to 0%-100%
  // Default to 10%
  uint256 public ownerCut = 1000;

  // Map from token ID to their corresponding auction.
  mapping (uint256 => Auction) tokenIdToAuction;


  modifier onlyTokenInAuction(uint256 tokenId) {
    require(tokenIdToAuction[tokenId].startedAt > 0);
    _;
  }

  function createAuction(uint256 tokenId, uint256 price)
      public
      onlyVideoBaseTokenOwnerOf(tokenId)
      whenVideoBaseNotPaused
      {
    require(price > 0);
    Auction memory auction = Auction({
      price: price,
      startedAt: uint64(now)
    });
    tokenIdToAuction[tokenId] = auction;

    AuctionCreated(tokenId, price);
  }

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

    uint256 auctioneerCut = price * ownerCut / 10000;
    uint256 sellerProceeds = price - auctioneerCut;
    uint256 bidExcess = bidAmount - price;

    Debug(tokenId, price, sellerProceeds, bidExcess, seller, buyer);

    delete tokenIdToAuction[tokenId];

    videoBase.transferVideoTrusted(seller, buyer, tokenId);

    seller.transfer(sellerProceeds);
    buyer.transfer(bidExcess);
    videoBase.owner().transfer(auctioneerCut);

    AuctionSuccessful(tokenId, price, buyer);
  }

  function cancelAuction(uint256 tokenId)
      public
      payable
      onlyVideoBaseTokenOwnerOf(tokenId)
      onlyTokenInAuction(tokenId)
      whenVideoBaseNotPaused
      {
    delete tokenIdToAuction[tokenId];
    AuctionCancelled(tokenId);
  }

  function setOwnerCut(uint256 _ownerCut)
      public onlyVideoBaseOwner {
    require(_ownerCut >= 0 && _ownerCut <= 10000);
    ownerCut = _ownerCut;
  }

  /// @dev Escrows the NFT, assigning ownership to this contract.
  /// Throws if the escrow fails.
  /// @param _tokenId - ID of token whose approval to verify.
  function _escrow(uint256 _tokenId) internal {
      // it will throw if transfer fails
      // videoBase.transfer(this, _tokenId);
  }

}
