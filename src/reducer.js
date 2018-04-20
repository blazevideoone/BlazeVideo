import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import userReducer from './reducers/userReducer';
import videosReducer from './reducers/videosReducer';
import web3Reducer from './util/web3/web3Reducer';
import dialogReducer from './reducers/dialogReducer';

const reducer = combineReducers({
  routing: routerReducer,
  user: userReducer,
  web3: web3Reducer,
  videos: videosReducer,
  dialog: dialogReducer
})

export default reducer;
