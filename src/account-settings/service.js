import pick from 'lodash.pick';
import omit from 'lodash.omit';
import isEmpty from 'lodash.isempty';

import { applyConfiguration, handleRequestError, unpackFieldErrors } from '../common/serviceUtils';
import { configureService as configureDeleteAccountApiService } from './delete-account';
import { configureService as configureResetPasswordApiService } from './reset-password';
import { configureService as configureSiteLanguageApiService } from './site-language';

let config = {
  BASE_URL: null,
  ACCOUNTS_API_BASE_URL: null,
  PREFERENCES_API_BASE_URL: null,
  ECOMMERCE_API_BASE_URL: null,
  LMS_BASE_URL: null,
  DELETE_ACCOUNT_URL: null,
  PASSWORD_RESET_URL: null,
};

const SOCIAL_PLATFORMS = [
  { id: 'twitter', key: 'social_link_twitter' },
  { id: 'facebook', key: 'social_link_facebook' },
  { id: 'linkedin', key: 'social_link_linkedin' },
];

let apiClient = null;

export function configureService(newConfig, newApiClient) {
  config = applyConfiguration(config, newConfig);
  apiClient = newApiClient;

  configureDeleteAccountApiService(config, apiClient);
  configureResetPasswordApiService(config, apiClient);
  configureSiteLanguageApiService(config, apiClient);
}

function unpackAccountResponseData(data) {
  const unpackedData = data;

  // This is handled by preferences
  delete unpackedData.time_zone;

  SOCIAL_PLATFORMS.forEach(({ id, key }) => {
    const platformData = data.social_links.find(({ platform }) => platform === id);
    unpackedData[key] = typeof platformData === 'object' ? platformData.social_link : '';
  });

  if (Array.isArray(data.language_proficiencies)) {
    if (data.language_proficiencies.length) {
      unpackedData.language_proficiencies = data.language_proficiencies[0].code;
    } else {
      unpackedData.language_proficiencies = '';
    }
  }

  return unpackedData;
}

function packAccountCommitData(commitData) {
  const packedData = commitData;

  SOCIAL_PLATFORMS.forEach(({ id, key }) => {
    // Skip missing values. Empty strings are valid values and should be preserved.
    if (commitData[key] === undefined) return;

    packedData.social_links = [{ platform: id, social_link: commitData[key] }];
    delete packedData[key];
  });

  if (commitData.language_proficiencies !== undefined) {
    if (commitData.language_proficiencies) {
      packedData.language_proficiencies = [{ code: commitData.language_proficiencies }];
    } else {
      // An empty string should be sent as an array.
      packedData.language_proficiencies = [];
    }
  }

  if (commitData.year_of_birth !== undefined) {
    if (commitData.year_of_birth) {
      packedData.year_of_birth = commitData.year_of_birth;
    } else {
      // An empty string should be sent as null.
      packedData.year_of_birth = null;
    }
  }
  return packedData;
}

export async function getAccount(username) {
  const { data } = await apiClient.get(`${config.ACCOUNTS_API_BASE_URL}/${username}`);
  return unpackAccountResponseData(data);
}

export async function patchAccount(username, commitValues) {
  const requestConfig = {
    headers: { 'Content-Type': 'application/merge-patch+json' },
  };

  const { data } = await apiClient
    .patch(
      `${config.ACCOUNTS_API_BASE_URL}/${username}`,
      packAccountCommitData(commitValues),
      requestConfig,
    )
    .catch((error) => {
      const unpackFunction = (fieldErrors) => {
        const unpackedFieldErrors = fieldErrors;
        if (fieldErrors.social_links) {
          SOCIAL_PLATFORMS.forEach(({ key }) => {
            unpackedFieldErrors[key] = fieldErrors.social_links;
          });
        }
        return unpackFieldErrors(unpackedFieldErrors);
      };
      handleRequestError(error, unpackFunction);
    });

  return unpackAccountResponseData(data);
}

export async function getPreferences(username) {
  const { data } = await apiClient.get(`${config.PREFERENCES_API_BASE_URL}/${username}`);
  return data;
}

export async function patchPreferences(username, commitValues) {
  const requestConfig = { headers: { 'Content-Type': 'application/merge-patch+json' } };
  const requestUrl = `${config.PREFERENCES_API_BASE_URL}/${username}`;

  // Ignore the success response, the API does not currently return any data.
  await apiClient.patch(requestUrl, commitValues, requestConfig).catch(handleRequestError);

  return commitValues;
}

export async function getThirdPartyAuthProviders() {
  const { data } = await apiClient
    .get(`${config.LMS_BASE_URL}/api/third_party_auth/v0/providers/user_status`)
    .catch(handleRequestError);

  return data.map(({ connect_url: connectUrl, disconnect_url: disconnectUrl, ...provider }) => ({
    ...provider,
    connectUrl: `${config.LMS_BASE_URL}${connectUrl}`,
    disconnectUrl: `${config.LMS_BASE_URL}${disconnectUrl}`,
  }));
}

export async function getTimeZones(forCountry) {
  const { data } = await apiClient
    .get(`${config.LMS_BASE_URL}/user_api/v1/preferences/time_zones/`, {
      params: { country_code: forCountry },
    })
    .catch(handleRequestError);

  return data;
}

/**
 * Determine if the user's profile data is managed by a third-party identity provider.
 */
export async function getProfileDataManager(username, userRoles) {
  const userRoleNames = userRoles.map(role => role.split(':')[0]);

  if (userRoleNames.includes('enterprise_learner')) {
    const url = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-learner/?username=${username}`;
    const { data } = await apiClient.get(url).catch(handleRequestError);

    if ('results' in data) {
      for (let i = 0; i < data.results.length; i += 1) {
        const enterprise = data.results[i].enterprise_customer;
        if (enterprise.sync_learner_profile_data) {
          return enterprise.name;
        }
      }
    }
  }

  return null;
}

/**
 * A single function to GET everything considered a setting.
 * Currently encapsulates Account, Preferences, and ThirdPartyAuth
 */
export async function getSettings(username, userRoles) {
  const results = await Promise.all([
    getAccount(username),
    getPreferences(username),
    getThirdPartyAuthProviders(),
    getProfileDataManager(username, userRoles),
    getTimeZones(),
  ]);

  return {
    ...results[0],
    ...results[1],
    thirdPartyAuthProviders: results[2],
    profileDataManager: results[3],
    timeZones: results[4],
  };
}

/**
 * A single function to PATCH everything considered a setting.
 * Currently encapsulates Account, Preferences, and ThirdPartyAuth
 */
export async function patchSettings(username, commitValues) {
  // Note: time_zone exists in the return value from user/v1/accounts
  // but it is always null and won't update. It also exists in
  // user/v1/preferences where it does update. This is the one we use.
  const preferenceKeys = ['time_zone'];
  const accountCommitValues = omit(commitValues, preferenceKeys);
  const preferenceCommitValues = pick(commitValues, preferenceKeys);
  const patchRequests = [];

  if (!isEmpty(accountCommitValues)) {
    patchRequests.push(patchAccount(username, accountCommitValues));
  }
  if (!isEmpty(preferenceCommitValues)) {
    patchRequests.push(patchPreferences(username, preferenceCommitValues));
  }

  const results = await Promise.all(patchRequests);
  // Assigns in order of requests. Preference keys
  // will override account keys. Notably time_zone.
  const combinedResults = Object.assign({}, ...results);
  return combinedResults;
}

export async function postDisconnectAuth(url) {
  const { data } = await apiClient.post(url).catch(handleRequestError);
  return data;
}
