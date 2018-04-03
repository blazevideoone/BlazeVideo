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
      // Seller's address
      address seller;

      // Price (in wei) of the auction
      uint256 price;
      // Time when auction started
      // NOTE: 0 if this auction has been concluded
      uint64 startedAt;
  }

  /*** STORAGE ***/

  // Cut owner takes on each auction, measured in basis points (1/100 of a percent).
  // Values 0-10,000 map to 0%-100%
  uint256 public ownerCut;

  // Map from token ID to their corresponding auction.
  mapping (uint256 => Auction) tokenIdToAuction;


  modifier onlyTokenInAuction(uint256 tokenId) {
    require(tokenIdToAuction[tokenId].startedAt > 0);
    _;
  }

  modifier onlyTokenSoldBySender(uint256 tokenId) {
    require(tokenIdToAuction[tokenId].startedAt > 0 &&
            tokenIdToAuction[tokenId].seller == msg.sender);
    _;
  }

  function createAuction(uint256 tokenId, uint256 price)
      public
      onlyVideoBaseTokenOwnerOf(tokenId)
      whenVideoBaseNotPaused
      {
    require(price > 0);
    Auction memory auction = Auction({
      seller: msg.sender,
      price: price,
      startedAt: uint64(now)
    });
    tokenIdToAuction[tokenId] = auction;

    _escrow(tokenId);

    AuctionCreated(tokenId, price);
  }

  function bid(uint256 tokenId)
      public
      payable
      onlyTokenInAuction(tokenId)
      whenVideoBaseNotPaused
      {
    Auction storage auction = tokenIdToAuction[tokenId];

    require(bidAmount >= auction.price);

    uint256 bidAmount = msg.value;
    address buyer = msg.sender;
    address seller = auction.seller;
    uint256 price = auction.price;

    uint256 auctioneerCut = price * ownerCut / 10000;
    uint256 sellerProceeds = price - auctioneerCut;
    uint256 bidExcess = bidAmount - price;

    delete tokenIdToAuction[tokenId];

    videoBase.transfer(buyer, tokenId);

    seller.transfer(sellerProceeds);
    buyer.transfer(bidExcess);
    videoBase.owner().transfer(auctioneerCut);

    AuctionSuccessful(tokenId, price, buyer);
  }

  function cancelAuction(uint256 tokenId)
      public
      payable
      onlyTokenSoldBySender(tokenId)
      whenVideoBaseNotPaused
      {
    delete tokenIdToAuction[tokenId];
    videoBase.transfer(msg.sender, tokenId);
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
      videoBase.transfer(this, _tokenId);
  }

}
