import 'babel-polyfill';
import 'formdata-polyfill';
import { App, AppProvider, APP_ERROR, APP_READY, ErrorPage } from '@edx/frontend-base';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';

import Header, { messages as headerMessages } from '@edx/frontend-component-header';
import Footer, { messages as footerMessages } from '@edx/frontend-component-footer';

import configureStore from './data/configureStore';
import AccountSettingsPage, { NotFoundPage } from './account-settings';
import appMessages from './i18n';

import './index.scss';
import './assets/favicon.ico';

App.subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={configureStore()}>
      <Header />
      <main>
        <Switch>
          <Route exact path="/" component={AccountSettingsPage} />
          <Route path="/notfound" component={NotFoundPage} />
          <Route path="*" component={NotFoundPage} />
        </Switch>
      </main>
      <Footer />
    </AppProvider>,
    document.getElementById('root'),
  );
});

App.subscribe(APP_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

App.initialize({
  messages: [
    appMessages,
    headerMessages,
    footerMessages,
  ],
  overrideHandlers: {
    loadConfig: () => {
      App.mergeConfig({
        SUPPORT_URL: process.env.SUPPORT_URL,
      }, 'App loadConfig override handler');
    },
  },
});
