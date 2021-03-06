import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { getRegisterCaptcha, register } from '../services/register';
import { createAction, net } from '@/utils';
import { message } from 'antd';

export default {
  namespace: 'register',

  state: {
    status: undefined,
    publicKey: '',
  },

  effects: {
    *submit({ payload }, { call, put }) {
      const response = yield call(register, payload);
      if (net(response)) {
        message.success(response.msg);
        yield put(
          routerRedux.push({
            pathname: '/user/login',
          })
        );
      }
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
