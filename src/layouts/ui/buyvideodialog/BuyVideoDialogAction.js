// BuyVideoDialogActions.js
// SPC 2018-4-7
import VideoAuctionContract from '../../../../build/contracts/VideoAuction.json';
import store from '../../../store';

const contract = require('truffle-contract');

export const HIDE_BUY_VIDEO_DIALOG = 'HIDE_BUY_VIDEO_DIALOG';
export const SHOW_BUY_VIDEO_DIALOG = 'SHOW_BUY_VIDEO_DIALOG';

export function showBuyVideoDialog(videoData) {
  return {
    type: SHOW_BUY_VIDEO_DIALOG,
    payload: videoData
  }
}

export function hideBuyVideoDialog() {
  return {
    type: HIDE_BUY_VIDEO_DIALOG
  }
}

export function asyncBuyVideo(tokenId, price) {
  let web3 = store.getState().web3.web3Instance;

  // Double-check web3's status.
  if (typeof web3 !== 'undefined') {

    return function(dispatch) {
      // Using truffle-contract we create the videoAuction object.
      const videoAuction = contract(VideoAuctionContract);
      videoAuction.setProvider(web3.currentProvider);

      // Declaring this for later so we can chain functions on VideoAuction.
      var videoAuctionInstance;

      // Get current ethereum wallet.
      web3.eth.getCoinbase( async (error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }
        videoAuctionInstance = await videoAuction.deployed();
        const _price = web3.toWei(price, 'ether');
        // Attempt to sell video
        const result = await videoAuctionInstance.bid(web3.toHex(tokenId), {from: coinbase, value: _price});
        alert(`TX: ${result.tx}`);
        dispatch(hideBuyVideoDialog());
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}
