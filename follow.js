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

const user = require('./user');
const assert = require('assert');

module.exports = async function (username, cookie) {

  try {

    const profile = await user(username, cookie);

    // ensure user fetch successfull
    assert(!profile.error, JSON.stringify(profile.error));

    // ensure valid unfollowing user
    assert(profile.id, '{ "code": 404, "message": "Not Found" }');
    assert(!profile.followed_by_viewer, '{ "code": 304, "message": "Not Modified" }');

    // TODO retry on failure
    const response = await axios.post(`https://www.instagram.com/web/friendships/${profile.id}/follow/`, {}, {
      headers: { 'Cookie': qs.stringify(cookie).replace(/&/g, '; '), 'X-CSRFToken': cookie.csrftoken || '', 'X-Instagram-AJAX': '1' }, validateStatus: null });

    // ensure follow successful
    assert(response.status === 200 && response.data.status === 'ok', '{ "code": "403", "message": "Forbidden" }');

    return response.data;

  } catch (e) {

    return { error: JSON.parse(e.message) };

  }

};

if (require.main === module) {

  const users = require('yargs').argv._;

  if (users.length) {
    require('./login')().then(credentials => Promise.all(users.map(user => module.exports(user, credentials)))).then(console.info);
    return;
  }

  require('prompts')({ type: 'text', name: 'username', message: 'Follow' }).then(response => Promise.all([
    Promise.resolve(response.username), require('./login')() ])).then(argv => module.exports.apply(null, argv)).then(console.info);

}

/* vim: set expandtab shiftwidth=2 syntax=javascript: */
