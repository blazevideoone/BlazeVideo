// VideoComponentActions.js
// SPC 2018-4-17
import VideoAuctionContract from '../../../../build/contracts/VideoAuction.json';
import VideoCreatorContract from '../../../../build/contracts/VideoCreator.json';
import store from '../../../store';
import { showTXDialog } from '../txdialog/TXDialogAction';

const contract = require('truffle-contract');

export function asyncUpdateViewCount(tokenId) {
  let web3 = store.getState().web3.web3Instance;

  // Double-check web3's status.
  if (typeof web3 !== 'undefined') {

    return function(dispatch) {
      // Using truffle-contract we create the videoAuction object.
      const videoCreator = contract(VideoCreatorContract);
      videoCreator.setProvider(web3.currentProvider);
      // Declaring this for later so we can chain functions on VideoAuction.
      var videoCreatorInstance;

      // Get current ethereum wallet.
      web3.eth.getCoinbase( async (error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }
        const updateCost = 0.0001;
        videoCreatorInstance = await videoCreator.deployed();
        // const estGas = await videoCreatorInstance.requestVideoUpdate.estimateGas(web3.toHex(tokenId), {value: web3.toWei(updateCost, 'ether') });
        // Attempt to request Video Update
        dispatch(showTXDialog(null));
        const tx = await videoCreatorInstance.requestVideoUpdate(web3.toHex(tokenId), {from: coinbase, value: web3.toWei(updateCost, 'ether')});
        dispatch(showTXDialog(tx));
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}

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
        dispatch(showTXDialog(null));
        const tx = await videoAuctionInstance.cancelAuction(web3.toHex(tokenId), {from: coinbase, gas: estGas * 2});
        dispatch(showTXDialog(tx));
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}
