import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  configureAnalytics,
  identifyAuthenticatedUser,
  initializeSegment,
  sendPageEvent,
  sendTrackingLogEvent,
} from '@edx/frontend-analytics';
import { configureLoggingService, NewRelicLoggingService } from '@edx/frontend-logging';
import { getAuthenticatedAPIClient } from '@edx/frontend-auth';

import { configuration } from './environment';
import { handleRtl } from '@edx/frontend-i18n'; // eslint-disable-line
import configureStore from './store';
import { configureUserAccountApiService } from './common';
import { configureApiService as configureAccountSettingsApiService } from './account-settings';
import { configureApiService as configureSiteLanguageApiService } from './site-language';

import './index.scss';
import App from './components/App';

const apiClient = getAuthenticatedAPIClient({
  appBaseUrl: configuration.BASE_URL,
  authBaseUrl: configuration.LMS_BASE_URL,
  loginUrl: configuration.LOGIN_URL,
  logoutUrl: configuration.LOGOUT_URL,
  csrfTokenApiPath: configuration.CSRF_TOKEN_API_PATH,
  refreshAccessTokenEndpoint: configuration.REFRESH_ACCESS_TOKEN_ENDPOINT,
  accessTokenCookieName: configuration.ACCESS_TOKEN_COOKIE_NAME,
  userInfoCookieName: configuration.USER_INFO_COOKIE_NAME,
  csrfCookieName: configuration.CSRF_COOKIE_NAME,
  loggingService: NewRelicLoggingService,
});

/**
 * We need to merge the application configuration with the authentication state
 * so that we can hand it all to the redux store's initializer.
 */
function createInitialState() {
  return Object.assign({}, { configuration }, apiClient.getAuthenticationState());
}

function configure() {
  const { store, history } = configureStore(createInitialState(), configuration.ENVIRONMENT);

  configureLoggingService(NewRelicLoggingService);
  configureAccountSettingsApiService(configuration, apiClient);
  configureSiteLanguageApiService(configuration, apiClient);
  configureUserAccountApiService(configuration, apiClient);
  initializeSegment(configuration.SEGMENT_KEY);
  configureAnalytics({
    loggingService: NewRelicLoggingService,
    authApiClient: apiClient,
    analyticsApiBaseUrl: configuration.LMS_BASE_URL,
  });

  handleRtl();

  return {
    store,
    history,
  };
}

apiClient.ensurePublicOrAuthenticationAndCookies(
  window.location.pathname,
  () => {
    const { store, history } = configure();
    const authState = apiClient.getAuthenticationState();

    ReactDOM.render(<App store={store} history={history} />, document.getElementById('root'));

    identifyAuthenticatedUser();
    sendPageEvent();

    sendTrackingLogEvent('edx.user.settings.viewed', {
      page: 'account',
      visibility: null,
      user_id: authState.authentication && authState.authentication.userId,
    });
  },
);

