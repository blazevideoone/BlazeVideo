import update from 'immutability-helper';
const initialState = {
  data: null
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

  return state
}

export default userReducer
