'use strict';

/**
 * Module dependencies
 */
var // the path
    path = require('path'),
    // the ip logger
    ipLogger = require(path.resolve('./config/lib/ip-logger')),
    // the account policy
	accountPolicy = require('../policies/account.server.policy'),
    // the account controller to handle routes
    accountController = require('../controllers/account.server.controller');

module.exports = function (app) {
    // GET gets account navigation
	// format /api/account
    app.route('/api/account').get([accountPolicy.isAllowed, ipLogger.log, accountController.readDB], accountController.read);

    // GET gets user's edit profile information
	// format /api/edit-profile
    app.route('/api/edit-profile').get([accountPolicy.isAllowed, ipLogger.log, accountController.readDB], accountController.read);

    // GET gets user's change password information
	// format /api/change-password
    app.route('/api/change-password').get([accountPolicy.isAllowed, ipLogger.log, accountController.readDB], accountController.read);

    // GET gets user's hub information
	// format /api/hub
    app.route('/api/hub').get([accountPolicy.isAllowed, ipLogger.log, accountController.readDB], accountController.read);

    // GET gets user's notifications information
	// format /api/notifications
    app.route('/api/notifications').get([accountPolicy.isAllowed, ipLogger.log, accountController.readDB], accountController.read);
};