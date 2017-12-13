'use strict';

/**
 * Module dependencies
 */
var // the path
    path = require('path'),
    // the ip logger
    ipLogger = require(path.resolve('./config/lib/ip-logger')),
    // the flights policy
	flightsPolicy = require('../policies/flights.server.policy'),
    // the flights controller to handle routes
    flightsController = require('../controllers/flights.server.controller')

module.exports = function (app) {
    // GET gets flight page information
    // POST searches flights
	// format /api/flights
    app.route('/api/flights').all([ipLogger.log, flightsController.readDB])
    .get(flightsController.read)
    .post(flightsPolicy.isAllowed, flightsController.searchFlights);
};