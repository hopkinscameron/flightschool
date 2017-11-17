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
    accountController = require('../controllers/account.server.controller'),
    // the login controller to handle routes
    loginController = require('../controllers/login.server.controller');

module.exports = function (app) {
    // =========================================================================
    // Account Routes ==========================================================
    // =========================================================================
    
    // GET gets account navigation
	// format /api/account
    app.route('/api/account').get([accountPolicy.isAllowed, ipLogger.log, accountController.readDB], accountController.read);



    // =========================================================================
    // Profile Routes ==========================================================
    // =========================================================================

    // GET gets user's edit profile information
    // POST updates user's profile information
	// format /api/edit-profile
    app.route('/api/account/edit-profile').get([accountPolicy.isAllowed, ipLogger.log], accountController.readProfile);
    app.route('/api/account/edit-profile').post([accountPolicy.isAllowed, ipLogger.log], accountController.updateProfile);


    
    // =========================================================================
    // Password Routes =========================================================
    // =========================================================================

    // POST updates user's password
	// format /api/change-password
    app.route('/api/account/change-password').post([accountPolicy.isAllowed, ipLogger.log], accountController.updatePassword);



    // =========================================================================
    // Payment Information Routes ==============================================
    // =========================================================================

    // GET gets user's payment information
    // POST updates user's payment information
    // format /api/payment-information
    app.route('/api/account/payment-information').get([accountPolicy.isAllowed, ipLogger.log], accountController.readPayment);
    app.route('/api/account/payment-information').post([accountPolicy.isAllowed, ipLogger.log], accountController.updatePayment);



    // =========================================================================
    // Hub Routes ==============================================================
    // =========================================================================

    // GET gets user's hub information
    // format /api/hub
    app.route('/api/account/hub').get([accountPolicy.isAllowed, ipLogger.log], accountController.readHubs);

    // POST updates user's home information
    // DELETE deletes user's home information
    // format /api/hub/home
    app.route('/api/account/hub/home').post([accountPolicy.isAllowed, ipLogger.log], accountController.updateHubHome);
    app.route('/api/account/hub/home').delete([accountPolicy.isAllowed, ipLogger.log], accountController.deleteHubHome);

    // POST adds/updates user's hub information
    // format /api/hub/hubs
    app.route('/api/account/hub/hubs').post([accountPolicy.isAllowed, ipLogger.log], accountController.upsertHub);

    // DELETE deletes user's hub information
    // format /api/hub/hubs?iata={iata}&icao={icao}
    app.route('/api/account/hub/hubs').delete([accountPolicy.isAllowed, ipLogger.log], accountController.deleteHub);



    // =========================================================================
    // Membership Routes =======================================================
    // =========================================================================

    // GET gets user's membership information
    // POST changes user's membership settings
    // DELETE changes user's membership settings
	// format /api/membership
    app.route('/api/account/membership').get([accountPolicy.isAllowed, ipLogger.log], accountController.readMembership);
    app.route('/api/account/membership').post([accountPolicy.isAllowed, ipLogger.log], accountController.changeMembership);
    app.route('/api/account/membership').delete([accountPolicy.isAllowed, ipLogger.log], accountController.cancelMembership);


    
    // =========================================================================
    // Notification Routes =====================================================
    // =========================================================================

    // GET gets user's notifications information
    // POST updates user's notification settings
	// format /api/notifications
    app.route('/api/account/notifications').get([accountPolicy.isAllowed, ipLogger.log], accountController.readNotifications);
    app.route('/api/account/notifications').post([accountPolicy.isAllowed, ipLogger.log], accountController.updateNotifications);
};