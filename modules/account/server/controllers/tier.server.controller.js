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
    // the application configuration
    config = require(path.resolve('./config/config')),
    // lodash
    _ = require('lodash'),
    // the file system reader
    fs = require('fs'),
    // the Tier model
    Tier = require(path.resolve('./modules/account/server/models/model-tier'));

/**
 * Show the current page
 */
exports.read = function (req, res) {
    // the tiers
    var tiers = [];

    // get all tiers
    Tier.find({ }, function(err, foundTiers) {
         // if an error occurred
        if (err) {
            // send internal error
            res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
            console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
        }
        else {
            // set the tiers
            tiers = foundTiers;

            // send data
            res.json({ 'd': tiers });
        }
    });
};