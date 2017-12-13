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
    // =========================================================================
    // Account Routes ==========================================================
    // =========================================================================
    
    // GET gets account navigation
	// format /api/account
    app.route('/api/account').all([ipLogger.log, accountPolicy.isAllowed, accountController.readDB])
    .get(accountController.read);



    // =========================================================================
    // Profile Routes ==========================================================
    // =========================================================================

    // GET gets user's edit profile information
    // POST updates user's profile information
	// format /api/edit-profile
    app.route('/api/account/edit-profile').all([ipLogger.log, accountPolicy.isAllowed, accountController.readDB])
    .get(accountController.readProfile)
    .post(accountController.updateProfile);


    
    // =========================================================================
    // Password Routes =========================================================
    // =========================================================================

    // POST updates user's password
	// format /api/change-password
    app.route('/api/account/change-password').all([ipLogger.log, accountPolicy.isAllowed, accountController.readDB])
    .post(accountController.updatePassword);



    // =========================================================================
    // Payment Information Routes ==============================================
    // =========================================================================

    // GET gets user's payment information
    // POST updates user's payment information
    // format /api/payment-information
    app.route('/api/account/payment-information').all([ipLogger.log, accountPolicy.isAllowed, accountController.readDB])
    .get(accountController.readPayment)
    .post(accountController.updatePayment);



    // =========================================================================
    // Hub Routes ==============================================================
    // =========================================================================

    // GET gets user's hub information
    // format /api/hub
    app.route('/api/account/hub').all([ipLogger.log, accountPolicy.isAllowed, accountController.readDB])
    .get(accountController.readHubs);

    // POST adds/updates user's hub information
    // DELETE deletes user's hub information
    // format /api/hub/hubs
    // format /api/hub/hubs?iata={iata}&icao={icao}
    app.route('/api/account/hub/hubs').all([ipLogger.log, accountPolicy.isAllowed, accountController.readDB])
    .post(accountController.upsertHub)
    .delete(accountController.deleteHub);



    // =========================================================================
    // Airline Preferences Routes ==============================================
    // =========================================================================
    
    // GET gets user's airline preferences information
    // POST updates user's airline preferences
	// format /api/airline-preferences
    app.route('/api/account/airline-preferences').all([ipLogger.log, accountPolicy.isAllowed, accountController.readDB])
    .get(accountController.readAirlinePreferences)
    .post(accountController.updateAirlinePreferences);



    // =========================================================================
    // Membership Routes =======================================================
    // =========================================================================

    // GET gets user's membership information
    // POST changes user's membership settings
    // DELETE changes user's membership settings
	// format /api/membership
    app.route('/api/account/membership').all([ipLogger.log, accountPolicy.isAllowed, accountController.readDB])
    .get(accountController.readMembership)
    .post(accountController.changeMembership)
    .delete(accountController.cancelMembership);


    
    // =========================================================================
    // Notification Routes =====================================================
    // =========================================================================

    // GET gets user's notifications information
    // POST updates user's notification settings
	// format /api/notifications
    app.route('/api/account/notifications').all([ipLogger.log, accountPolicy.isAllowed, accountController.readDB])
    .get(accountController.readNotifications)
    .post(accountController.updateNotifications);
};