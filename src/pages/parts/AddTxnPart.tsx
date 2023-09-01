import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import '../../styles/parts/AddTxnPart.scss';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  Box,
  Button,
  ButtonGroup,
  TextField,
  MenuItem,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Input,
  InputAdornment,
  Switch,
  Slider,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import Lang from '../../languages';
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
import { isEmpty, orderBy, map, remove, last } from 'lodash';
import Select, { SelectChangeEvent } from '@mui/material/Select';

interface FormData {
  type: 0 | 1 | 2;
  account: string | null;
  category: string | null;
  date: string | null;
  time: string | null;
  tags: string[] | null;
  amount: number;
  details: string | null;
  repeat: boolean;
  rTo: string | null;
  tInterval: number | null;
  split: boolean;
  sAmount: number | null;
  transferTo: string | null;
  transferFrom: string | null;
}
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
  id: string;
  idx: number;
}

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


function AddTxnPart(): JSX.Element {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const now = DateTime.now();

  const theme = createTheme({
    palette: {
      secondary: {
        main: '#fff',
      },
    },
  });

  const [type, setType] = useState<number>(0);
  const [textLength, setTextLength] = useState<number>(0);
  const [optionData, setOptionData] = useState<{
    accounts: AccountData[] | [];
    categories: CategoryData[] | undefined;
  }>({ accounts: [], categories: [] });
  const [formData, setFormData] = useState<FormData>({
    type: 0,
    account: '',
    category: '',
    date: now.toISODate(),
    time: now.toFormat('T'),
    tags: ['0'],
    amount: 0,
    details: null,
    repeat: false,
    rTo: null,
    tInterval: null,
    split: false,
    sAmount: null,
    transferTo: null,
    transferFrom: null,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

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

  let categories: CategoryData[] = [];
  async function getData() {
    let accounts: AccountData[] = [];
    const categoryQ = query(
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
    const accountQ = query(
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
    try {
      if (userInfos.coupleId) {
        const categorySnapshot = await getDocs(categoryQ);
        const docsC: CategoryData[] = [];

        categorySnapshot.forEach((docC) => {
          const d = docC.data() as CategoryData;
          docsC.push(d);
        });

        const accountSnapshot = await getDocs(accountQ);
        const docs: AccountData[] = [];

        accountSnapshot.forEach((doc) => {
          const d = doc.data() as AccountData;
          docs.push(d);
        });

        categories = orderBy(docsC, ['idx'], ['asc']);
        accounts = orderBy(docs, ['idx'], ['asc']);

        setOptionData({ ...optionData, accounts, categories });
      }
    } catch (error) {
      // Handle the error as needed
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return !isEmpty(optionData.accounts) ? (
    <Box
      className={`AddTxnPart FullPageBox ${
        type === 0 ? 'Expense' : type === 1 ? 'Income' : 'Transfer'
      }`}
    >
      <ThemeProvider theme={theme}>
      <Box className="TypeBox">
        <ButtonGroup className="ButtonGroup" variant="contained">
          <Button className="E" onClick={() => setType(0)}>
            Expense
          </Button>
          <Button className="I" onClick={() => setType(1)}>
            Income
          </Button>
          <Button className="T" onClick={() => setType(2)}>
            Transfer
          </Button>
        </ButtonGroup>
      </Box>
      <Box className="MainBox">
        <Box className="Left">
          <TextField
            className="SelectA InputStyle"
            select
            value={formData.account}
            label="Account"
            onChange={(event) =>
              setFormData({
                ...formData,
                account: event.target.value as string,
              })
            }
          >
            {!isEmpty(optionData.accounts) &&
              map(optionData.accounts, (account, idx) => {
                return (
                  <MenuItem value={account.id} key={idx + 'A'}>
                    {account.name}
                  </MenuItem>
                );
              })}
          </TextField>
          <TextField
            className="SelectC InputStyle"
            select
            value={formData.category}
            label="Category"
            onChange={(event) =>
              setFormData({
                ...formData,
                category: event.target.value as string,
              })
            }
          >
            {!isEmpty(optionData.accounts) &&
              map(optionData.categories, (category, idx) => {
                return (
                  <MenuItem value={category.id} key={idx + 'C'}>
                    {category.name}
                  </MenuItem>
                );
              })}
          </TextField>
          <TextField
            className="InputD InputStyle"
            value={formData.date}
            label="Date"
            type="date"
            onChange={(event) =>
              setFormData({
                ...formData,
                date: event.target.value as string,
              })
            }
          ></TextField>
          <TextField
            className="InputT InputStyle"
            value={formData.time}
            label="Time"
            type="time"
            onChange={(event) => {
              setFormData({
                ...formData,
                time: event.target.value as string,
              });
            }}
          ></TextField>
          <FormControl
            className="SelectGroup InputStyle"
            sx={{ m: 1, width: 300 }}
          >
            <InputLabel id="demo-multiple-checkbox-label">Tag</InputLabel>
            <Select
              multiple
              id="demo-multiple-checkbox-label"
              MenuProps={{
                style: {
                  maxHeight: 48 * 4.5 + 8,
                  width: 250,
                },
              }}
              className="SelectT"
              value={formData.tags}
              label="Tags"
              input={<OutlinedInput label="Tags" />}
              renderValue={(selected) => selected && selected.join(', ')}
              onChange={(event) => {
                let v = event.target.value;
                v && v.length > 1 && v.indexOf('0') !== -1 && last(v) === '0'
                  ? (v = ['0'])
                  : remove(v, (n) => n === '0');
                isEmpty(v) && (v = ['0']);
                setFormData({
                  ...formData,
                  tags: v as string[],
                });
              }}
            >
              <MenuItem value={'0'} key={'DefaltT'}>
                None
              </MenuItem>
              <MenuItem value={'1'} key={'DefaltT1'}>
                <Checkbox
                  checked={!!formData.tags && formData.tags.indexOf('1') > -1}
                />
                <ListItemText primary={'None'} />
              </MenuItem>
              {/* {!isEmpty(optionData.accounts) &&
            map(optionData.categories, (category, idx) => {
              return (
                <MenuItem value={category.id} key={idx + 'A'}>
                  {category.name}
                </MenuItem>
              );
            })} */}
            </Select>
          </FormControl>
          <Box className="Split">
            <Box className="Toggle">
              {' '}
              Split{' '}
              <Switch
                onChange={() =>
                  setFormData({ ...formData, split: !formData.split })
                }
              />
            </Box>
            {formData.split && (
              <Box className="SplitGroup">
                <Box className='SplitAmount'>
                <FormControl
                  fullWidth
                  sx={{ m: 1, margin: 'none' }}
                  variant="filled"
                >
                  <InputLabel htmlFor="Repayment" color='secondary'>Repayment</InputLabel>
                  <Input
                    className="SplitM"
                    color='secondary'
                    startAdornment={
                      <InputAdornment position="start" color='secondary'>$</InputAdornment>
                    }
                    id="Repayment"
                    type="number"
                    onChange={(v) => {}}
                  />
                </FormControl>
                <span>{'50'}%</span>
                </Box>
                <Slider className='Slider'
                  defaultValue={50}
                  valueLabelDisplay="auto"
                  step={1}
                  min={0}
                  max={100}
                  color="secondary"
                />
              </Box>
            )}
          </Box>
        </Box>
        <Box className="Right">
          <Box className="Amount">
            <FormControl
              fullWidth
              sx={{ m: 1, margin: 'none' }}
              variant="filled"
            >
              <InputLabel htmlFor="standard-adornment-amount">
                Amount
              </InputLabel>

              <Input
                startAdornment={
                  <InputAdornment position="start">$</InputAdornment>
                }
                className={'L' + textLength.toString()}
                id="standard-adornment-amount"
                type="number"
                onChange={(v) => {
                  let amount = Number(v.target.value) * 1;
                  //setFormData({...formData,amount});
                  setTextLength(
                    v.target.value.length < 7 ? v.target.value.length : 7,
                  );
                }}
              />
            </FormControl>
          </Box>
          <TextField
            className="InputDetails InputStyle"
            //value={formData.details}
            label="Details"
            multiline
            rows={8}
            onChange={(event) =>
              setFormData({
                ...formData,
                details: event.target.value as string,
              })
            }
          ></TextField>
              <Box className="Repeat">
            <Box className="Toggle">
              {' '}
              Repeat{' '}
              <Switch
                onChange={() =>
                  setFormData({ ...formData, repeat: !formData.repeat })
                }
              />
            </Box>
            {formData.repeat && (
              <Box className="Form">
                <TextField className="InputRT"
                  color='secondary'
                  value={formData.rTo}
                  label="To"
                  type="date"
                  variant="standard"
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      rTo: event.target.value as string,
                    })
                  }
                ></TextField>
                <InputLabel id="Interval">Interval</InputLabel>
                <Box className="IntervelGroup">
                  <TextField
                    className="InputRI"
                    //value={formData.rTo}
                    type="number"
                    variant="standard"
                    color='secondary'
                    onChange={
                      (event) => {}
                      // setFormData({
                      //   ...formData,
                      //   rTo: event.target.value as string,
                      // })
                    }
                  ></TextField>
                  <TextField
                    color='secondary'

                    className="InputRM"
                    select
                    //value={formData.rTo}
                    type="number"
                    variant="standard"
                    onChange={
                      (event) => {}
                      // setFormData({
                      //   ...formData,
                      //   rTo: event.target.value as string,
                      // })
                    }
                  >
                    <MenuItem value={'0'}>day</MenuItem>
                    <MenuItem value={'1'}>week</MenuItem>
                    <MenuItem value={'2'}>Month</MenuItem>
                    <MenuItem value={'3'}>year</MenuItem>
                  </TextField>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <Button className={`Btn`}>Add</Button>
      </ThemeProvider>
    </Box>
  ) : (
    <Box className={`AddTxnPart FullPageBox `}></Box>
  );
}

export default AddTxnPart;
