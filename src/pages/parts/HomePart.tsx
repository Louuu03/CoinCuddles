import '../../styles/parts/HomePart.scss';

import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';

function HomePart(): JSX.Element {
  return (
    <Box className="HomePart">
      <Box className="Navigation">
        <Link to={'/Home/Account'}>
          <Box className="Box A">Account</Box>
        </Link>
        <Link to={'/Home/Budget'}>
          <Box className="Box B">Budget</Box>
        </Link>
        <Link to={'/Home/Transactions'}>
          <Box className="Box T">TXN</Box>
        </Link>
        <Link to={'/Home/CategoriesAndTags'}>
          <Box className="Box C">Category /Tag</Box>
        </Link>
      </Box>
    </Box>
  );
}

export default HomePart;
