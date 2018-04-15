import update from 'immutability-helper';
const initialState = {
  data: {
    totalSupply: 0,
    auctionList: []
  }
}

const videosReducer = (state = initialState, action) => {
  if (action.type === 'LOAD_VIDEO_LIST')
  {
    return update(state, {
      data: { auctionList: { $set: action.payload } }
    })
  }
  return state
}

export default videosReducer;
