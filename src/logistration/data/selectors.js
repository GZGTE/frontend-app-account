import { createSelector } from 'reselect';

export const storeName = 'logistration';

export const logistrationSelector = state => ({ ...state[storeName] });

export const forgotPasswordSelector = createSelector(
  logistrationSelector,
  logistration => logistration.forgotPassword,
);

export const loginRequestSelector = createSelector(
  logistrationSelector,
  logistration => logistration.loginResult,
);
