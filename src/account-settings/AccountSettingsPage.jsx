import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';

import messages from './AccountSettingsPage.messages';

import { fetchAccount } from './actions';
import { pageSelector } from './selectors';

import { PageLoading } from '../common';
import EditableField from './components/EditableField';
import { yearOfBirthOptions, yearOfBirthDefault } from './constants';

class AccountSettingsPage extends React.Component {
  componentDidMount() {
    this.props.fetchAccount();
  }

  renderContent() {
    return (
      <div>
        <div className="row">
          <div className="col-md-8 col-lg-6">
            <h2>{this.props.intl.formatMessage(messages['account.settings.section.account.information'])}</h2>
            <p>{this.props.intl.formatMessage(messages['account.settings.section.account.information.description'])}</p>

            <EditableField
              name="username"
              type="text"
              label={this.props.intl.formatMessage(messages['account.settings.field.username'])}
              isEditable={false}
            />
            <EditableField
              name="name"
              type="text"
              label={this.props.intl.formatMessage(messages['account.settings.field.full.name'])}
            />
            <EditableField
              name="email"
              type="email"
              label={this.props.intl.formatMessage(messages['account.settings.field.email'])}
              confirmationMessageDefinition={messages['account.settings.field.email.confirmation']}
            />
            <EditableField
              name="year_of_birth"
              type="select"
              label={this.props.intl.formatMessage(messages['account.settings.field.dob'])}
              options={yearOfBirthOptions}
              defaultValue={yearOfBirthDefault}
            />
          </div>
        </div>
      </div>
    );
  }

  renderError() {
    return (
      <div>
        {this.props.intl.formatMessage(messages['account.settings.loading.error'], {
          error: this.props.loadingError,
        })}
      </div>
    );
  }

  renderLoading() {
    return (
      <PageLoading srMessage={this.props.intl.formatMessage(messages['account.settings.loading.message'])} />
    );
  }

  render() {
    const {
      loading,
      loaded,
      loadingError,
    } = this.props;

    return (
      <div className="page__account-settings container-fluid py-5">
        <h1>
          {this.props.intl.formatMessage(messages['account.settings.page.heading'])}
        </h1>
        {loading ? this.renderLoading() : null}
        {loaded ? this.renderContent() : null}
        {loadingError ? this.renderError() : null}
      </div>
    );
  }
}

AccountSettingsPage.propTypes = {
  intl: intlShape.isRequired,
  loading: PropTypes.bool,
  loaded: PropTypes.bool,
  loadingError: PropTypes.string,
  fetchAccount: PropTypes.func.isRequired,
};

AccountSettingsPage.defaultProps = {
  loading: false,
  loaded: false,
  loadingError: null,
};


export default connect(pageSelector, {
  fetchAccount,
})(injectIntl(AccountSettingsPage));
