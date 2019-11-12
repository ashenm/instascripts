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

    // ensure valid following user
    // TODO standardise error messages
    assert(profile.id, 'User does not exists');
    assert(profile.followed_by_viewer, 'User already unfollowed');

    // TODO retry on failure
    const response = await axios.post(`https://www.instagram.com/web/friendships/${profile.id}/unfollow/`, {}, {
      headers: { 'X-CSRFToken': cookie.csrftoken, 'Cookie': qs.stringify(cookie).replace(/&/g, '; ') } });

    // ensure unfollow successful
    assert(response.status === 200 && response.data.status === 'ok');

    return response.data;

  } catch (e) {

    // TODO standardise error messages
    return { error: e.status || e.message };

  }

};

if (require.main === module) {

  const users = require('yargs').argv._;

  if (users.length) {
    require('./login')().then(credentials => Promise.all(users.map(user => module.exports(user, credentials)))).then(console.log);
    return;
  }

  require('prompts')({ type: 'text', name: 'username', message: 'Unfollow' }).then(response => Promise.all([
    Promise.resolve(response.username), require('./login')() ])).then(argv => module.exports.apply(null, argv)).then(console.log);

}

/* vim: set expandtab shiftwidth=2 syntax=javascript */
