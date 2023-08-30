import React, { useEffect, useState } from 'react';

import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  getFirestore,
  where,
  collection,
  getDocs,
  query,
  and,
  or,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../../firebaseConfig';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty, find, map } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { setSettings } from '../../redux/reducers/settingsSlice';
import Lang from '../../languages';

interface AccountData {
  coupleId: string;
  name: string;
  owner: string;
  currentValue: number;
  date: number;
  isGoal: boolean;
  startValue: number;
  isPrivate: boolean;
  type: number;
}

function AccountPart(): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [accounts, setAccounts] = useState<object>({});
  const [total, setTotal] = useState<object>([0,0,0,0,0]);

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const userInfos = useSelector(
    (state: {
      userInfos: {
        userInfos: {
          user: string;
          id: string;
          coupleId: string;
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

  useEffect(() => {
    const q = query(
      collection(db, 'accounts'),
      and(
        where('coupleId', '==', userInfos.coupleId),
        or(
          where('isPrivate', '==', false),
          and(
            where('isPrivate', '==', true),
            where('owner', '==', userInfos.id),
          ),
        ),
      ),
    );

    !userInfos.id && navigate('/Home');
    isEmpty(accounts) &&
      dispatch(setSettings({ ...settings, isLoading: true }));
    userInfos.coupleId &&
      getDocs(q)
        .then((res) => {
          const docs: AccountData[] = [];
          res.forEach((doc) => {
            // Handle each retrieved document here
            const d = doc.data() as AccountData;
            docs.push(d);
          });
          setAccounts(docs);
          let totalAmount=[0,0,0,0,0];
          map(docs,(d,idx)=>{
            totalAmount[d.type-1]+=d.currentValue;
          })
          setTotal(totalAmount);
        })
        .catch(() => dispatch(setSettings({ ...settings, isLoading: false })));
    setTimeout(
      () => dispatch(setSettings({ ...settings, isLoading: false })),
      500,
    );
    //Toast
  }, [userInfos]);
  return (
    <Box className="AccountPart FullPageBox">
      {!isEmpty(accounts) ? (
        map(Lang.accountType.eng, (type, typeIdx) => {
          return (
            !isEmpty(find(accounts, ['type', typeIdx + 1])) && (
              <Box className={`Accordion ${'A' + typeIdx}`} key={'A' + typeIdx}>
                <Accordion className="AccordionBox">
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} className='AccordionTitle'>
                    <Box className='TitleBox'>
                    <Box>{type}</Box>
                    <Box>{total[typeIdx]}</Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {map(accounts, (account, idx) => {
                      return (
                        account.type === typeIdx + 1 && (
                          <Box className="Detail" key={idx}>
                            <Box>{account.name}</Box>
                            <Box>{account.currentValue}</Box>
                          </Box>
                        )
                      );
                    })}
                  </AccordionDetails>
                </Accordion>
              </Box>
            )
          );
        })
      ) : (
        <Box>NoData</Box>
      )}
    </Box>
  );
}

export default AccountPart;
