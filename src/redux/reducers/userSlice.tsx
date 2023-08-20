// src/redux/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserInfos {
  user: string | null;
  id: string | null;
  coupleId: string | null;
}

interface UserState {
  userInfos: UserInfos;
}

const initialState: UserState = {
  userInfos: { user: null, id: null, coupleId: null },
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
