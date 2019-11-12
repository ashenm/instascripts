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

const assert = require('assert');

module.exports = async function (cookie, cursor='') {

  try {

    let response;

    response = await axios.get(`https://www.instagram.com/accounts/access_tool/current_follow_requests?__a=1&cursor=${cursor}`, {
      headers: { 'Cookie': qs.stringify(cookie).replace(/&/g, '; '), 'X-CSRFToken': cookie.csrftoken } });

    console.log(response.data)
    assert(response.data.data && response.status === 200);

    response = response.data.data;

    if (response.cursor) {
      response.data.push((await this.exports(cookie, response.cursor)).data);
    }

    return response.data;

  } catch (e) {

    // TODO standardise error messages
    return { error: e.status || e.message };

  }

};

if (require.main === module) {
  require('./login')().then(module.exports).then(console.log);
}

/* vim: set expandtab shiftwidth=2 syntax=javascript */
