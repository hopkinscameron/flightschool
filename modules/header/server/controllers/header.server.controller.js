'use strict';

/**
 * Module dependencies
 */
var // the path
    path = require('path'),
    // the error handler
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    // chalk for console logging
    clc = require(path.resolve('./config/lib/clc')),
    // the file details for this view
    headerDetails = require('../data/header'),
    // the file details for the user view
    headerUserDetails = require('../data/header.user'),
    // the file details for the admin view
    headerAdminDetails = require('../data/header.admin');

/**
 * Show the current page
 */
exports.read = function (req, res) {
    // if user is authenticated in the session get admin header
    if (req.isAuthenticated()) {
        // TODO: remove, used for testing
        var user = true,
            admin = false;

        // if user role
        if(user) {
            // set authenticated
            headerUserDetails.isLoggedIn = true;

            // send data
            res.json({ 'd': headerUserDetails });
        }
        // if admin role
        else if(admin) {
            // set authenticated
            headerAdminDetails.isLoggedIn = true;

            // send data
            res.json({ 'd': headerAdminDetails });
        }
        else {
            // send data
            res.json({ 'd': headerDetails });
        }
    }
    else {
        // send data
        res.json({ 'd': headerDetails });
    }
};