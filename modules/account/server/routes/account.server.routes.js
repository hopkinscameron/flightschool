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
    // PUT updates user's profile information
	// format /api/edit-profile
    app.route('/api/account/edit-profile').get([accountPolicy.isAllowed, ipLogger.log, accountController.readDB], accountController.read);
    app.route('/api/account/edit-profile').put([accountPolicy.isAllowed, ipLogger.log, accountController.readDB], accountController.read);

    // GET gets user's change password information
    // PUT updates user's password
	// format /api/change-password
    app.route('/api/account/change-password').get([accountPolicy.isAllowed, ipLogger.log, accountController.readDB], accountController.read);
    app.route('/api/account/change-password').put([accountPolicy.isAllowed, ipLogger.log, accountController.readDB], accountController.read);

    // GET gets user's hub information
    // PUT updates user's hub information
	// format /api/hub
    app.route('/api/account/hub').get([accountPolicy.isAllowed, ipLogger.log, accountController.readDB], accountController.read);
    app.route('/api/account/hub').put([accountPolicy.isAllowed, ipLogger.log, accountController.readDB], accountController.read);

    // GET gets user's membership information
    // PUT updates user's membership settings
	// format /api/membership
    app.route('/api/account/membership').get([accountPolicy.isAllowed, ipLogger.log, accountController.readDB], accountController.read);
    app.route('/api/account/membership').put([accountPolicy.isAllowed, ipLogger.log, accountController.readDB], accountController.read);

    // GET gets user's notifications information
    // PUT updates user's notification settings
	// format /api/notifications
    app.route('/api/account/notifications').get([accountPolicy.isAllowed, ipLogger.log, accountController.readDB], accountController.read);
    app.route('/api/account/notifications').put([accountPolicy.isAllowed, ipLogger.log, accountController.readDB], accountController.read);
};