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
  SpeedDial,
  SpeedDialAction,
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
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ControlPointDuplicateIcon from '@mui/icons-material/ControlPointDuplicate';
import CloseIcon from '@mui/icons-material/Close';

function HomePage(): JSX.Element {
  const [isDlgOpen, setIsDlgOpen] = useState<boolean>(false);
  const [isToast, setIsToast] = useState<boolean>(false);
  const [theme, setTheme] = useState<string>('Home');
  const [isList, setIsList] = useState<boolean>(false);

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

  const actions = [
    //  { icon: <FileCopyIcon />, name: 'Copy' },
    { icon: <ControlPointDuplicateIcon />, name: 'Add Transaction', id: 0 },
    { icon: <AccountBalanceIcon />, name: 'Account', id: 1 },
    { icon: <HomeIcon />, name: 'Home', id: 2 },
  ];

  const handleSpeedDial = (value: number) => {
    value === 0 && navigate('/Home/AddTransactions');
    value === 1 && navigate('/Home/Account');
    value === 2 && navigate('/Home');
  };

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
        <Box className={`HidedList ${isList && 'ListOpen'}`}>
          {!isList ? (
            <img
              className="Icon"
              src={require('../assets/Image/menu.png')}
              alt="Icon"
              onClick={() => setIsList(true)}
            />
          ) : (
            <CloseIcon
              className="Icon"
              fontSize="large"
              onClick={() => setIsList(false)}
            />
          )}
          <ul className="Nav">
            <li>Home</li>
            <li>Account</li>
            <li>
              Daily Limit{' '}
              <img
                className="ComingSoon"
                src={require('../assets/Image/comingsoon.png')}
                alt="Icon"
              />
            </li>
            <li>
              Split Book
              <img
                className="ComingSoon"
                src={require('../assets/Image/comingsoon.png')}
                alt="Icon"
              />
            </li>
            <li>Transactions</li>
            <li>Category/Tag</li>
            <li>
              Budget
              <img
                className="ComingSoon"
                src={require('../assets/Image/comingsoon.png')}
                alt="Icon"
              />
            </li>
            <li>
              Goals
              <img
                className="ComingSoon"
                src={require('../assets/Image/comingsoon.png')}
                alt="Icon"
              />
            </li>
            <li>
              Subscriptions
              <img
                className="ComingSoon"
                src={require('../assets/Image/comingsoon.png')}
                alt="Icon"
              />
            </li>
            <li>
              WhishList
              <img
                className="ComingSoon"
                src={require('../assets/Image/comingsoon.png')}
                alt="Icon"
              />
            </li>
            <li>
              Activities
              <img
                className="ComingSoon"
                src={require('../assets/Image/comingsoon.png')}
                alt="Icon"
              />
            </li>
          </ul>
          <Box className="Settings">
            <Box className="User">
              <img
                className="UserIcon"
                src={require('../assets/Image/user.png')}
                alt="Icon"
              />
              Account
            </Box>
            <Box>
              {' '}
              <img
                className="SettingIcon"
                src={require('../assets/Image/setting.png')}
                alt="Icon"
              />
            </Box>
          </Box>
        </Box>

        <Box className={`Display ${isList && 'ListOpen'}`}>
          <Box className="Container">
            <h1>Coin Cuddles</h1>
            <Outlet />
          </Box>
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
        {theme !== 'AddTransactions' && (
          <SpeedDial
            ariaLabel="SpeedDial"
            direction="left"
            sx={{ position: 'absolute', bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
            className={`SpeedDial ${isList && 'ListOpen'}`}
          >
            {actions.map(
              (action) =>
                !(theme == 'Home' && action.id == 2) && (
                  <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={() => handleSpeedDial(action.id)}
                  />
                ),
            )}
          </SpeedDial>
        )}
      </Box>
      {settings.isLoading && <LoadingPage />}
    </Box>
  );
}

export default HomePage;
