import React, { useEffect } from 'react';
import AuthPage from './AuthPage';
import HomePage from './HomePage';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfos } from '../redux/reducers/userSlice';
import LoadingPage from './LoadingPage';
import { setSettings } from '../redux/reducers/settingsSlice';

function App(): JSX.Element {
  const dispatch = useDispatch();
  const userInfos = useSelector(
    (state: {
      userInfos: {
        userInfos: {
          user: string;
          id: string;
          coupleId: string | null;
        };
      };
    }) => state.userInfos.userInfos,
  );
  const settings = useSelector(
    (state: {
      settings: {
        settings: { lang: string; mode: number; isLoading: boolean };
      };
    }) => state.settings.settings,
  );

  //check local storage if the user is logged in

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const user = JSON.parse(storedUser);
      dispatch(setUserInfos(user));
    }
    setTimeout(
      () => dispatch(setSettings({ ...settings, isLoading: false })),
      750,
    );
  }, []);

  return (
    <Box className="App FullPageBox">
      {settings.isLoading ? (
        <LoadingPage />
      ) : userInfos.user && userInfos.id ? (
        <HomePage />
      ) : (
        <AuthPage />
      )}
    </Box>
  );
}

export default App;
