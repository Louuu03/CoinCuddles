import React, { useEffect } from 'react';
import AuthPage from './AuthPage';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfos } from '../redux/reducers/userSlice';
import LoadingPage from './LoadingPage';
import { setSettings } from '../redux/reducers/settingsSlice';
import { useNavigate } from 'react-router-dom';

function App(): JSX.Element {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const userInfos = useSelector(
    (state: {
      userInfos: {
        userInfos: {
          user: string;
          id: string;
          coupleId: string | null;
          tutorial: 0 | 1 | 2;
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

  useEffect(() => {
    userInfos.user &&
      userInfos.id &&
      (!userInfos.coupleId ? navigate('/PairUp') : navigate('/Home'));
  }, [userInfos]);

  return (
    <Box className="App FullPageBox">
      {settings.isLoading ? <LoadingPage /> : <AuthPage />}
    </Box>
  );
}

export default App;
