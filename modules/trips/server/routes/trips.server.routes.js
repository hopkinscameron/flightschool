'use strict';

/**
 * Module dependencies
 */
var // the path
    path = require('path'),
    // the ip logger
    ipLogger = require(path.resolve('./config/lib/ip-logger')),
    // the trips policy
	tripsPolicy = require('../policies/trips.server.policy'),
    // the trips controller to handle routes
    tripsController = require('../controllers/trips.server.controller');

module.exports = function (app) {
    // GET gets trips navigation
	// format /api/trips
    app.route('/api/trips').get([tripsPolicy.isAllowed, ipLogger.log], tripsController.read);
};