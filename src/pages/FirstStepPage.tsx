import '../styles/FirstStepPage.scss';
import Lang from '../languages';

import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Snackbar, Alert } from '@mui/material';
import StartIcon from '@mui/icons-material/Start';
import { useForm, SubmitHandler } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfos } from '../redux/reducers/userSlice';
import { setSettings } from '../redux/reducers/settingsSlice';
import {
  doc,
  setDoc,
  getFirestore,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { findKey, keys } from 'lodash';

function FirstStepPage(): JSX.Element {
  let lang: string = 'eng';

  const navigate = useNavigate();

  /** Stores whether the toast opens or not, and success or not. *
   * 0: closed | 1: create success | 2:create failed  | 3: succesfully joined | 4. failed to join*/
  const [toast, setToast] = useState<number>(0);

  const toastTxt = {
    1: 'Successfully Created.',
    2: 'Creation Failed.',
    3: 'Succesfully Joined.',
    4: 'Failed to Join.',
    5: 'The couple you want to join has reached its maximum members(2).',
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ coupleId: string }>();

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const dispatch = useDispatch();
  const setUser = (
    user: string,
    id: string,
    coupleId: string | null,
    tutorial: 0 | 1 | 2,
  ) => {
    dispatch(setUserInfos({ user, id, coupleId, tutorial }));
    localStorage.setItem(
      'user',
      JSON.stringify({ user, id, coupleId, tutorial }),
    );
  };
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

  async function addAccounts(coupleId: string) {
    const accountUUIDs = [uuidv4(), uuidv4(), uuidv4()];
    const accounts = [
      {
        coupleId: coupleId,
        name: userInfos.user + "'s Normal account",
        owner: userInfos.id,
        currentValue: 0,
        date: Date.now(),
        isGoal: false,
        startValue: 0,
        isPrivate: false,
        type: 1,
      },
      {
        coupleId: coupleId,
        name: userInfos.user + "'s Private account",
        owner: userInfos.id,
        currentValue: 0,
        date: Date.now(),
        isGoal: false,
        startValue: 0,
        isPrivate: true,
        type: 1,
      },
      {
        coupleId: coupleId,
        name: userInfos.user + "'s Goal account",
        owner: userInfos.id,
        currentValue: 0,
        date: Date.now(),
        isGoal: true,
        isPrivate: false,
        startValue: 0,
        type: 1,
      },
    ];
    let err = false;
    console.log('huu');

    for (let idx = 0; idx < accountUUIDs.length && !err; idx++) {
      const id = accountUUIDs[idx];
      try {
        await setDoc(doc(db, 'accounts', id), accounts[idx]);
      } catch (error) {
        setToast(2);
        err = true;
      }
    }
    return !err;
  }

  /** Function to handle creation of coupleId*/
  const handleCreate = async (event: React.SyntheticEvent<Element, Event>) => {
    const coupleId = uuidv4();

    //add data
    (await addAccounts(coupleId)) &&
      updateDoc(doc(db, 'users', userInfos.id), {
        coupleId: coupleId,
      })
        .then(() =>
          setDoc(doc(db, 'couples', coupleId), {
            members: [userInfos.id, null],
            currency: 'twd',
          }).then(() => {
            setToast(1);
            setTimeout(() => {
              setUser(userInfos.user, userInfos.id, coupleId, 1);
              dispatch(setSettings({ ...settings, isLoading: true }));
              navigate('/Home');
            }, 1250);
          }),
        )
        .catch(() => setToast(2));
  };

  /** Function to handle next (for coupleId) */
  const handleNext: SubmitHandler<{ coupleId: string }> = (data: {
    coupleId: string;
  }) => {
    getDoc(doc(db, 'couples', data.coupleId))
      .then(async (res) => {
        const memberLength = res.data()?.members.length;
        if (memberLength === 1) {
          const partnerId = res.data()?.members[0];
          console.log('try');
          try {
            await addAccounts(data.coupleId);
            console.log('1');
            await updateDoc(doc(db, 'couples', data.coupleId), {
              members: [partnerId, userInfos.id],
            });
            console.log('2');

            await updateDoc(doc(db, 'users', userInfos.id), {
              coupleId: data.coupleId,
              partnerId,
              tutorial: 2,
            });
            console.log('3');

            await updateDoc(doc(db, 'users', partnerId), {
              partnerId: userInfos.id,
              tutorial: 0,
            });
            console.log('4');

            setToast(3);
            setTimeout(() => {
              dispatch(setSettings({ ...settings, isLoading: true }));
              setUser(userInfos.user, userInfos.id, data.coupleId, 2);
              navigate('/Home');
            }, 1250);
          } catch (error) {
            setToast(4);
          }
        } else {
          setToast(5);
        }
      })
      .catch(() => setToast(4));
  };

  /** Function to close toast */
  const handleToastClose = (
    event: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    setToast(0);
  };

  useEffect(() => {
    !userInfos.user && navigate('/');
  }, []);

  return (
    <Box className="FirstStepPage FullPageBox">
      {
        <Box className="Main">
          <h1>Coin Cuddles</h1>
          <Box className="Display">
            <h2>Hi, {userInfos.user}</h2>
            <h2> Have you already partnered up with someone using the app?</h2>
            <Box className="InputField">
              <TextField
                className="input"
                required
                label="Couple Id"
                error={!!errors.coupleId}
                helperText={errors.coupleId?.message}
                type="text"
                {...register('coupleId', {
                  required: Lang.errorMsg.required[lang],
                })}
              />
              <Button className="NextBtn" onClick={handleSubmit(handleNext)}>
                <StartIcon />
              </Button>
            </Box>

            <h3>Or</h3>
            <Button className="CreateBtn" onClick={handleCreate}>
              Create new Couple Id
            </Button>
          </Box>
          <Snackbar
            open={toast !== 0}
            autoHideDuration={1500}
            onClose={handleToastClose}
          >
            <Alert
              severity={toast === 1 || toast === 3 ? 'success' : 'error'}
              sx={{ width: '100%' }}
            >
              {toastTxt[toast]}
            </Alert>
          </Snackbar>
        </Box>
      }
    </Box>
  );
}

export default FirstStepPage;
