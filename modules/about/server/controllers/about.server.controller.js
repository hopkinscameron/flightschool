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
    aboutDetailsPath = path.join(__dirname, '../data/about.json'),
    // the file details for this view
    aboutDetails = {};

/**
 * Show the current page
 */
exports.read = function (req, res) {
    // send data
    res.json({ 'd': aboutDetails });
};

/**
 * Read the DB middleware
 */
exports.readDB = function (req, res, next) {
    // check if file exists
    fs.exists(aboutDetailsPath, (exists) => {
        // if the file exists
        if(exists) {
            // read content
            fs.readFile(aboutDetailsPath, 'utf8', (err, data) => {
                // if error occurred
                if (err) {
                    // send internal error
                    res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                    console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                }
                else {
                    try {
                        // read content
                        aboutDetails = JSON.parse(data);

                        // go to next
                        next();
                    }
                    catch (e) {
                        // set error
                        err = e;

                        // send internal error
                        res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                        console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                    }                    
                }
            });
        }
        else {
            // reinitialize
            aboutDetails = {};
        }
    });
};