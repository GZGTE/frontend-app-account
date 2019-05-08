/**
 * For each locale we want to support, react-intl needs 1) the locale-data, which includes
 * information about how to format numbers, handle plurals, etc., and 2) the translations, as an
 * object holding message id / translated string pairs.  A locale string and the messages object are
 * passed into the IntlProvider element that wraps your element hierarchy.
 *
 * Note that react-intl has no way of checking if the translations you give it actually have
 * anything to do with the locale you pass it; it will happily use whatever messages object you pass
 * in.  However, if the locale data for the locale you passed into the IntlProvider was not
 * correctly installed with addLocaleData, all of your translations will fall back to the default
 * (in our case English), *even if you gave IntlProvider the correct messages object for that
 * locale*.
 */

import { addLocaleData } from 'react-intl';
import Cookies from 'universal-cookie';

import arLocale from 'react-intl/locale-data/ar';
import enLocale from 'react-intl/locale-data/en';
import es419Locale from 'react-intl/locale-data/es';
import frLocale from 'react-intl/locale-data/fr';
import zhcnLocale from 'react-intl/locale-data/zh';
import caLocale from 'react-intl/locale-data/ca';
import heLocale from 'react-intl/locale-data/he';
import idLocale from 'react-intl/locale-data/id';
import kokrLocale from 'react-intl/locale-data/ko';
import plLocale from 'react-intl/locale-data/pl';
import ptbrLocale from 'react-intl/locale-data/pt';
import ruLocale from 'react-intl/locale-data/ru';
import thLocale from 'react-intl/locale-data/th';
import ukLocale from 'react-intl/locale-data/uk';

import COUNTRIES, { langs as countryLangs } from 'i18n-iso-countries';
import LANGUAGES, { langs as languageLangs } from '@cospired/i18n-iso-languages';

import arMessages from './messages/ar.json';
import caMessages from './messages/ca.json';
// no need to import en messages-- they are in the defaultMessage field
import es419Messages from './messages/es_419.json';
import frMessages from './messages/fr.json';
import zhcnMessages from './messages/zh_CN.json';
import heMessages from './messages/he.json';
import idMessages from './messages/id.json';
import kokrMessages from './messages/ko_kr.json';
import plMessages from './messages/pl.json';
import ptbrMessages from './messages/pt_br.json';
import ruMessages from './messages/ru.json';
import thMessages from './messages/th.json';
import ukMessages from './messages/uk.json';

addLocaleData([
  ...arLocale,
  ...enLocale,
  ...es419Locale,
  ...frLocale,
  ...zhcnLocale,
  ...caLocale,
  ...heLocale,
  ...idLocale,
  ...kokrLocale,
  ...plLocale,
  ...ptbrLocale,
  ...ruLocale,
  ...thLocale,
  ...ukLocale,
]);

// TODO: When we start dynamically loading translations only for the current locale, change this.
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/ar.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/en.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/es.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/fr.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/zh.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/ca.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/he.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/id.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/ko.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/pl.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/pt.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/ru.json'));
// COUNTRIES.registerLocale(require('i18n-iso-countries/langs/th.json')); // Doesn't exist in lib.
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/uk.json'));

// TODO: When we start dynamically loading translations only for the current locale, change this.
// TODO: Also note that a bunch of languages are missing here. They're present but commented out
// for reference. That's because they're not implemented in this library.  If you read this and it's
// been a while, go check and see if that's changed!
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/ar.json'));
LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/en.json'));
LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/es.json'));
LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/fr.json'));
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/zh.json'));
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/ca.json'));
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/he.json'));
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/id.json'));
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/ko.json'));
LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/pl.json'));
LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/pt.json'));
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/ru.json'));
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/th.json'));
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/uk.json'));

const messages = {
  // current fallback strategy is to use the first two letters of the locale code
  ar: arMessages,
  es: es419Messages,
  fr: frMessages,
  zh: zhcnMessages,
  ca: caMessages,
  he: heMessages,
  id: idMessages,
  ko: kokrMessages,
  pl: plMessages,
  pt: ptbrMessages,
  ru: ruMessages,
  th: thMessages,
  uk: ukMessages,
};

const serverCodeLookup = {
  ar: 'ar',
  en: 'en',
  es: 'es-419',
  fr: 'fr',
  zh: 'zh-cn',
  ca: 'ca',
  he: 'he',
  id: 'id',
  ko: 'ko-kr',
  pl: 'pl',
  pt: 'pt-br',
  ru: 'ru',
  th: 'th',
  uk: 'uk',
};

/**
 * TODO: This function is a hack.  Because the client is using two-letter codes and the server
 * is using fully qualified codes with a locale, if we want the server to understand what code
 * we're using, we need to convert back to whatever it was originally using.  This will
 * immediately break down if we have another version of Spanish (es), Chinese (zh), or
 * Portugese (pt), for instance. That's why this is "assumed".
 */
const getAssumedServerLanguageCode = lang => (serverCodeLookup[lang] !== undefined ?
  serverCodeLookup[lang] : lang);

const cookies = new Cookies();

const getTwoLetterLanguageCode = code => code.substr(0, 2);

// Get the locale by setting priority. Skip if we don't support that language.
const getLocale = (localeStr) => {
  // 1. Explicit application request
  if (localeStr && messages[localeStr] !== undefined) {
    return localeStr;
  }
  // 2. User setting in cookie
  const cookieLangPref = cookies.get(process.env.LANGUAGE_PREFERENCE_COOKIE_NAME);
  if (cookieLangPref && messages[getTwoLetterLanguageCode(cookieLangPref)] !== undefined) {
    return getTwoLetterLanguageCode(cookieLangPref);
  }
  // 3. Browser language (default)
  return getTwoLetterLanguageCode(window.navigator.language);
};

const getMessages = (locale = getLocale()) => messages[locale];

const rtlLocales = ['ar', 'he', 'fa', 'ur'];
const isRtl = locale => rtlLocales.includes(locale);

const handleRtl = () => {
  if (process.env.ENVIRONMENT === 'production') {
    if (isRtl(getLocale())) {
      document.getElementsByTagName('html')[0].setAttribute('dir', 'rtl');
      document.styleSheets[0].disabled = true;
      document.styleSheets[1].disabled = false;
    } else {
      document.getElementsByTagName('html')[0].removeAttribute('dir');
      document.styleSheets[0].disabled = false;
      document.styleSheets[1].disabled = true;
    }
  }
};

/**
 * Provides a lookup table of country IDs to country names for the current locale.
 */
const getCountryMessages = (locale) => {
  const twoLetterLocale = getTwoLetterLanguageCode(locale);
  const finalLocale = countryLangs().includes(twoLetterLocale) ? twoLetterLocale : 'en';

  return COUNTRIES.getNames(finalLocale);
};

/**
 * Provides a lookup table of language IDs to language names for the current locale.
 */
const getLanguageMessages = (locale) => {
  const twoLetterLocale = getTwoLetterLanguageCode(locale);
  const finalLocale = languageLangs().includes(twoLetterLocale) ? twoLetterLocale : 'en';

  return LANGUAGES.getNames(finalLocale);
};

const sortFunction = (a, b) => {
  // If localeCompare exists, use that.  (Not supported in some older browsers)
  if (typeof String.prototype.localeCompare === 'function') {
    return a[1].localeCompare(b[1], getLocale());
  }
  if (a[1] === b[1]) {
    return 0;
  }
  // Otherwise make a best effort.
  return a[1] > b[1] ? 1 : -1;
};

/**
 * Provides a list of countries represented as objects of the following shape:
 *
 * {
 *   key, // The ID of the country
 *   name // The localized name of the country
 * }
 *
 * The list is sorted alphabetically in the current locale.
 * This is useful for select dropdowns primarily.
 */
const getCountryList = (locale) => {
  const countryMessages = getCountryMessages(locale);
  return Object.entries(countryMessages)
    .sort(sortFunction)
    .map(([code, name]) => ({ code, name }));
};

/**
 * Provides a list of languages represented as objects of the following shape:
 *
 * {
 *   key, // The ID of the language
 *   name // The localized name of the language
 * }
 *
 * The list is sorted alphabetically in the current locale.
 * This is useful for select dropdowns primarily.
 */
const getLanguageList = (locale) => {
  const languageMessages = getLanguageMessages(locale);
  return Object.entries(languageMessages)
    .sort(sortFunction)
    .map(([code, name]) => ({ code, name }));
};

export {
  getCountryList,
  getCountryMessages,
  getLanguageList,
  getLanguageMessages,
  getLocale,
  getAssumedServerLanguageCode,
  getMessages,
  handleRtl,
  isRtl,
};
