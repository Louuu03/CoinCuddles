// src/redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import settingsReducer from './settingsSlice';

const rootReducer = combineReducers({
  userInfos: userReducer,
  settings: settingsReducer,
});

export default rootReducer;
