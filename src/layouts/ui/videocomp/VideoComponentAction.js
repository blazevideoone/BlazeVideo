// VideoComponentActions.js
// SPC 2018-4-17
import VideoAuctionContract from '../../../../build/contracts/VideoAuction.json';
import store from '../../../store';

const contract = require('truffle-contract');

export function asyncCancelAuction(tokenId) {
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
        const estGas = await videoAuctionInstance.cancelAuction.estimateGas(web3.toHex(tokenId));
        // Attempt to cancelAuction video
        let tx = '';
        tx = await videoAuctionInstance.cancelAuction(web3.toHex(tokenId), {from: coinbase, gas: estGas * 2});
        console.log(tx);
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}
