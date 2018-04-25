// Profile Actions.js
// SPC 2018-3-28
import VideoBaseContract from '../../../../build/contracts/VideoBase.json';
import VideoAuctionContract from '../../../../build/contracts/VideoAuction.json';
import store from '../../../store';

const contract = require('truffle-contract');

export const LOAD_USER_VIDEOS = 'LOAD_USER_VIDEOS';

function loadUserVideos(videos) {
  return {
    type: LOAD_USER_VIDEOS,
    payload: videos
  }
}

export function asyncLoadUserVideos() {
  let web3 = store.getState().web3.web3Instance;

  // Double-check web3's status.
  if (typeof web3 !== 'undefined') {

    return function(dispatch) {
      // Using truffle-contract we create the videoBase object.
      const videoBase = contract(VideoBaseContract);
      videoBase.setProvider(web3.currentProvider);

      // Using truffle-contract we create the videoAuction object.
      const videoAuction = contract(VideoAuctionContract);
      videoAuction.setProvider(web3.currentProvider);

      // Declaring this for later so we can chain functions on VideoBase.
      var videoBaseInstance;

      // Declaring this for later so we can chain functions on VideoAuction.
      var videoAuctionInstance;

      // Get current ethereum wallet.
      web3.eth.getCoinbase( async (error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }
        videoBaseInstance = await videoBase.deployed();
        videoAuctionInstance = await videoAuction.deployed();
        // Attempt to get video list.
        const _balance = await videoBaseInstance.balanceOf.call(coinbase);
        let _myList = [];
        for (let index = 0; index < _balance.toNumber(); index ++) {
          const _tokenId = await videoBaseInstance.tokenOfOwnerByIndex.call(coinbase, index);
          const _videoId = await videoBaseInstance.getVideoId.call(_tokenId);
          const _viewCount = await videoBaseInstance.getVideoViewCount.call(_videoId);
          const _auctionInfo = await videoAuctionInstance.getAuctionInfo.call(_tokenId);
          console.log(_auctionInfo);
          const video = {
            tokenId: _tokenId.toNumber(),
            videoId: web3.toUtf8(_videoId).slice(5),
            viewCount: _viewCount.toNumber(),
            isForced: !(_auctionInfo[1].toNumber() > 0),
            startTime: _auctionInfo[1].toNumber(),
            price: web3.fromWei(_auctionInfo[0], 'ether').toPrecision(4, 0)
          }
          _myList.push(video);
        }
        dispatch(loadUserVideos(_myList));
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}
