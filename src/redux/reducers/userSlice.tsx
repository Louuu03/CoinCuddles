// src/redux/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserInfos {
  user: string | null;
  id: string | null;
  coupleId: string | null;
  tutorial: 0 | 1 | 2; //0:none, 1:newly alone in a couple, 2 newly add to a couple
}

interface UserState {
  userInfos: UserInfos;
}

const initialState: UserState = {
  userInfos: { user: null, id: null, coupleId: null, tutorial: 0 },
};

const userSlice = createSlice({
  name: 'userInfos',
  initialState,
  reducers: {
    setUserInfos: (state, action: PayloadAction<UserInfos>) => {
      state.userInfos = action.payload;
    },
  },
});

export const { setUserInfos } = userSlice.actions;

export default userSlice.reducer;
