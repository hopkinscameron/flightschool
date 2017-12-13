'use strict';

/**
 * Module dependencies
 */
var // the path
    path = require('path'),
    // the ip logger
    ipLogger = require(path.resolve('./config/lib/ip-logger')),
    // the tier controller to handle routes
    tierController = require('../controllers/tier.server.controller');

module.exports = function (app) {
    // GET gets tiers
	// format /tiers
    app.route('/api/tiers').get(ipLogger.log, tierController.read);
};