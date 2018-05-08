import VideoCreator from '../../../../build/contracts/VideoCreator.json';
import store from '../../../store';
import { showTXDialog } from '../../../layouts/ui/txdialog/TXDialogAction';

const contract = require('truffle-contract');

export function proposeVideo(videoId) {
  let web3 = store.getState().web3.web3Instance;

  // Double-check web3's status.
  if (typeof web3 !== 'undefined') {

    return function(dispatch) {
      // Using truffle-contract we create the videoCreator object.
      const videoCreator = contract(VideoCreator);
      videoCreator.setProvider(web3.currentProvider);

      // Declaring this for later so we can chain functions on Authentication.
      var videoCreatorInstance;

      // Get current ethereum wallet.
      web3.eth.getCoinbase((error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }

        videoCreator.deployed().then(function(instance) {
          videoCreatorInstance = instance;

          // Attempt to propose new video.
          dispatch(showTXDialog(null));
          const _id = 'YUTB_' + videoId;
          videoCreatorInstance.proposeNewVideo(web3.fromAscii(_id), {from: coinbase, value: web3.toWei(0.01, 'ether')})
          .then(function(result) {
            // If no error, return
            return dispatch(showTXDialog(result));
          })
          .catch(function(result) {
            // If error...
          })
        })
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}
