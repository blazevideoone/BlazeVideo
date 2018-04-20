// DashBoardActions.js
// SPC 2018-3-28
import VideoBaseContract from '../../../build/contracts/VideoBase.json';
import VideoAuctionContract from '../../../build/contracts/VideoAuction.json';

import store from '../../store';

const contract = require('truffle-contract');

export const LOAD_VIDEO_LIST = 'LOAD_VIDEO_LIST';
export const BUY_VIDEO_DIA = 'BUY_VIDEO_DIA';
export const SORT_BY_PRICE = 'SORT_BY_PRICE';
export const SORT_BY_VIEWCOUNT = 'SORT_BY_VIEWCOUNT';

// load video list into reducer
function loadVideoList(videos) {
  return {
    type: LOAD_VIDEO_LIST,
    payload: videos
  }
}

// show buy video dialog
export function showBuyVideoDia() {
  return {
    type: BUY_VIDEO_DIA,
    payload: true
  }
}

// hide buy video dialog
export function hideBuyVideoDia() {
  return {
    type: BUY_VIDEO_DIA,
    payload: false
  }
}

// sort video by price
// params: mode 1 is desc, -1 is asc
export function sortByPrice(mode) {
  return {
    type: SORT_BY_PRICE,
    payload: mode
  }
}

// sort video by video count
// params: mode 1 is desc, -1 is asc
export function sortByViewCount(mode) {
  return {
    type: SORT_BY_VIEWCOUNT,
    payload: mode
  }
}
export function asyncLoadVideoList() {
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
        const _totalSupply = await videoBaseInstance.totalSupply.call(coinbase);
        let _videoList = [];
        for (let index = 0; index < _totalSupply.toNumber(); index ++) {
          const _tokenId = await videoBaseInstance.tokenByIndex.call(index);
          const _videoId = await videoBaseInstance.getVideoId.call(_tokenId);
          const _viewCount = await videoBaseInstance.getVideoViewCount.call(_videoId);
          const _auctionInfo = await videoAuctionInstance.getAuctionInfo.call(_tokenId);
          const video = {
            tokenId: _tokenId.toNumber(),
            videoId: web3.toUtf8(_videoId).slice(5),
            viewCount: _viewCount.toNumber(),
            isForced: !(_auctionInfo[1].toNumber() > 0),
            startTime: _auctionInfo[1].toNumber(),
            price: web3.fromWei(_auctionInfo[0], 'ether').toNumber()
          }
          console.log(video);
          _videoList.push(video);
        }
        console.log(_videoList);
        dispatch(loadVideoList(_videoList));
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}


export function asyncAddNewVideoTrusted(id, count) {
  let web3 = store.getState().web3.web3Instance;
  // Double-check web3's status.
  if (typeof web3 !== 'undefined') {
    return (dispatch) => {
      const videoBase = contract(VideoBaseContract);
      videoBase.setProvider(web3.currentProvider);

      // Declaring this for later so we can chain functions on VideoBase.
      var videoBaseInstance;

      // Get current ethereum wallet.
      web3.eth.getCoinbase( async (error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }
        videoBase.defaults({from: coinbase, gas: 5000000});
        videoBaseInstance = await videoBase.deployed();
        console.log(coinbase,id,count);
        await videoBaseInstance.addNewVideoTrusted(coinbase, id, count);
        // Attempt to get video list.
        const _totalSupply = await videoBaseInstance.totalSupply.call();
        const _myList = await videoBaseInstance.tokensOf.call(coinbase);
        const myList = await Promise.all(_myList.map( async tokenId => {
          const _videoId = await videoBaseInstance.getVideoId.call(tokenId);
          return _videoId;
        }));
        const videos = {
          totalSupply: _totalSupply.toNumber(),
          myList: myList
        }
        dispatch(loadVideoList(videos));
      } );
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}
