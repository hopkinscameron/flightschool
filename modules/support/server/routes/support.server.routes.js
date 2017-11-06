'use strict';

/**
 * Module dependencies
 */
var // the path
    path = require('path'),
    // the ip logger
    ipLogger = require(path.resolve('./config/lib/ip-logger')),
    // the contact controller to handle routes
    contactController = require('../controllers/contact.server.controller'),
    // the faq controller to handle routes
    faqController = require('../controllers/faq.server.controller');

module.exports = function (app) {
    // GET gets contact page information
	// format /api/support/contact
    app.route('/api/support/contact').get([ipLogger.log, contactController.readDB], contactController.read);

    // GET gets faq page information
	// format /api/support/faq
    app.route('/api/support/faq').get([ipLogger.log, faqController.readDB], faqController.read);
};