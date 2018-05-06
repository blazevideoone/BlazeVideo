// SellVideoDialogActions.js
// SPC 2018-4-7

import VideoCoinRuleContract from '../../../../build/contracts/VideoCoinRule.json';
import store from '../../../store';
import { showTXDialog } from '../txdialog/TXDialogAction';

const contract = require('truffle-contract');

export const HIDE_PAYOUT_DIALOG = 'HIDE_PAYOUT_DIALOG';
export const SHOW_PAYOUT_DIALOG = 'SHOW_PAYOUT_DIALOG';

export function showPayoutDialog() {
  return {
    type: SHOW_PAYOUT_DIALOG
  }
}

export function hidePayoutDialog() {
  return {
    type: HIDE_PAYOUT_DIALOG
  }
}

export function asyncPayout(amount) {
  let web3 = store.getState().web3.web3Instance;

  // Double-check web3's status.
  if (typeof web3 !== 'undefined') {

    return function(dispatch) {
      // Using truffle-contract we create the videoAuction object.
      const videoCoinRule = contract(VideoCoinRuleContract);
      videoCoinRule.setProvider(web3.currentProvider);

      // Declaring this for later so we can chain functions on VideoAuction.
      var videoCoinRuleInstance;

      // Get current ethereum wallet.
      web3.eth.getCoinbase( async (error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }
        videoCoinRuleInstance = await videoCoinRule.deployed();
        videoCoinRule.defaults({from: coinbase});
        // Attempt to sell video
        dispatch(showTXDialog(null));
        const result = await videoCoinRuleInstance.payout(amount * 1000000);
        dispatch(showTXDialog(result));
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}
