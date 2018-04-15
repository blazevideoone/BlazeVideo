// Profile Actions.js
// SPC 2018-3-28
import VideoBaseContract from '../../../../build/contracts/VideoBase.json';
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
        const _balance = await videoBaseInstance.balanceOf.call(coinbase);
        let _myList = [];
        for (let index = 0; index < _balance; index ++) {
          const _tokenId = await videoBaseInstance.tokenOfOwnerByIndex.call(coinbase, index);
          const _videoId = await videoBaseInstance.getVideoId.call(_tokenId);
          const _viewCount = await videoBaseInstance.getVideoViewCount.call(_videoId);
          const video = {
            tokenId: _tokenId.toNumber(),
            videoId: web3.toUtf8(_videoId).slice(5),
            viewCount: _viewCount.toNumber()
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
