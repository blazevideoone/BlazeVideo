import update from 'immutability-helper';
const initialState = {
  web3Instance: null
}

const web3Reducer = (state = initialState, action) => {
  if (action.type === 'WEB3_INITIALIZED')
  {
    return update(state, {
      web3Instance: { $set: action.payload.web3Instance }
    })
  }

  return state
}

export default web3Reducer
