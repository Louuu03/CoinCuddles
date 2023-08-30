import '../styles/HomePage.scss';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setSettings } from '../redux/reducers/settingsSlice';
import { setUserInfos } from '../redux/reducers/userSlice';
import firebaseConfig from '../firebaseConfig';
import { initializeApp } from 'firebase/app';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { Outlet, useNavigate } from 'react-router-dom';
import { split, last } from 'lodash';
import LoadingPage from './LoadingPage';

function HomePage(): JSX.Element {
  const [isDlgOpen, setIsDlgOpen] = useState<boolean>(false);
  const [isToast, setIsToast] = useState<boolean>(false);
  const [theme, setTheme] = useState<string>('Home');

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

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

  const handleDlgClose = (event: React.SyntheticEvent | Event) => {
    setIsDlgOpen(false);
    dispatch(setUserInfos({ ...userInfos, tutorial: 0 }));
    localStorage.setItem('user', JSON.stringify({ ...userInfos, tutorial: 0 }));
    updateDoc(doc(db, 'users', userInfos.id), {
      tutorial: 0,
    });
  };

  useEffect(() => {
    if (!!userInfos.coupleId) {
      setTimeout(() => {
        dispatch(setSettings({ ...settings, isLoading: false }));
        userInfos.tutorial !== 0 && setIsDlgOpen(true);
      }, 750);
    }
  }, [userInfos.coupleId]);
  useEffect(() => {
    !userInfos.user && navigate('/');
  }, []);

  useEffect(() => {
    const hrl = last(split(window.location.href, '/'));
    setTheme(hrl);
  }, [window.location.href]);
  return (
    <Box className="HomePage FullPageBox">
      <Box className={`MainTheme ${theme}`}>
        <img
          className="Icon"
          src={require('../assets/Image/menu.png')}
          alt="Icon"
        />
        <Box className="Display">
          <h1>Coin Cuddles</h1>
          <Outlet />
        </Box>
        {isDlgOpen && userInfos.tutorial === 1 ? (
          <Dialog
            className="TutorialDlg"
            onClose={handleDlgClose}
            open={isDlgOpen}
          >
            <DialogTitle>Share your Couple Id</DialogTitle>
            <DialogContent>
              <DialogContentText>{userInfos.coupleId}</DialogContentText>
              <Button
                className="ClickBtn"
                onClick={() => {
                  navigator.clipboard.writeText(userInfos.coupleId || 'error');
                  setIsToast(true);
                }}
              >
                Click Here To Copy
              </Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDlgClose}>Close</Button>
            </DialogActions>
            <Snackbar
              open={isToast}
              autoHideDuration={1500}
              onClose={handleDlgClose}
            >
              <Alert severity={'success'} sx={{ width: '100%' }}>
                Copied!
              </Alert>
            </Snackbar>
          </Dialog>
        ) : (
          <Dialog onClose={handleDlgClose} open={isDlgOpen}>
            <DialogTitle>Welcome!</DialogTitle>
            <DialogContent>
              <DialogContentText>You're now in a Couple!</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDlgClose}>Close</Button>
            </DialogActions>
            <Snackbar
              open={isToast}
              autoHideDuration={1500}
              onClose={handleDlgClose}
            >
              <Alert severity={'success'} sx={{ width: '100%' }}>
                Copied!
              </Alert>
            </Snackbar>
          </Dialog>
        )}
      </Box>
      {settings.isLoading && <LoadingPage />}
    </Box>
  );
}

export default HomePage;
