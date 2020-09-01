import 'babel-polyfill';
import 'formdata-polyfill';
import { AppProvider, AuthenticatedPageRoute, ErrorPage } from '@edx/frontend-platform/react';
import { subscribe, initialize, APP_INIT_ERROR, APP_READY, mergeConfig, getConfig } from '@edx/frontend-platform';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';

import Header, { messages as headerMessages } from '@edx/frontend-component-header';
import Footer, { messages as footerMessages } from '@edx/frontend-component-footer';

import configureStore from './data/configureStore';
import AccountSettingsPage, { NotFoundPage } from './account-settings';
import CoachingConsent from './account-settings/coaching/CoachingConsent';
import LoginPage from './logistration/LoginPage';
import RegistrationPage from './logistration/RegistrationPage';
import appMessages from './i18n';

import './index.scss';
import './assets/favicon.ico';

const HeaderFooterLayout = ({ children }) => (
  <div>
    <Header />
      <main>
        {children}
      </main>
    <Footer />
  </div>
);

const FeatureFlaggedRoute = ({ flagName, ...props }) => (
  getConfig()[flagName] ? (<Route {...props} />) : null
);

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={configureStore()}>
      <Switch>
        <AuthenticatedPageRoute
          path="/coaching_consent"
          component={CoachingConsent}
        />
        <HeaderFooterLayout>
          <AuthenticatedPageRoute
            exact
            path="/"
            component={AccountSettingsPage}
          />
          <FeatureFlaggedRoute
            flagName="LOGISTRATION_ENABLED"
            path="/login"
            component={LoginPage}
          />
          <FeatureFlaggedRoute
            flagName="LOGISTRATION_ENABLED"
            path="/register"
            component={RegistrationPage}
          />
          <Route path="/notfound" component={NotFoundPage} />
          <Route path="*" component={NotFoundPage} />
        </HeaderFooterLayout>
      </Switch>
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages: [
    appMessages,
    headerMessages,
    footerMessages,
  ],
  requireAuthenticatedUser: false,
  hydrateAuthenticatedUser: true,
  handlers: {
    config: () => {
      mergeConfig({
        SUPPORT_URL: process.env.SUPPORT_URL,
        COACHING_ENABLED: (process.env.COACHING_ENABLED || false),
        LOGISTRATION_ENABLED: process.env.LOGISTRATION_ENABLED,
      }, 'App loadConfig override handler');
    },
  },
});
