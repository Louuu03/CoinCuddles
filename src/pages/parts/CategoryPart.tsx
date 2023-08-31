import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Tab,
  Tabs,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  and,
  collection,
  getDocs,
  getFirestore,
  or,
  query,
  where,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../../firebaseConfig';
import { useSelector } from 'react-redux';
import { isEmpty, find, map } from 'lodash';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface CategoryData {
  coupleId: string;
  name: string;
  owner: string;
  currentValue: number;
  isPrivate: boolean;
  parentId: string;
  id: string;
  idx: number;
}

function CategoryPart(): JSX.Element {
  /* 0:Categories | 1: Tags */
  const [tab, setTab] = useState<number>(0);
  const [categories, setCategories] = useState<CategoryData[]>();

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

  const theme = createTheme({
    palette: {
      primary: {
        main: '#ffa500',
      },
    },
  });

  useEffect(() => {
    const q = query(
      collection(db, 'categories'),
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
    userInfos.coupleId &&
      getDocs(q).then((res) => {
        const docs: CategoryData[] = [];
        res.forEach((doc) => {
          // Handle each retrieved document here
          const d = doc.data() as CategoryData;
          docs.push(d);
        });
        setCategories(docs);
      });
  }, []);

  return (
    <Box className="CategoryPart FullPageBox">
      <ThemeProvider theme={theme}>
        <Tabs
          className="Tab"
          value={tab}
          onChange={(e, v) => setTab(v)}
          variant="fullWidth"
          indicatorColor="primary"
        >
          <Tab label="Categories" />
          <Tab label="Tags" />
        </Tabs>
      </ThemeProvider>
      {tab === 0 ? (
        <Box className="Category">
          {map(categories, (category, cIdx) => {
            return (
              category.parentId === 0 && (
                <Box className={`Accordion ${'A' + cIdx}`} key={'A' + cIdx}>
                  <Accordion className="AccordionBox">
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      className="AccordionTitle"
                    >
                      <Box className="TitleBox">
                        <Box>{category.name}</Box>
                        <Box className="TitleTotal">
                          {category.currentValue}
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {map(categories, (subCategory, idx) => {
                        return (
                          subCategory.parentId === category.id && (
                            <Box className="Detail" key={idx}>
                              <Box className="DName">{subCategory.name}</Box>
                              <Box>{subCategory.currentValue}</Box>
                            </Box>
                          )
                        );
                      })}
                      <Box className="Detail">
                        <Box>Total</Box>
                        <Box>{category.currentValue}</Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              )
            );
          })}
        </Box>
      ) : (
        <Box className="Tag">Tag</Box>
      )}
    </Box>
  );
}

export default CategoryPart;
