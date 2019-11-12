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

module.exports = async function (username, cookie={}) {

  const response = await axios.get(`https://www.instagram.com/${username}/?__a=1`, {
    headers: { 'X-CSRFToken': cookie.csrftoken || '', 'Cookie': qs.stringify(cookie).replace(/&/g, '; ') }, validateStatus: null });

  // TODO standardise error messages
  return response.status === 200 && response.data.graphql ? response.data.graphql.user : {};

};

if (require.main === module) {

  const users = require('yargs').argv._;

  if (users.length) {
    Promise.all(users.map(module.exports)).then(console.info);
    return;
  }

  require('prompts')({ type: 'text', name: 'user', message: 'Username' })
    .then(response => module.exports(response.user)).then(console.info);

}

/* vim: set expandtab shiftwidth=2 syntax=javascript */
