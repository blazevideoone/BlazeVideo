import AuthenticationContract from '../../../../build/contracts/Authentication.json';
import BitVideoCoin from '../../../../build/contracts/BitVideoCoin.json';
import { browserHistory } from 'react-router';
import store from '../../../store';

const contract = require('truffle-contract');

export const USER_LOGGED_IN = 'USER_LOGGED_IN';
function userLoggedIn(user) {
  return {
    type: USER_LOGGED_IN,
    payload: user
  }
}

export function loginUser() {
  let web3 = store.getState().web3.web3Instance;

  // Double-check web3's status.
  if (typeof web3 !== 'undefined') {

    return function(dispatch) {
      // Using truffle-contract we create the authentication object.
      const authentication = contract(AuthenticationContract);
      authentication.setProvider(web3.currentProvider);
      const BTVC = contract(BitVideoCoin);
      BTVC.setProvider(web3.currentProvider);
      // Declaring this for later so we can chain functions on Authentication.
      let authenticationInstance;
      let BTVCInstance;

      // Get current ethereum wallet.
      web3.eth.getCoinbase( async (error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }
        authenticationInstance = await authentication.deployed();
        BTVCInstance = await BTVC.deployed();
        // Attempt to login user.
        try {
          const result = await authenticationInstance.login({from: coinbase});
          if(result === '0x') {
            return browserHistory.push('/signup');
          }
          const userName = web3.toUtf8(result);
          const BTVCBalance = await BTVCInstance.BalanceOf.call(coinbase);
          const BTVCTotalSupply = await BTVCInstance.totalSupply.call();
          dispatch(userLoggedIn({
            "name": userName,
            "account": coinbase,
            "BTVCBalance": BTVCBalance.toNumber()/1000000,
            "BTVCTotalSupply": BTVCTotalSupply.toNumber()/1000000
          }));
          // Used a manual redirect here as opposed to a wrapper.
          // This way, once logged in a user can still access the home page.
          var currentLocation = browserHistory.getCurrentLocation();
          if ('redirect' in currentLocation.query)
          {
            return browserHistory.push(decodeURIComponent(currentLocation.query.redirect));
          }
          return browserHistory.push('/fanplace');
        } catch(result) {
          // If error, go to signup page.
          console.error('Wallet ' + coinbase + ' does not have an account!');
          return browserHistory.push('/signup');
        }
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}

export function autoLoginUser() {
  let web3 = store.getState().web3.web3Instance;
  if (!web3 && window.web3) {
    web3 = window.web3;
  }
  // Double-check web3's status.
  if (typeof web3 !== 'undefined') {

    return function(dispatch) {
      // Using truffle-contract we create the authentication object.
      const authentication = contract(AuthenticationContract);
      authentication.setProvider(web3.currentProvider);
      const BTVC = contract(BitVideoCoin);
      BTVC.setProvider(web3.currentProvider);

      // Declaring this for later so we can chain functions on Authentication.
      let authenticationInstance;
      let BTVCInstance;

      // Get current ethereum wallet.
      web3.eth.getCoinbase( async (error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }
        authenticationInstance = await authentication.deployed();
        BTVCInstance = await BTVC.deployed();
        const result = await authenticationInstance.login({from: coinbase});
        if(result !== '0x') {
          const userName = web3.toUtf8(result);
          const BTVCBalance = await BTVCInstance.balanceOf.call(coinbase);
          const BTVCTotalSupply = await BTVCInstance.totalSupply.call();
          dispatch(userLoggedIn({
            "name": userName,
            "account": coinbase,
            "BTVCBalance": BTVCBalance.toNumber()/1000000,
            "BTVCTotalSupply": BTVCTotalSupply.toNumber()/1000000
          }));
          // Used a manual redirect here as opposed to a wrapper.
          // This way, once logged in a user can still access the home page.
        } else {
          console.error('Wallet ' + coinbase + ' does not have an account!');
        }
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}
