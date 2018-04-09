import update from 'immutability-helper';
const initialState = {
  buyVideo: {
    modalShow: false,
    videoData: null
  }
}

const dialogReducer = (state = initialState, action) => {
  if (action.type === 'HIDE_BUY_VIDEO_DIALOG')
  {
    return update(state, {
      buyVideo: {
        modalShow: { $set: false }
      }
    })
  }
  if (action.type === 'SHOW_BUY_VIDEO_DIALOG')
  {
    return update(state, {
      buyVideo: {
        modalShow: { $set: true },
        videoData: { $set: action.payload }
      }
    })
  }
  return state
}

export default dialogReducer;
