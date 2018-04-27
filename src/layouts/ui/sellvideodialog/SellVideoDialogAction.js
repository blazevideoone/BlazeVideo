// SellVideoDialogActions.js
// SPC 2018-4-7

import VideoAuctionContract from '../../../../build/contracts/VideoAuction.json';
import store from '../../../store';
import { showTXDialog } from '../txdialog/TXDialogAction';

const contract = require('truffle-contract');

export const HIDE_SELL_VIDEO_DIALOG = 'HIDE_SELL_VIDEO_DIALOG';
export const SHOW_SELL_VIDEO_DIALOG = 'SHOW_SELL_VIDEO_DIALOG';

export function showSellVideoDialog(videoData) {
  return {
    type: SHOW_SELL_VIDEO_DIALOG,
    payload: videoData
  }
}

export function hideSellVideoDialog() {
  return {
    type: HIDE_SELL_VIDEO_DIALOG
  }
}

export function asyncSellVideo(tokenId, price) {
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
        videoAuction.defaults({from: coinbase});
        // Attempt to sell video
        dispatch(showTXDialog(null));
        const result = await videoAuctionInstance.createAuction(web3.toHex(tokenId), web3.toWei(price, 'ether'));
        dispatch(showTXDialog(result));
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}
