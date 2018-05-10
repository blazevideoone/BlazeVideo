// DashBoardActions.js
// SPC 2018-3-28
import VideoBaseContract from '../../../build/contracts/VideoBase.json';
import VideoAuctionContract from '../../../build/contracts/VideoAuction.json';
import AuthenticationContract from '../../../build/contracts/Authentication.json';

import store from '../../store';

const contract = require('truffle-contract');

export const LOAD_VIDEO_LIST = 'LOAD_VIDEO_LIST';
export const BUY_VIDEO_DIA = 'BUY_VIDEO_DIA';
export const SORT_BY_PRICE = 'SORT_BY_PRICE';
export const SORT_BY_VIEWCOUNT = 'SORT_BY_VIEWCOUNT';
export const SORT_BY_UPDATETIME = 'SORT_BY_UPDATETIME';
export const SORT_BY_LASTSOLD = 'SORT_BY_LASTSOLD';

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

// sort video by last update time
// params: mode 1 is desc, -1 is asc
export function sortByUpdateTime(mode) {
  return {
    type: SORT_BY_UPDATETIME,
    payload: mode
  }
}

// sort video by last update time
// params: mode 1 is desc, -1 is asc
export function sortByLastSold(mode) {
  return {
    type: SORT_BY_LASTSOLD,
    payload: mode
  }
}

export function asyncLoadVideoList() {
  let web3 = store.getState().web3.web3Instance;
  if (!web3) {
    web3 = window.web3;
  }
  // Double-check web3's status.
  if (typeof web3 !== 'undefined') {

    return function(dispatch) {
      // Using truffle-contract we create the videoBase object.
      const videoBase = contract(VideoBaseContract);
      videoBase.setProvider(web3.currentProvider);

      // Using truffle-contract we create the videoAuction object.
      const videoAuction = contract(VideoAuctionContract);
      videoAuction.setProvider(web3.currentProvider);

      // Using truffle-contract we create the Authentication object.
      const authentication = contract(AuthenticationContract);
      authentication.setProvider(web3.currentProvider);

      // Declaring this for later so we can chain functions on VideoBase.
      var videoBaseInstance;

      // Declaring this for later so we can chain functions on VideoAuction.
      var videoAuctionInstance;

      // Declaring this for later so we can chain functions on Authentication.
      var AuthenticationInstance;

      // Get current ethereum wallet.
      web3.eth.getCoinbase( async (error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }
        videoBaseInstance = await videoBase.deployed();
        console.log('videoBase is deployed');
        videoAuctionInstance = await videoAuction.deployed();
        console.log('videoAuction is deployed');
        AuthenticationInstance = await authentication.deployed();
        console.log('authentication is deployed');
        const _videoBaseOwner = await videoBaseInstance.owner.call();
        // Attempt to get video list.
        const _totalSupply = await videoBaseInstance.totalSupply.call(coinbase);
        console.log('totalSupply:', _totalSupply);
        const loadData = async index => {
          const _tokenId = await videoBaseInstance.tokenByIndex.call(index);
          const _owner = await videoBaseInstance.ownerOf.call(_tokenId);
          console.log(_owner);
          if (_owner === '0x') {
            return {
              tokenId: _tokenId.toNumber(),
              owner: _owner
            };
          }
          const _ownerName = await AuthenticationInstance.getUserName.call(_owner);
          const _videoInfo = await videoBaseInstance.getVideoInfo.call(_tokenId);
          const _auctionInfo = await videoAuctionInstance.getAuctionInfo.call(_tokenId);
          const video = {
            tokenId: _tokenId.toNumber(),
            videoId: web3.toUtf8(_videoInfo[0]).slice(5),
            owner: _owner,
            ownerName: web3.toUtf8(_ownerName),
            viewCount: _videoInfo[2].toNumber(),
            lastUpdated: _videoInfo[3].toNumber(),
            lastSold: _auctionInfo[4].toNumber(),
            isForced: !(_auctionInfo[1].toNumber() > 0),
            isNew: _owner === _videoBaseOwner,
            startTime: _auctionInfo[1].toNumber(),
            price: web3.fromWei(_auctionInfo[0], 'ether').toPrecision(4, 0)
          }
          console.log(video);
          return video;
        }
        const promiseList = [];
        for (let index = 0; index < _totalSupply.toNumber(); index ++) {
          promiseList.push(loadData(index));
        }
        const _videoList = await Promise.all(promiseList);
        return dispatch(loadVideoList(_videoList.filter(_v => _v.owner !== '0x')));
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}
