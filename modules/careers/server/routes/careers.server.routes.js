'use strict';

/**
 * Module dependencies
 */
var // the path
    path = require('path'),
    // the ip logger
    ipLogger = require(path.resolve('./config/lib/ip-logger')),
    // the careers controller to handle routes
    careersController = require('../controllers/careers.server.controller');

module.exports = function (app) {
    // GET gets careers page information
	// format /api/careers
    app.route('/api/careers').get(ipLogger.log, careersController.read);
};