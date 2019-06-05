import {
  FETCH_SETTINGS,
  OPEN_FORM,
  CLOSE_FORM,
  SAVE_SETTINGS,
  FETCH_TIME_ZONES,
  SAVE_PREVIOUS_SITE_LANGUAGE,
  DISCONNECT_AUTH,
  UPDATE_DRAFT,
  RESET_DRAFTS,
} from './actions';

import { reducer as deleteAccountReducer, DELETE_ACCOUNT } from './delete-account';
import { reducer as siteLanguageReducer, FETCH_SITE_LANGUAGES } from './site-language';
import { reducer as resetPasswordReducer, RESET_PASSWORD } from './reset-password';

export const defaultState = {
  loading: false,
  loaded: false,
  loadingError: null,
  data: null,
  values: {},
  errors: {},
  confirmationValues: {},
  drafts: {},
  saveState: null,
  timeZones: [],
  countryTimeZones: [],
  disconnectingState: {},
  disconnectErrors: {},
  previousSiteLanguage: null,
  deleteAccount: deleteAccountReducer(),
  siteLanguage: siteLanguageReducer(),
  resetPassword: resetPasswordReducer(),
};

const reducer = (state = defaultState, action) => {
  let dispatcherIsOpenForm;

  switch (action.type) {
    case FETCH_SETTINGS.BEGIN:
      return {
        ...state,
        loading: true,
        loaded: false,
        loadingError: null,
      };
    case FETCH_SETTINGS.SUCCESS:
      return {
        ...state,
        values: Object.assign({}, state.values, action.payload.values),
        authProviders: action.payload.thirdPartyAuthProviders,
        profileDataManager: action.payload.profileDataManager,
        timeZones: action.payload.timeZones,
        loading: false,
        loaded: true,
        loadingError: null,
      };
    case FETCH_SETTINGS.FAILURE:
      return {
        ...state,
        loading: false,
        loaded: false,
        loadingError: action.payload.error,
      };
    case FETCH_SETTINGS.RESET:
      return {
        ...state,
        loading: false,
        loaded: false,
        loadingError: null,
      };

    case OPEN_FORM:
      return {
        ...state,
        openFormId: action.payload.formId,
        saveState: null,
        errors: {},
        drafts: {},
      };
    case CLOSE_FORM:
      dispatcherIsOpenForm = action.payload.formId === state.openFormId;
      if (dispatcherIsOpenForm) {
        return {
          ...state,
          openFormId: null,
          saveState: null,
          errors: {},
          drafts: {},
        };
      }
      return state;
    case UPDATE_DRAFT:
      return {
        ...state,
        drafts: Object.assign({}, state.drafts, {
          [action.payload.name]: action.payload.value,
        }),
        saveState: null,
        errors: {},
      };

    case RESET_DRAFTS:
      return {
        ...state,
        drafts: {},
      };

    case SAVE_SETTINGS.BEGIN:
      return {
        ...state,
        saveState: 'pending',
        errors: {},
      };
    case SAVE_SETTINGS.SUCCESS:
      return {
        ...state,
        saveState: 'complete',
        values: Object.assign({}, state.values, action.payload.values),
        errors: {},
        confirmationValues: Object.assign(
          {},
          state.confirmationValues,
          action.payload.confirmationValues,
        ),
      };
    case SAVE_SETTINGS.FAILURE:
      return {
        ...state,
        saveState: 'error',
        errors: Object.assign({}, state.errors, action.payload.errors),
      };
    case SAVE_SETTINGS.RESET:
      return {
        ...state,
        saveState: null,
        errors: {},
      };
    case SAVE_PREVIOUS_SITE_LANGUAGE:
      return {
        ...state,
        previousSiteLanguage: action.payload.previousSiteLanguage,
      };

    case FETCH_TIME_ZONES.SUCCESS:
      return {
        ...state,
        countryTimeZones: action.payload.timeZones,
      };

    case DISCONNECT_AUTH.BEGIN:
      return {
        ...state,
        disconnectingState: {
          ...state.disconnectingState,
          [action.payload.providerId]: 'pending',
        },
      };
    case DISCONNECT_AUTH.SUCCESS:
      return {
        ...state,
        disconnectingState: {
          ...state.disconnectingState,
          [action.payload.providerId]: 'complete',
        },
        authProviders: action.payload.thirdPartyAuthProviders,
      };
    case DISCONNECT_AUTH.FAILURE:
      return {
        ...state,
        disconnectingState: {
          ...state.disconnectingState,
          [action.payload.providerId]: 'error',
        },
        disconnectErrors: {
          ...state.disconnectErrors,
          [action.payload.providerId]: true,
        },
      };
    case DISCONNECT_AUTH.RESET:
      return {
        ...state,
        disconnectingState: {
          ...state.disconnectingState,
          [action.payload.providerId]: null,
        },
        disconnectErrors: {
          ...state.disconnectErrors,
          [action.payload.providerId]: null,
        },
      };

    // TODO: Once all the above cases have been converted into sub-reducers, we can use
    // combineReducers in this file to greatly simplify it.

    // Delete My Account
    case DELETE_ACCOUNT.CONFIRMATION:
    case DELETE_ACCOUNT.BEGIN:
    case DELETE_ACCOUNT.SUCCESS:
    case DELETE_ACCOUNT.FAILURE:
    case DELETE_ACCOUNT.RESET:
    case DELETE_ACCOUNT.CANCEL:
      return {
        ...state,
        deleteAccount: deleteAccountReducer(state.deleteAccount, action),
      };

    case FETCH_SITE_LANGUAGES.BEGIN:
    case FETCH_SITE_LANGUAGES.SUCCESS:
    case FETCH_SITE_LANGUAGES.FAILURE:
    case FETCH_SITE_LANGUAGES.RESET:
      return {
        ...state,
        siteLanguage: siteLanguageReducer(state.siteLanguage, action),
      };

    case RESET_PASSWORD.BEGIN:
    case RESET_PASSWORD.SUCCESS:
      return {
        ...state,
        resetPassword: resetPasswordReducer(state.resetPassword, action),
      };

    default:
      return state;
  }
};

export default reducer;
