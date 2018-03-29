import update from 'immutability-helper';
const initialState = {
  data: {
    totalSupply: 0,
    myList: []
  }
}

const videosReducer = (state = initialState, action) => {
  if (action.type === 'LOAD_VIDEO_LIST')
  {
    return update(state, {
      data: { $set: action.payload }
    })
  }
  return state
}

export default videosReducer;
