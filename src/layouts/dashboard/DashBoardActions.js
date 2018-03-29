// DashBoardActions.js
// SPC 2018-3-28
import VideoBaseContract from '../../../build/contracts/VideoBase.json';
import store from '../../store';

const contract = require('truffle-contract');

export const LOAD_VIDEO_LIST = 'LOAD_VIDEO_LIST';
function loadVideoList(videos) {
  return {
    type: LOAD_VIDEO_LIST,
    payload: videos
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

      // Declaring this for later so we can chain functions on VideoBase.
      var videoBaseInstance;

      // Get current ethereum wallet.
      web3.eth.getCoinbase( async (error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }
        videoBaseInstance = await videoBase.deployed();
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
