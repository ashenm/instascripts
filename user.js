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
    headers: { 'Cookie': qs.stringify(cookie).replace(/&/g, '; '), 'X-CSRFToken': cookie.csrftoken || '', 'X-Instagram-AJAX': '1' }, validateStatus: null });

  return response.data.graphql && response.status === 200 ? response.data.graphql.user
    : { error: { code: response.status, message: require('http').STATUS_CODES[response.status] } };

};

if (require.main === module) {

  const argv = require('yargs').boolean('login').argv;

  if (argv._.length) {
    Promise.resolve(argv.login ? require('./login')() : {}).then(credentials =>
      Promise.all(argv._.map(user => module.exports(user, credentials)))).then(console.info);
    return;
  }

  require('prompts')({ type: 'text', name: 'user', message: 'Username' }).then(response => Promise.all([
    Promise.resolve(response.user), Promise.resolve(argv.login ? require('./login')() : {})
  ])).then(argv => module.exports.apply(null, argv)).then(console.info);

}

/* vim: set expandtab shiftwidth=2 syntax=javascript: */
