import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import '../../styles/parts/AddTxnPart.scss';
import { v4 as uuidv4 } from 'uuid';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  Box,
  Alert,
  FormHelperText,
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
  FormControlLabel,
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
  doc,
  setDoc,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../../firebaseConfig';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useSelector } from 'react-redux';
import { isEmpty, orderBy, map, remove, last, find } from 'lodash';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface FormData {
  type: 0 | 1 | 2;
  name: string;
  account: string | null;
  category: string | null;
  date: string | null;
  time: string | null;
  tags: string[] | null;
  amount: number;
  details: string | null;
  isRepeat: boolean;
  rUntil: string | null;
  rInterval: number | null;
  rPeriod: string | null;
  isSplit: boolean;
  sAmount: number;
  transferTo: string | null;
  isSubscription: boolean;
  renewalDate: string | null;
  isPrivate: boolean;
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
interface TagData {
  coupleId: string;
  name: string;
}

function AddTxnPart(): JSX.Element {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const now = DateTime.now();
  const navigate = useNavigate();
  const theme = createTheme({
    palette: {
      secondary: {
        main: '#fff',
      },
    },
  });

  const [type, setType] = useState<number>(0);
  const [textLength, setTextLength] = useState<number>(0);
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [alert, setAlert] = useState<string|false>(false);
  const [optionData, setOptionData] = useState<{
    accounts: AccountData[] | [];
    categories: CategoryData[] | [];
    tags: TagData[] | []
  }>({ accounts: [], categories: [], tags:[] });
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 0,
    account: '',
    category: '',
    date: now.toISODate(),
    time: now.toFormat('T'),
    tags: ['0'],
    amount: 0,
    details: null,
    isRepeat: false,
    rUntil: null,
    rInterval: 1,
    rPeriod: '0',
    isSplit: false,
    sAmount: 0,
    transferTo: '',
    isSubscription: false,
    renewalDate: null,
    isPrivate: false,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
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
    const tagQ = query(
      collection(db, 'tags'),
        where('coupleId', '==', userInfos.coupleId),
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
        categorySnapshot.forEach((doc) => {
          const d = doc.data() as CategoryData;
          docsC.push(d);
        });

        const accountSnapshot = await getDocs(accountQ);
        const docsA: AccountData[] = [];
        accountSnapshot.forEach((doc) => {
          const d = doc.data() as AccountData;
          docsA.push(d);
        });

        const tagSnapshot = await getDocs(tagQ);
        const docsT: TagData[] = [];
        tagSnapshot.forEach((doc) => {
          const d = doc.data() as TagData;
          docsT.push(d);
        });

        categories = orderBy(docsC, ['idx'], ['asc']);
        accounts = orderBy(docsA, ['idx'], ['asc']);

        setOptionData({ ...optionData, accounts, categories, tags: docsT });
      }
    } catch (error) {
        // Handle the error as needed
    }
  }

  const onSubmit: SubmitHandler<FormData> = (data: FormData) => {
    if(type==2&&data.transferTo!==data.account){
      setDoc(doc(db, 'transactions', uuidv4()),({coupleId: userInfos.coupleId,
      owner: userInfos.id,
      isPrivate: false,
      name: data.name,
      type: type,
      account: data.account,
      category: data.category,
      date: data.date,
      time: data.time,
      tags: data.tags,
      amount: Number(data.amount),
      details: data.details || '',
      isSplit: formData.isSplit,
      isRepeat: formData.isRepeat,
      rUntil: data.rUntil || null,
      rInterval: Number(data.rInterval) || null,
      rPeriod: data.rPeriod || null,
      sAmount: Number(formData.sAmount) || null,
      transferTo: data.transferTo || null,
      isSubscription: formData.isSubscription,
      renewalDate: data.renewalDate || null,}))
      .then(() => {navigate(-1)})
      .catch((error) => {
        setAlert("Can't Add Transaction");
      });
    }else{
      setAlert("Can't transfer to the same accout.")
    }
  };

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
          <Box className={`TopBox ${errors.name && 'Error'}`}>
            <FormControl
              className="Name"
              fullWidth
              sx={{ m: 1, margin: 'none' }}
              variant="filled"
            >
              <InputLabel htmlFor="standard-adornment-amount">Name</InputLabel>

              <Input
                {...register('name', { required: 'Required' })}
                error={!!errors.name}
                value={formData.name}
                className={'L' + textLength.toString()}
                id="standard-adornment-amount"
                type="text"
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  clearErrors('name');
                }}
              />
              {errors.name && (
                <FormHelperText>{errors.name?.message}</FormHelperText>
              )}
            </FormControl>
            <Box className="DeleteIcon">
              <DeleteOutlineIcon />
            </Box>
            <Box className="Toggle">
              {' '}
              Private
              <Switch
                className="PrivateSwitch"
                onChange={() => {
                  let accountnData= formData.account&&find(optionData.accounts, ['id', formData.account]);
                  !formData.isPrivate?!isEmpty(accountnData)&&accountnData.isPrivate!==-1&&!accountnData.isPrivate&&setAlert('The account you chose is not private. Your partner can see the transactions still without knowing the name'):setAlert(false); 
                  setFormData({
                    ...formData,
                    isPrivate: !formData.isPrivate,
                    isSplit:!formData.isPrivate&&false
                  });
                }}
              />
            </Box>
          </Box>
        </Box>
        <Box className="MainBox">
          <Box className="Left">
            <TextField
              required
              className={`SelectA InputStyle ${errors.name && 'Error'}`}
              error={!!errors.account}
              helperText={errors.account?.message}
              {...register('account', { required: 'Required' })}
              select
              value={formData.account}
              label="Account"
              onChange={(event) => {
                type!==2||event.target.value!==formData.transferTo&&setAlert(false);
                clearErrors('account');
                let accountnData= find(optionData.accounts, ['id', event.target.value]);
                formData.isPrivate?
                accountnData.isPrivate!==-1&&!accountnData.isPrivate?setAlert('The account you chose is not private. Your partner can see the transactions still without knowing the name'):setAlert(false):setAlert(false); 
                setFormData({
                  ...formData,
                  account: event.target.value as string,
                });
              }}
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
              required
              className={`Selectc InputStyle ${errors.name && 'Error'}`}
              error={!!errors.category}
              helperText={errors.category?.message}
              {...register('category', { required: 'Required' })}
              select
              value={formData.category}
              label="Category"
              onChange={(event) => {
                clearErrors('category');
                setFormData({
                  ...formData,
                  category: event.target.value as string,
                });
              }}
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
              error={!!errors.date}
              helperText={errors.date?.message}
              {...register('date', { required: 'Required' })}
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
              error={!!errors.time}
              helperText={errors.time?.message}
              {...register('time', { required: 'Required' })}
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
                error={!!errors.tags}
                {...register('tags', { required: 'Required' })}
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
                renderValue={(selected) => {
                  const Arr:TagData[]=[];
                  selected?.map((id)=>Arr.push(find(optionData.tags,['id',id])?find(optionData.tags,['id',id])?.name:'None'))
                  return Arr.join(',');
                }}
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
               {!isEmpty(optionData.tags) &&
            map(optionData.tags, (tag, idx) => {
              return (
                <MenuItem value={tag.id} key={'Tag'+idx}>
                <Checkbox
                  checked={!!formData.tags && formData.tags.indexOf(tag.id) > -1}
                />
                <ListItemText primary={tag.name} />
              </MenuItem>
        
              );
            })} 
              </Select>
              {errors.tags && (
                <FormHelperText>{errors.tags?.message}</FormHelperText>
              )}
            </FormControl>
            <Box className="Split">
              <Box className="Toggle">
                Split
                <Switch
                checked={formData.isSplit}
                  disabled={type === 2||formData.isPrivate}
                  onChange={(e, v) => {
                    !formData.isSplit && setSplitPercent(50);
                    setFormData({
                      ...formData,
                      isSplit: v,
                      sAmount:
                        formData.amount !== 0
                          ? Math.round(formData.amount / 2)
                          : 0,
                    });
                  }}
                />
              </Box>
              {formData.isSplit && (
                <Box className="SplitGroup">
                  <Box className="SplitAmount">
                    <FormControl
                      fullWidth
                      sx={{ m: 1, margin: 'none' }}
                      variant="filled"
                    >
                      <InputLabel htmlFor="Repayment" color="secondary">
                        Repayment
                      </InputLabel>
                      <Input
                        className="SplitM"
                        error={!!errors.sAmount}
                        {...register('sAmount', { required: 'Required' })}
                        value={formData.sAmount}
                        color="secondary"
                        startAdornment={
                          <InputAdornment position="start" color="secondary">
                            $
                          </InputAdornment>
                        }
                        id="Repayment"
                        type="number"
                        onChange={(v) => {
                          setFormData({
                            ...formData,
                            sAmount: Number(v.target.value),
                          });
                          setSplitPercent(
                            Math.round(
                              (Number(v.target.value) / formData.amount) * 100,
                            ),
                          );
                        }}
                      />
                      {errors.sAmount && (
                        <FormHelperText>
                          {errors.sAmount?.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                    <span>{splitPercent}%</span>
                  </Box>
                  <Slider
                    className="Slider"
                    value={splitPercent}
                    valueLabelDisplay="auto"
                    step={1}
                    min={0}
                    max={100}
                    color="secondary"
                    onChange={(event, v) => {
                      setSplitPercent(Number(v));
                      setFormData({
                        ...formData,
                        sAmount: Math.round(
                          (formData.amount * Number(v)) / 100,
                        ),
                      });
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
          <Box className="Right">
            {type === 2 && (
              <TextField
                className="SelectTransfer InputStyle"
                select
                value={formData.transferTo}
                label="To Account"
                error={!!errors.transferTo}
                helperText={errors.transferTo?.message}
                {...register('transferTo', { required: 'Required' })}
                onChange={(event) =>{
                  event.target.value!==formData.account&&setAlert(false);
                  setFormData({
                    ...formData,
                    transferTo: event.target.value as string,
                  })}
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
            )}

            <Box className={`Amount ${errors.amount && 'Error'}`}>
              <FormControl
                fullWidth
                sx={{ m: 1, margin: 'none' }}
                variant="filled"
              >
                <InputLabel htmlFor="standard-adornment-amount">
                  Amount
                </InputLabel>

                <Input
                  {...register('amount', { required: 'Required' })}
                  error={!!errors.amount}
                  startAdornment={
                    <InputAdornment position="start">$</InputAdornment>
                  }
                  className={'L' + textLength.toString()}
                  id="standard-adornment-amount"
                  type="number"
                  onChange={(e) => {
                    setTextLength(
                      e.target.value.length < 7 ? e.target.value.length : 7,
                    );
                    setSplitPercent(
                      Math.round(
                        (formData.sAmount / Number(e.target.value)) * 100,
                      ),
                    );
                    setFormData({
                      ...formData,
                      amount: Number(e.target.value),
                    });
                  }}
                />
              </FormControl>{' '}
              {errors.amount && (
                <FormHelperText>{errors.amount?.message}</FormHelperText>
              )}
            </Box>
            <TextField
              className="InputDetails InputStyle"
              error={!!errors.details}
              helperText={errors.details?.message}
              {...register('details')}
              label="Details"
              multiline
              rows={type === 2 ? 4 : 8}
              onBlur={(event) =>
                setFormData({
                  ...formData,
                  details: event.target.value as string,
                })
              }
            ></TextField>
            {
              <Box className="Repeat">
                <Box className="Toggle">
                  {' '}
                  Repeat{' '}
                  <Switch
                    onChange={() => {
                      setFormData({
                        ...formData,
                        isRepeat: !formData.isRepeat,
                        isSubscription: false,
                        rUntil: formData.date
                          ? DateTime.fromISO(formData.date)
                              .plus({ year: 1 })
                              .toISODate()
                          : DateTime.now().plus({ year: 1 }).toISODate(),
                      });
                    }}
                  />
                </Box>
                {formData.isRepeat && (
                  <Box className="Form">
                    <TextField
                      className="InputRT"
                      color="secondary"
                      error={!!errors.rUntil}
                      helperText={errors.rUntil?.message}
                      {...register('rUntil', { required: 'Required' })}
                      value={formData.rUntil}
                      label="To"
                      type="date"
                      variant="standard"
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          rUntil: event.target.value as string,
                        })
                      }
                    ></TextField>
                    <InputLabel id="Interval">Interval</InputLabel>
                    <Box className="IntervelGroup">
                      <TextField
                        className="InputRI"
                        value={formData.rInterval}
                        error={!!errors.rInterval}
                        helperText={errors.rInterval?.message}
                        {...register('rInterval', { required: 'Required' })}
                        type="number"
                        variant="standard"
                        color="secondary"
                        onChange={(event) => {
                          setFormData({
                            ...formData,
                            rInterval: Number(event.target.value),
                          });
                        }}
                      ></TextField>
                      <TextField
                        color="secondary"
                        className="InputRM"
                        select
                        error={!!errors.rPeriod}
                        helperText={errors.rPeriod?.message}
                        {...register('rPeriod', { required: 'Required' })}
                        value={formData.rPeriod}
                        type="number"
                        variant="standard"
                        onChange={(event) => {
                          setFormData({
                            ...formData,
                            rPeriod: event.target.value,
                          });
                        }}
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
            }
            {formData.isRepeat && (
              <FormControlLabel
                className="Sub"
                control={
                  <Checkbox
                    icon={<BookmarkBorderIcon />}
                    checkedIcon={<BookmarkIcon />}
                    onChange={() => {
                      setFormData({
                        ...formData,
                        isSubscription: !formData.isSubscription,
                        renewalDate: formData.rUntil,
                      });
                    }}
                  />
                }
                label="Subscription/Bill"
              />
            )}
            {formData.isSubscription && (
              <Box className="Renew">
                <InputLabel id="Sub">Renewal Date</InputLabel>
                <TextField
                  className="InputSub"
                  color="secondary"
                  error={!!errors.renewalDate}
                  helperText={errors.renewalDate?.message}
                  {...register('renewalDate', { required: 'Required' })}
                  value={formData.renewalDate}
                  type="date"
                  variant="standard"
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      renewalDate: event.target.value,
                    })
                  }
                ></TextField>{' '}
              </Box>
            )}
          </Box>
        </Box>
        {alert&&<Alert onClose={() => {setAlert(false)}} className='Alert' severity="error">{alert}</Alert>}
        <ButtonGroup
          className="SubmitGroup"
          variant="contained"
          color="secondary"
        >
          <Button className={`Submit`} onClick={handleSubmit(onSubmit)}>
            Add
          </Button>
          <Button className={`Cancel`} onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </ButtonGroup>
      </ThemeProvider>
    </Box>
  ) : (
    <Box className={`AddTxnPart FullPageBox `}></Box>
  );
}

export default AddTxnPart;
