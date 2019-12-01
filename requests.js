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

module.exports = async function (cookie, cursor='', maxCount=Infinity) {

  try {

    let response;

    response = await axios.get(`https://www.instagram.com/accounts/access_tool/current_follow_requests?__a=1&cursor=${cursor}`, {
      headers: { 'Cookie': qs.stringify(cookie).replace(/&/g, '; '), 'X-CSRFToken': cookie.csrftoken || '', 'X-Instagram-AJAX': '1' }, validateStatus: null });

    assert(response.data.data && response.status === 200,
      JSON.stringify({ code: response.status, message: require('http').STATUS_CODES[response.status] }));

    response = response.data.data;

    if (response.cursor && response.data.length < maxCount) {
      Array.prototype.push.apply(response.data, await module.exports(cookie, response.cursor, maxCount - response.data.length));
    }

    return response.data.slice(0, maxCount);

  } catch (e) {

    return { error: JSON.parse(e.message) };

  }

};

if (require.main === module) {

  const yargs = require('yargs').option('unfollow', {
    type: 'boolean',
    desc: 'Unfollow all pending follow requests'
  }).option('max-count', {
    type: 'number',
    desc: 'Limit results to specified threshold',
    default: Infinity
  }).argv;

  if (!yargs.unfollow) {
    require('./login')().then(credentials => module.exports(credentials, undefined, yargs['max-count'])).then(console.info);
    return;
  }

  require('./login')().then(credentials => Promise.all([ Promise.resolve(credentials), module.exports(credentials, undefined, yargs['max-count']),
    Promise.resolve(require('./unfollow')) ])).then(argv => Promise.all(argv[1].map(user => argv[2](user.text, argv[0])))).then(console.info);

}

/* vim: set expandtab shiftwidth=2 syntax=javascript: */
