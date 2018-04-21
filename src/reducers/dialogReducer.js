import update from 'immutability-helper';
const initialState = {
  buyVideo: {
    modalShow: false,
    videoData: null
  },
  sellVideo: {
    modalShow: false,
    videoData: null
  },
  TX: {
    modalShow: false,
    txData: null
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
      },
      sellVideo: {
        modalShow: { $set: false }
      },
      TX: {
        modalShow: { $set: false }
      }
    })
  }
  if (action.type === 'HIDE_SELL_VIDEO_DIALOG')
  {
    return update(state, {
      sellVideo: {
        modalShow: { $set: false }
      }
    })
  }
  if (action.type === 'SHOW_SELL_VIDEO_DIALOG')
  {
    return update(state, {
      sellVideo: {
        modalShow: { $set: true },
        videoData: { $set: action.payload }
      },
      buyVideo: {
        modalShow: { $set: false }
      },
      TX: {
        modalShow: { $set: false }
      }
    })
  }
  if (action.type === 'HIDE_TX_DIALOG')
  {
    return update(state, {
      TX: {
        modalShow: { $set: false }
      }
    })
  }
  if (action.type === 'SHOW_TX_DIALOG')
  {
    return update(state, {
      TX: {
        modalShow: { $set: true },
        txData: { $set: action.payload }
      },
      sellVideo: {
        modalShow: { $set: false }
      },
      buyVideo: {
        modalShow: { $set: false }
      }
    })
  }
  return state
}

export default dialogReducer;
