/**
 * InstaScripts
 * A Collection of Instagram Facilitator Scripts
 * https://github.com/ashenm/instascripts
 *
 * Ashen Gunaratne
 * mail@ashenm.ml
 *
 */

const qs = require('qs');
const axios = require('axios');
const cookies = require('cookie');
const prompts = require('prompts');

const assert = require('assert');
const fs = require('fs');

const CACHE = 'credentials.json';

module.exports = async function () {

  let cookie;
  let response;

  try {

    fs.accessSync(CACHE);

    cookie = JSON.parse(fs.readFileSync(CACHE));

    // validate expiry of saved session
    response = await axios.post('https://www.instagram.com/accounts/get_encrypted_credentials/', {}, {
      headers: { 'Cookie': qs.stringify(cookie).replace(/&/g, '; '), 'X-CSRFToken': cookie.csrftoken } });

    assert(response.status === 200 && response.data.status === 'ok');
    console.info('[INFO] Using saved session from %s', fs.realpathSync(CACHE));

    return cookie;

  } catch (e) {

    // TODO standardise cookie management interface
    cookie = Object.defineProperties({}, {
      'Path': { enumerable: false, writable: true },
      'Max-Age': { enumerable: false, writable: true },
      'Domain': { enumerable: false, writable: true }
    });

  }

  try {

    // initial nonce
    response = await axios.get('https://www.instagram.com/');
    [ cookie.csrftoken ] = response.data.match(/(?<="csrf_token":")\w+/);

    // attempt login
    response = await axios.post('https://www.instagram.com/accounts/login/ajax/', qs.stringify({
      username: (await prompts({ type: 'text', name: 'username', message: 'Username' })).username,
      password: (await prompts({ type: 'password', name: 'password', message: 'Password' })).password
    }), { headers: { 'X-CSRFToken': cookie.csrftoken }, validateStatus: null });

    // ensure successful authentication
    assert(response.status === 200 || response.status === 400, response.statusText);
    assert(response.headers.hasOwnProperty('set-cookie')); // TODO standardise error message

    // extract cookies
    cookie = response.headers['set-cookie'].reduce((accumulator, value) => Object.assign(accumulator, cookies.parse(value)), cookie);

    // handle two-factor authentication
    // TODO handle sms-based auth mechanisms
    if (response.data.two_factor_required) {
      response = await axios.post('https://www.instagram.com/accounts/login/ajax/two_factor/', qs.stringify({
        username: response.data.two_factor_info.username,
        verificationCode: (await prompts({ type: 'text', name: 'PIN', message: 'Security Code' })).PIN,
        identifier: response.data.two_factor_info.two_factor_identifier
      }), { headers: { 'X-CSRFToken': cookie.csrftoken, 'Cookie': qs.stringify(cookie).replace(/&/g, '; ') } });
    }

    assert(response.status === 200 && response.data.authenticated
      && response.headers.hasOwnProperty('set-cookie')); // TODO standardise error message

    cookie = response.headers['set-cookie'].reduce((accumulator, value) => Object.assign(accumulator, cookies.parse(value)), cookie);

    // TODO parametrise caching
    fs.writeFileSync(CACHE, JSON.stringify(cookie), { mode: 0o600 });
    console.info('[INFO] Saving session to %s', fs.realpathSync(CACHE));

    return cookie;

  } catch (e) {

    // TODO standardise error messages
    return { error: e.status || e.message };

  }

};

if (require.main === module) {
  module.exports().then(console.info);
}

/* vim: set expandtab shiftwidth=2 syntax=javascript: */
