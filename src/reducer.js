import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import userReducer from './reducers/userReducer';
import videosReducer from './reducers/videosReducer';
import web3Reducer from './util/web3/web3Reducer';

const reducer = combineReducers({
  routing: routerReducer,
  user: userReducer,
  web3: web3Reducer,
  videos: videosReducer
})

export default reducer;
