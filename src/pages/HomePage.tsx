import '../styles/HomePage.scss';

import React, {useEffect} from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import FirstStepPage from './FirstStepPage';

function HomePage(): JSX.Element {
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

  return (
    <Box className="FullPageBox">
      {!!userInfos.coupleId ? (
        <Box className="HomePage">
          <Box className="Display"></Box>
        </Box>
      ) : (
        <FirstStepPage />
      )}
    </Box>
  );
}

export default HomePage;
