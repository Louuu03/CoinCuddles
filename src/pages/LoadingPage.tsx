import '../styles/HomePage.scss';

import React from 'react';
import { Box } from '@mui/material';

function LoadingPage(): JSX.Element {
  return (
    <Box className="LoadingPage FullPageBox">
      <img
        className="Icon"
        src={require('../assets/Image/Icon.png')}
        alt="Icon"
      />
      <Box className="Cover"></Box>
    </Box>
  );
}

export default LoadingPage;
