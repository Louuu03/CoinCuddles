import '../styles/FirstStepPage.scss';
import Lang from '../languages';

import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
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
import { fill } from 'lodash';

function FirstStepPage(): JSX.Element {
  let lang: string = 'eng';

  const navigate = useNavigate();

  /** Stores whether the toast opens or not, and success or not. *
   * 0: closed | 1: create success | 2:create failed  | 3: succesfully joined | 4. failed to join*/
  const [toast, setToast] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<false | 0 | 1>(false);

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

  /** 
   * @param type  0: create, 1: add
   */
  async function addAccounts(coupleId: string, type: 0 | 1) {
    const accountUUIDs = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];
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
        id: accountUUIDs[0],
        idx: type === 0 ? 4 : 0,
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
        id: accountUUIDs[1],
        type: 1,
        idx: type === 0 ? 5 : 1,
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
        type: 5,
        id: accountUUIDs[2],
        idx: type === 0 ? 6 : 2,
      },
      {
        coupleId: coupleId,
        name: userInfos.user + "'s Shared account",
        owner: true,
        currentValue: 0,
        date: Date.now(),
        isGoal: true,
        isPrivate: false,
        startValue: 0,
        type: 5,
        id: accountUUIDs[2],
        idx: type === 0 ? 7 : 3,
      },
    ];
    let err = false;
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

  async function addCategories(coupleId: string) {
    const categoryUUIDs = fill(Array(15), 0);
    categoryUUIDs.forEach((category, idx) => (categoryUUIDs[idx] = uuidv4()));
    const categories = [
      {
        coupleId: coupleId,
        name: 'General',
        owner: false,
        currentValue: 0,
        isPrivate: false,
        parentId: 0,
        id: categoryUUIDs[0],
        idx: 1,
      },
      {
        coupleId: coupleId,
        name: 'Food',
        owner: false,
        currentValue: 0,
        isPrivate: false,
        id: categoryUUIDs[1],
        idx: 2,
        parentId: 0,
      },
      {
        coupleId: coupleId,
        name: 'Transport',
        owner: false,
        currentValue: 0,
        isPrivate: false,
        id: categoryUUIDs[2],
        idx: 3,
        parentId: 0,
      },
      {
        coupleId: coupleId,
        name: 'Finance',
        owner: false,
        currentValue: 0,
        isPrivate: false,
        id: categoryUUIDs[3],
        idx: 4,
        parentId: 0,
      },
      {
        coupleId: coupleId,
        name: 'Travel',
        owner: false,
        currentValue: 0,
        isPrivate: false,
        parentId: 0,
        id: categoryUUIDs[4],
        idx: 5,
      },
      {
        coupleId: coupleId,
        name: 'Utilities',
        owner: false,
        currentValue: 0,
        isPrivate: false,
        id: categoryUUIDs[5],
        parentId: 0,
        idx: 6,
      },
      {
        coupleId: coupleId,
        name: 'Shopping',
        owner: false,
        currentValue: 0,
        id: categoryUUIDs[6],
        isPrivate: false,
        parentId: 0,
        idx: 7,
      },
      {
        coupleId: coupleId,
        name: 'Personal',
        owner: false,
        currentValue: 0,
        id: categoryUUIDs[7],
        isPrivate: false,
        parentId: 0,
        idx: 8,
      },
      {
        coupleId: coupleId,
        name: 'Private',
        owner: userInfos.id,
        currentValue: 0,
        isPrivate: true,
        id: categoryUUIDs[8],
        parentId: 0,
        idx: 9,
      },
      {
        coupleId: coupleId,
        name: 'Dine Out',
        owner: false,
        currentValue: 0,
        isPrivate: false,
        parentId: categoryUUIDs[1],
        id: categoryUUIDs[9],
        idx: 10,
      },
      {
        coupleId: coupleId,
        name: 'Breakfast',
        owner: false,
        currentValue: 0,
        isPrivate: false,
        parentId: categoryUUIDs[1],
        id: categoryUUIDs[10],
        idx: 11,
      },
      {
        coupleId: coupleId,
        name: 'Lunch',
        owner: false,
        currentValue: 0,
        isPrivate: false,
        parentId: categoryUUIDs[1],
        id: categoryUUIDs[11],
        idx: 12,
      },
      {
        coupleId: coupleId,
        name: 'Dinner',
        owner: false,
        currentValue: 0,
        isPrivate: false,
        parentId: categoryUUIDs[1],
        id: categoryUUIDs[12],
        idx: 13,
      },
      {
        coupleId: coupleId,
        name: 'Clothes',
        owner: false,
        currentValue: 0,
        isPrivate: false,
        parentId: categoryUUIDs[6],
        id: categoryUUIDs[13],
        idx: 14,
      },
      {
        coupleId: coupleId,
        name: 'Hobbies',
        owner: false,
        currentValue: 0,
        isPrivate: false,
        parentId: 7,
        id: categoryUUIDs[14],
        idx: 15,
      },
    ];
    let err = false;
    for (let idx = 0; idx < categories.length && !err; idx++) {
      const id = categoryUUIDs[idx] || uuidv4();
      try {
        await setDoc(doc(db, 'categories', id), categories[idx]);
      } catch (error) {
        setToast(2);
        err = true;
      }
    }
    return !err;
  }

  async function addTags(coupleId: string) {
    const tagUUIDs = [uuidv4(),uuidv4()]
    const tags = [
      {
        coupleId,
        name:userInfos.user+"'s Tag",
        id:tagUUIDs[0]
      },
      {
        coupleId,
        id:tagUUIDs[1],
        name:userInfos.user+"'s Second Tag",
      }
    ];
    let err = false;
    for (let idx = 0; idx < tagUUIDs.length && !err; idx++) {
      const id = tagUUIDs[idx] || uuidv4();
      try {
        await setDoc(doc(db, 'tags', id), tags[idx]);
      } catch (error) {
        setToast(2);
        err = true;
      }
    }
    return !err;
  }

  /** Function to handle creation of coupleId*/
  const handleCreate = async (event: React.SyntheticEvent<Element, Event>) => {
    if (!isLoading) {
      setIsLoading(1);
      const coupleId = uuidv4();
      //add data
      try {
        await addAccounts(coupleId, 0);
        await addCategories(coupleId);
        await addTags(coupleId);

        await updateDoc(doc(db, 'users', userInfos.id), {
          coupleId: coupleId,
        });

        await setDoc(doc(db, 'couples', coupleId), {
          members: [userInfos.id, null],
          currency: 'twd',
        });
        setToast(1);

        setTimeout(() => {
          setUser(userInfos.user, userInfos.id, coupleId, 1);
          dispatch(setSettings({ ...settings, isLoading: true }));
          navigate('/Home');
        }, 1250);
      } catch (error) {
        setToast(2);
        setIsLoading(false);
      }
    }
  };

  /** Function to handle next (for coupleId) */
  const handleNext: SubmitHandler<{ coupleId: string }> = (data: {
    coupleId: string;
  }) => {
    if (!isLoading) {
      setIsLoading(0);
      getDoc(doc(db, 'couples', data.coupleId))
        .then(async (res) => {
          const memberLength = res.data()?.members.length;
          if (memberLength === 1) {
            const partnerId = res.data()?.members[0];
            const categoryId = uuidv4();
            try {
              await setDoc(doc(db, 'categories', categoryId), {
                coupleId: data.coupleId,
                name: 'Private',
                owner: userInfos.id,
                currentValue: 0,
                isPrivate: true,
                id: categoryId,
                parentId: 0,
                idx: 0,
              });
              await addAccounts(data.coupleId, 1);
        await addTags(data.coupleId);
              await updateDoc(doc(db, 'couples', data.coupleId), {
                members: [partnerId, userInfos.id],
              });

              await updateDoc(doc(db, 'users', userInfos.id), {
                coupleId: data.coupleId,
                partnerId,
                tutorial: 2,
              });

              await updateDoc(doc(db, 'users', partnerId), {
                partnerId: userInfos.id,
                tutorial: 0,
              });

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
            setIsLoading(false);
          }
        })
        .catch(() => {
          setIsLoading(false);
          setToast(4);
        });
    }
  };

  /** Function to close toast */
  const handleToastClose = () => {
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
                {isLoading === 0 ? (
                  <CircularProgress
                    size={20}
                    color="inherit"
                    className="Progress"
                  />
                ) : (
                  <StartIcon />
                )}
              </Button>
            </Box>

            <h3>Or</h3>
            <Button className="CreateBtn" onClick={handleCreate}>
              {isLoading === 1 ? (
                <Box>
                  <CircularProgress
                    size={20}
                    color="inherit"
                    className="Progress"
                  />
                  Creating...
                </Box>
              ) : (
                'Create new Couple Id'
              )}
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
