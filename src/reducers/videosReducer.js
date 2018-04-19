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
  if (action.type === 'SORT_BY_PRICE')
  {
    const _mode = action.payload;
    const _list = state.data.auctionList;
    _list.sort((v1, v2) => {
      if (v1.price < v2.price) return _mode;
      if (v1.price > v2.price) return -_mode;
      return 0
    });
    return update(state, {
      data: {auctionList: { $set: _list}}
    })
  }
  if (action.type === 'SORT_BY_VIEWCOUNT')
  {
    const _mode = action.payload;
    const _list = state.data.auctionList;
    _list.sort((v1, v2) => {
      if (v1.viewCount < v2.viewCount) return _mode;
      if (v1.viewCount > v2.viewCount) return -_mode;
      return 0
    });
    return update(state, {
      data: {auctionList: { $set: _list}}
    })
  }

  return state
}

export default videosReducer;
