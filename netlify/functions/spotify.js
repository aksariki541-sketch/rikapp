const { wrap } = require('./_adapter');
const handler = require('../../api/spotify.js');

exports.handler = wrap(handler);
