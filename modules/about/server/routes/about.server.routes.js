'use strict';

/**
 * Module dependencies
 */
var // the path
    path = require('path'),
    // the ip logger
    ipLogger = require(path.resolve('./config/lib/ip-logger')),
    // the about controller to handle routes
    aboutController = require('../controllers/about.server.controller'),
    // the privacy controller to handle routes
    privacyController = require('../controllers/privacy.server.controller'),
    // the terms and conditions controller to handle routes
    termsController = require('../controllers/terms.server.controller');

module.exports = function (app) {
    // GET gets about page information
	// format /api/about
    app.route('/api/about').all([ipLogger.log, aboutController.readDB])
    .get(aboutController.read);

    // GET gets privacy page information
	// format /api/about/privacy
    app.route('/api/about/privacy').all([ipLogger.log, privacyController.readDB])
    .get(privacyController.read);

    // GET gets terms and conditions page information
	// format /api/about/terms-and-conditions
    app.route('/api/about/terms-and-conditions').all([ipLogger.log, termsController.readDB])
    .get(termsController.read);
};