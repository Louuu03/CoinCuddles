import '../styles/FirstStepPage.scss';
import Lang from '../languages';

import React, {useEffect} from 'react';
import { Box, TextField, Button } from '@mui/material';
import StartIcon from '@mui/icons-material/Start';
import { useForm, SubmitHandler } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfos } from '../redux/reducers/userSlice';
import { doc, setDoc, getFirestore, updateDoc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebaseConfig';


function FirstStepPage(): JSX.Element {
  let lang: string = 'eng';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ coupleId: string }>();

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const dispatch = useDispatch();
  const setUser = (user: string, id: string, coupleId: string | null) => {
    dispatch(setUserInfos({ user, id, coupleId }));
    localStorage.setItem('user', JSON.stringify({ user, id, coupleId }));
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

  /** Function to handle creation of coupleId*/
  const handleCreate = (event: React.SyntheticEvent<Element, Event>) => {
    const coupleId = uuidv4();
    //Update couples data
    setDoc(doc(db, 'couples', coupleId),{
      category: 
      {
        [uuidv4()]:{
          name:'general', parentId: 0
        }
      },
      settings:{
        users:{
          members:[userInfos.id]
        }
      },
      accounts:{
        [uuidv4()]:{
          name:userInfos.user+"'s account",
          owner: userInfos.id,
          currentValue:0,
          date:Date.now(), 
          isGoal:false,
          startValue:0
        }
      },
      accountType:{
        [uuidv4()]:{
          name:'Normal'
        }
      }

    } );
    updateDoc(doc(db, 'users', userInfos.id), {
      coupleId: coupleId,
    });
    localStorage.setItem('user', JSON.stringify({ user:userInfos.user, id:userInfos.id, coupleId }));
    setUser(userInfos.user, userInfos.id,coupleId);
  };

  /** Function to handle next (for coupleId) */
  const handleNext: SubmitHandler<{ coupleId: string }> = (data: {
    coupleId: string;
  }) => {
   getDoc(doc(db, 'couples', data.coupleId))
   .then((res)=>{
   const partnerId=res.data()?.settings.users.members[0];

   updateDoc(doc(db, 'couples', data.coupleId), {
    settings: {user:{member:[partnerId, userInfos.id]}},
  });

  updateDoc(doc(db, 'users', userInfos.id), {
    coupleId: data.coupleId,
    partnerId
    });
  updateDoc(doc(db, 'users',partnerId), {
    partnerId:userInfos.id
  });
  
  localStorage.setItem('user', JSON.stringify({ user:userInfos.user, id:userInfos.id, coupleId:data.coupleId }));
  setUser(userInfos.user, userInfos.id,data.coupleId);
   }

   )

  };

  return (
    <Box className="FirstStepPage FullPageBox">
      {
        <Box className="Main">
          <h1>Coin Cuddles</h1>
          <Box className="Display">
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
        </Box>
      }
    </Box>
  );
}

export default FirstStepPage;
