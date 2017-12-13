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
    // the ability to create requests/promises
    requestPromise = require('request-promise'),
    // the path to airport codes
    airportCodesDetailsPath = './modules/account/server/data/airports.json',
    // airport codes
    airportCodes = [],
    // the path to airlines
    airlinesDetailsPath = './modules/account/server/data/airlines.json',
    // airlines
    airlines = [],
    // the path to the file details for this view
    flightsDetailsPath = path.join(__dirname, '../data/flights.json'),
    // the file details for this view
    flightsDetails = {};

/**
 * Show the current page
 */
exports.read = function (req, res) {
    // send data
    res.json({ 'd': flightsDetails });
};

/**
 * Gets the airline data
 */
exports.readAirlines = function (req, res) {
    // send data
    res.json({ 'd': airlines });
};

/**
 * Gets the airport data
 */
exports.readAirports = function (req, res) {
    // send data
    res.json({ 'd': airportCodes });
};

/**
 * Searches available flights
 */
exports.searchFlights = function (req, res) {
    // send data
    res.json({ 'd': flightsDetails });
};

/**
 * Read the DB middleware
 */
exports.readDB = function (req, res, next) {
    // holds the needed number of completed reads
    var needCompleted = 3;
    
    // holds the number of completed reads
    var completed = 0;

    // check if file exists
    fs.stat(flightsDetailsPath, function(err, stats) {
        // if the file exists
        if (stats.isFile()) {
            // read content
            fs.readFile(flightsDetailsPath, 'utf8', (err, data) => {
                // if error occurred
                if (err) {
                    // send internal error
                    res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                    console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                }
                else {
                    try {
                        // read content
                        flightsDetails = JSON.parse(data);

                        // increase the count
                        completed++;
            
                        // if reached the needed count
                        if(needCompleted == completed) {
                            // go to next
                            next();
                        }
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
            flightsDetails = {};

            // increase the count
            completed++;

            // if reached the needed count
            if(needCompleted == completed) {
                // go to next
                next();
            }
        }
    });

    // create request
    var options = {
        method: 'GET',
        uri: 'https://api.skypicker.com/airlines?',
        headers: {
            'Content-Type': 'application/json; odata=verbose',
            'Accept': 'application/json; odata=verbose'
        },
        json: true
    };

    // submit request to get airlines
    requestPromise(options).then(function (responseA) {
        // read content
        airlines = responseA;

        // increase the count
        completed++;
        
        // if reached the needed count
        if(needCompleted == completed) {
            // go to next
            next();
        }
    }).catch(function (responseA) {
        // attempt to get local airline config
        
        // check if file exists
        fs.stat(airlinesDetailsPath, function(err, stats) {
            // if the file exists
            if (stats.isFile()) {
                // read content
                fs.readFile(airlinesDetailsPath, 'utf8', (err, data) => {
                    // if error occurred
                    if (err) {
                        // send internal error
                        res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                        console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                    }
                    else {
                        try {
                            // read content
                            airlines = JSON.parse(data);

                            // increase the count
                            completed++;
                            
                            // if reached the needed count
                            if(needCompleted == completed) {
                                // go to next
                                next();
                            }
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
                airlines = [];

                // increase the count
                completed++;
                
                // if reached the needed count
                if(needCompleted == completed) {
                    // go to next
                    next();
                }
            }
        });
    });

    // check if file exists
    fs.stat(airportCodesDetailsPath, function(err, stats) {
        // if the file exists
        if (stats.isFile()) {
            // read content
            fs.readFile(airportCodesDetailsPath, 'utf8', (err, data) => {
                // if error occurred
                if (err) {
                    // send internal error
                    res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                    console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                }
                else {
                    try {
                        // read content
                        airportCodes = JSON.parse(data);

                        // increase the count
                        completed++;
                        
                        // if reached the needed count
                        if(needCompleted == completed) {
                            // go to next
                            next();
                        }
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
            airportCodes = [];

            // increase the count
            completed++;
            
            // if reached the needed count
            if(needCompleted == completed) {
                // go to next
                next();
            }
        }
    });
};