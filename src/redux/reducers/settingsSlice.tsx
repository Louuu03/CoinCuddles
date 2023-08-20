// src/redux/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Settings {
  lang: string;
  mode: number;
  isLoading: boolean;
}

interface UserState {
  settings: Settings;
}

const initialState: UserState = {
  settings: { lang: 'eng', mode: 0, isLoading: true },
};

const settingsSlice = createSlice({
  name: 'Settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Settings>) => {
      state.settings = action.payload;
    },
  },
});

export const { setSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
