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
    // the file system reader
    fs = require('fs'),
    // the path to the file details for this view
    headerDetailsPath = path.join(__dirname, '../data/header.json'),
    // the path to the file details for this view
    headerUserDetailsPath = path.join(__dirname, '../data/header-user.json'),
    // the path to the file details for this view
    headerAdminDetailsPath = path.join(__dirname, '../data/header-admin.json'),
    // the file details for this view
    headerDetails = {},
    // the file details for the user view
    headerUserDetails = {},
    // the file details for the admin view
    headerAdminDetails = {};

/**
 * Show the current page
 */
exports.read = function (req, res) {
    // if user is authenticated in the session get admin header
    if (!req.isAuthenticated()) {
        // if user role
        if(req.userRole == 'user') {
            // set authenticated
            headerUserDetails.isLoggedIn = true;

            // send data
            res.json({ 'd': headerUserDetails });
        }
        // if admin role
        else if(req.userRole == 'admin') {
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

/**
 * Read the DB middleware
 */
exports.readDB = function (req, res, next) {
    // if user is authenticated in the session get admin header
    if (!req.isAuthenticated()) {
        // TODO: remove, used for testing
        var user = true,
            admin = false;

        // if user role
        if(user) {
            // TODO: remove, used for testing
            req.userRole = 'user';

            // read file
            readFile(headerUserDetailsPath, function(err, contents) {
                // if error occurred
                if (err) {
                    // send internal error
                    res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                    console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                }
                else {
                    // set the contents
                    headerUserDetails = contents;

                    // go to next
                    next();
                }
            });
        }
        // if admin role
        else if(admin) {
            // TODO: remove, used for testing
            req.userRole = 'admin';

            // read file
            readFile(headerAdminDetailsPath, function(err, contents) {
                // if error occurred
                if (err) {
                    // send internal error
                    res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                    console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                }
                else {
                    // set the contents
                    headerAdminDetails = contents;

                    // go to next
                    next();
                }
            });
        }
        else {
            // read file
            readFile(headerDetailsPath, function(err, contents) {
                // if error occurred
                if (err) {
                    // send internal error
                    res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                    console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                }
                else {
                    // set the contents
                    headerDetails = contents;

                    // go to next
                    next();
                }
            });
        }
    }
    else {
        // read file
        readFile(headerDetailsPath, function(err, contents) {
            // if error occurred
            if (err) {
                // send internal error
                res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
            }
            else {
                // set the contents
                headerDetails = contents;

                // go to next
                next();
            }
        });
    }
};

// read specific file
function readFile(path, callback) {
    // the contents of the file
    var contents = {};

    // check if file exists
    fs.exists(path, (exists) => {
        // if the file exists
        if(exists) {
            // read content
            fs.readFile(path, 'utf8', (err, data) => {
                // if error occurred
                if (err) {
                    // if callback
                    if(callback) {
                        // return error
                        callback(err, null);
                    }
                }
                else {
                    // try parse
                    try {
                        // read content
                        contents = JSON.parse(data);

                        // if callback
                        if(callback) {
                            // return content
                            callback(null, contents);
                        }
                    }
                    catch (e) {
                        // if callback
                        if(callback) {
                            // return content
                            callback(e, null);
                        }
                    }
                }
            });
        }
        else {
            // if callback
            if(callback) {
                // return content
                callback(null, contents);
            }
        }
    });
};