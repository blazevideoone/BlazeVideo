import update from 'immutability-helper';
const initialState = {
  data: null,
  userVideos: null
}

const userReducer = (state = initialState, action) => {
  if (action.type === 'USER_LOGGED_IN' || action.type === 'USER_UPDATED')
  {
    return update(state, {
      data: { $set: action.payload }
    })
  }

  if (action.type === 'USER_LOGGED_OUT')
  {
    return update(state, {
      data: { $set: null }
    })
  }

  if (action.type === 'LOAD_USER_VIDEOS')
  {
    return update(state, {
      userVideos: { $set: action.payload }
    })
  }

  return state
}

export default userReducer
