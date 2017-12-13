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
    // the ability to create requests/promises
    requestPromise = require('request-promise'),
    // the helper functions
    helpers = require(path.resolve('./config/lib/global-model-helpers')),
    // the path to credit card types
    ccTypesDetailsPath = path.join(__dirname, '../data/ccTypes.json'),
    // valid credit card types
    validCCTypes = [],
    // the path to airport codes
    airportCodesDetailsPath = path.join(__dirname, '../data/airports.json'),
    // airport codes
    airportCodes = [],
    // the path to airlines
    airlinesDetailsPath = path.join(__dirname, '../data/airlines.json'),
    // airlines
    airlines = [],
    // the path to the file details for this view
    accountDetailsPath = path.join(__dirname, '../data/account.json'),
    // the file details for this view
    accountDetails = {},
    // the Payment Type model
    PaymentType = require(path.resolve('./modules/account/server/models/model-payment-type')),
    // the Tier model
    Tier = require(path.resolve('./modules/account/server/models/model-tier')),
    // the User model
    User = require(path.resolve('./modules/account/server/models/model-user'));

/**
 * Show the current page
 */
exports.read = function (req, res) {
    // send data
    res.json({ 'd': accountDetails });
};

/**
 * Get the profile details
 */
exports.readProfile = function (req, res) {
    // create safe profile object
    var user = User.toObject(req.user, { 'hide': 'tierId billingCycle nextBillingDate subscribed hubs maxHubs airlinePreferences airlineNonPreferences passwordUpdatedLast notificationNews notificationReminderEmail notificationResearch notificationReminderSMS paymentInfo' });

    // send data
    res.json({ 'd': user });
};

/**
 * Updates the profile details
 */
exports.updateProfile = function (req, res) {
    // create the updated values object
    var updatedValues = {
        'firstName': _.has(req.body, 'firstName') ? req.body.firstName : undefined,
        'lastName': _.has(req.body, 'lastName') ? req.body.lastName : undefined,
        'sex': _.has(req.body, 'sex') ? req.body.sex.toLowerCase() : undefined,
        'phone': _.has(req.body, 'phone') ? req.body.phone : undefined,
        'email': _.has(req.body, 'email') ? req.body.email : undefined
    };

    // remove all undefined members
    helpers.removeUndefinedMembers(updatedValues);

    // if there is something to update
    if(Object.keys(updatedValues).length > 0) {
        // if first name
        if(updatedValues.firstName) {
            req.checkBody('firstName', 'First name must contain only letters.').onlyContainsAlphaCharacters();
        }

        // if last name
        if(updatedValues.lastName) {
            req.checkBody('lastName', 'Last name must contain only letters.').onlyContainsAlphaCharacters();
        }

        // validate errors
        req.getValidationResult().then(function(errors) {
            // if any errors exists
            if(!errors.isEmpty()) {
                // holds all the errors in one text
                var errorText = '';

                // add all the errors
                for(var x = 0; x < errors.array().length; x++) {
                    // if not the last error
                    if(x < errors.array().length - 1) {
                        errorText += errors.array()[x].msg + '\r\n';
                    }
                    else {
                        errorText += errors.array()[x].msg;
                    }
                }

                // send bad request
                res.status(400).send({ title: errorHandler.getErrorTitle({ code: 400 }), message: errorText });
            } 
            else {
                // update the values
                User.update(req.user, updatedValues, function(err, updatedUser) {
                    // if an error occurred
                    if (err) {
                        // send internal error
                        res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                        console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                    }
                    else if (updatedUser) {
                        // create the safe user object
                        var safeUserObj = createUserReqObject(updatedUser);

                        // set the updated object
                        var p = req.user.paymentInfo;
                        req.user = safeUserObj;
                        req.user.paymentInfo = p;

                        // read the profile
                        module.exports.readProfile(req, res);
                    }
                    else {
                        // send internal error
                        res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                        console.log(clc.error(`In ${path.basename(__filename)} \'updateProfile\': ` + errorHandler.getGenericErrorMessage({ code: 500 }) + ' Couldn\'t update User.'));
                    }
                });
            }
        });
    }
    else {
        // read the profile
        module.exports.readProfile(req, res);
    }
};

/**
 * Updates password
 */
exports.updatePassword = function (req, res, next) {
    // validate existence
    req.checkBody('oldPassword', 'Old password is required.').notEmpty();
    req.checkBody('newPassword', 'New password is required.').notEmpty();
    req.checkBody('newPassword', `Please enter a passphrase or password with ${config.shared.owasp.minLength} or more characters, numbers, lowercase, uppercase, and special characters.`).isStrongPassword();
    req.checkBody('confirmedPassword', 'Confirmed password is required.').notEmpty();
    req.checkBody('confirmedPassword', 'Confirmed password should be equal to new password.').isEqual(req.body.newPassword);

    // validate errors
    req.getValidationResult().then(function(errors) {
        // if any errors exists
        if(!errors.isEmpty()) {
            // holds all the errors in one text
            var errorText = '';

            // add all the errors
            for(var x = 0; x < errors.array().length; x++) {
                // if not the last error
                if(x < errors.array().length - 1) {
                    errorText += errors.array()[x].msg + '\r\n';
                }
                else {
                    errorText += errors.array()[x].msg;
                }
            }

            // send bad request
            res.status(400).send({ title: errorHandler.getErrorTitle({ code: 400 }), message: errorText });
        } 
        else {
            // find user based on id
            User.findById(req.user._id, function(err, foundUser) {
                // if error occurred occurred
                if (err) {
                    // return error
                    return next(err);
                }
                // if user was found
                else if(foundUser) {
                    // compare current password equality
                    User.comparePassword(foundUser, req.body.oldPassword, function(err, isMatch) {
                        // if error occurred occurred
                        if (err) {
                            // send internal error
                            res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                            console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                        }
                        else if(!isMatch) {
                            // return error
                            res.json({ 'd': { error: true, title: errorHandler.getErrorTitle({ code: 200 }), message: 'Current password does not match.' } });
                        }
                        else {
                            // check if user entered a previous password
                            User.compareLastPasswords(foundUser, req.body.newPassword, function(err, isPastPassword) {
                                // if error occurred occurred
                                if (err) {
                                    // send internal error
                                    res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                                    console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                                }
                                else if(isPastPassword) {
                                    // return error
                                    res.json({ 'd': { error: true, title: errorHandler.getErrorTitle({ code: 200 }), message: 'This password was used within the last 5 password changes. Please choose a different one.' } });
                                }
                                else {
                                    // create the updated values object
                                    var updatedValues = {
                                        'password': req.body.newPassword
                                    };

                                    // update user
                                    User.update(foundUser, updatedValues, function(err, updatedUser) {
                                        // if error occurred occurred
                                        if (err) {
                                            // send internal error
                                            res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                                            console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                                        }
                                        else if(updatedUser) {
                                            // create the safe user object
                                            var safeUserObj = createUserReqObject(updatedUser);

                                            // set the updated object
                                            var p = req.user.paymentInfo;
                                            req.user = safeUserObj;
                                            req.user.paymentInfo = p;

                                            // return password changed
                                            res.json({ 'd': { title: errorHandler.getErrorTitle({ code: 200 }), message: errorHandler.getGenericErrorMessage({ code: 200 }) + ' Successful password change.' } });
                                        }
                                        else {
                                            // send internal error
                                            res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                                            console.log(clc.error(`In ${path.basename(__filename)} \'changePassword\': ` + errorHandler.getGenericErrorMessage({ code: 500 }) + ' Couldn\'t update User.'));
                                        }
                                    });
                                }
                            });
                        }
                    });	
                }
                else {
                    // send internal error
                    res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                    console.log(clc.error(`In ${path.basename(__filename)} \'changePassword\': ` + errorHandler.getGenericErrorMessage({ code: 500 }) + ' Couldn\'t find User.'));
                }
            });
        }
    });
};

/**
 * Get the payment information
 */
exports.readPayment = function (req, res) {
    // create safe profile object
    var user = User.toObject(req.user, { 'hide': 'created displayName firstName lastName sex email phone lastLogin tierId billingCycle nextBillingDate subscribed hubs maxHubs airlinePreferences airlineNonPreferences passwordUpdatedLast notificationNews notificationReminderEmail notificationResearch notificationReminderSMS' });

    // if card on file
    if(user.paymentInfo) {
        // set up some additional data
        user.paymentInfo.cardOnFile = true;
        delete user.paymentInfo._id;

        // merge payment info with main user object and delete nested object
        _.merge(user, user.paymentInfo);
        delete user.paymentInfo;
    }

    // send data
    res.json({ 'd': user });
};

/**
 * Updates the payment information
 */
exports.updatePayment = function (req, res) {
    // get next valid date
    var nextValidMonthYear = new Date();
    nextValidMonthYear.setMonth(nextValidMonthYear.getMonth() + 1);
    var minMonth = nextValidMonthYear.getMonth();
    minMonth++;
    minMonth = minMonth < 10 ? `0${minMonth.toString()}` : minMonth.toString();

    // get the next 5 years based on the next valid date
    var fiveComing = new Date(nextValidMonthYear);
    fiveComing.setFullYear(fiveComing.getFullYear() + 5);
    var acceptableDateRangeForExpiration = { 
        'minMonth': parseInt(minMonth), 
        'maxMonth': 12, 
        'minYear': parseInt(nextValidMonthYear.getFullYear().toString().substring(2)), 
        'maxYear': parseInt(fiveComing.getFullYear().toString().substring(2))
    };

    // validate existence
    req.checkBody('number', 'You must have a credit card number.').notEmpty();
    req.checkBody('number', 'Credit card number must be in string format of 16 digits.').isString();
    req.checkBody('number', 'Invalid Credit card number.').isValidCC(validCCTypes);
    req.checkBody('expiration', 'You must have the expirtation date.').notEmpty();
    req.checkBody('expiration', 'Expirtation date needs to be in the string format of MMYY.').isString();
    req.checkBody('expiration', 'Expirtation date is not 4 digits in the format of MMYY.').isOfLength(4);
    req.checkBody('expiration', `Expirtation date is not a valid date (must be the minumum date ${acceptableDateRangeForExpiration.minMonth}/${acceptableDateRangeForExpiration.minYear} and maximum date ${acceptableDateRangeForExpiration.maxMonth}/${acceptableDateRangeForExpiration.maxYear} ).`).isValidExpMonthYear(acceptableDateRangeForExpiration);
    req.checkBody('name', 'You must have name of the holder.').notEmpty();
    req.checkBody('name', 'You must have name of the holder.').isString();
    req.checkBody('ccv', 'You must have the CCV number.').notEmpty();
    req.checkBody('ccv', 'CCV number must be in string format of 3 digits.').isString();
    req.checkBody('ccv', 'CCV number is not 3 digits.').isOfLength(3);

    // validate errors
    req.getValidationResult().then(function(errors) {
        // if any errors exists
        if(!errors.isEmpty()) {
            // holds all the errors in one text
            var errorText = '';

            // add all the errors
            for(var x = 0; x < errors.array().length; x++) {
                // if not the last error
                if(x < errors.array().length - 1) {
                    errorText += errors.array()[x].msg + '\r\n';
                }
                else {
                    errorText += errors.array()[x].msg;
                }
            }

            // send bad request
            res.status(400).send({ title: errorHandler.getErrorTitle({ code: 400 }), message: errorText });
        }
        else {
            // holds the type of card
            var type = null;

            // go through each valid credit card types and test validity
            _.forEach(validCCTypes, function(value) {
                // if valid for this type
                if(value.regex.test(req.body.number)) {
                    type = value.type;
                    return;
                }
            });

            // if type wasn't found
            if(!type) {
                // send internal error
                res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                console.log(clc.error(`In ${path.basename(__filename)} \'updatePayment\': ` + errorHandler.getGenericErrorMessage({ code: 500 }) + ' Couldn\'t get credit card type.'));
            }
            else {
                // create the updated values object
                var updatedValues = {
                    'userId': req.user._id,
                    'type': type,
                    'number': req.body.number,
                    'expiration': req.body.expiration,
                    'name': req.body.name,
                    'ccv': req.body.ccv
                };

                // if there was a previous payment
                if(req.user.paymentInfo) {
                    // update the values
                    PaymentType.update(req.user.paymentInfo, updatedValues, function(err, updatedPayment) {
                        // if an error occurred
                        if (err) {
                            // send internal error
                            res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                            console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                        }
                        else if (updatedPayment) {
                            // create the safe payment type object
                            var safePaymentObj = createPaymentTypeReqObject(updatedPayment);

                            // set the updated object
                            req.user.paymentInfo = safePaymentObj;

                            // read the payment
                            module.exports.readPayment(req, res);
                        }
                        else {
                            // send internal error
                            res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                            console.log(clc.error(`In ${path.basename(__filename)} \'updatePayment\': ` + errorHandler.getGenericErrorMessage({ code: 500 }) + ' Couldn\'t update Payment Type.'));
                        }
                    });
                }
                else {
                    // save the values
                    PaymentType.save(updatedValues, function(err, savedPayment) {
                        // if an error occurred
                        if (err) {
                            // send internal error
                            res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                            console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                        }
                        else if (savedPayment) {
                            // create the safe payment type object
                            var safePaymentObj = createPaymentTypeReqObject(savedPayment);

                            // set the updated object
                            req.user.paymentInfo = safePaymentObj;

                            // read the payment
                            module.exports.readPayment(req, res);
                        }
                        else {
                            // send internal error
                            res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                            console.log(clc.error(`In ${path.basename(__filename)} \'updatePayment\': ` + errorHandler.getGenericErrorMessage({ code: 500 }) + ' Couldn\'t save Payment Type.'));
                        }
                    });
                }
            }
        }
    });
};

/**
 * Get the hub details
 */
exports.readHubs = function (req, res) {
    // create safe profile object
    var user = User.toObject(req.user, { 'hide': 'created displayName firstName lastName sex email phone lastLogin billingCycle nextBillingDate passwordUpdatedLast airlinePreferences airlineNonPreferences notificationNews notificationReminderEmail notificationResearch notificationReminderSMS paymentInfo' });
    
    // current position
    var pos = 0;

    // loop through all hubs
    _.forEach(user.hubs, function(value) {
        // determines if this hub was the main hub
        var wasMain = value.main;
        delete value.main;

        // get the airport
        var index = _.findIndex(airportCodes, value);

        // set airport
        var airport = index != -1 ? airportCodes[index] : null;

        // redefine the hub to save
        user.hubs[pos] = _.cloneDeep(airport);
        delete user.hubs[pos].id;

        // set back main
        wasMain ? user.hubs[pos].main = true : null;
        
        // increase to next position
        pos++;
    });

    // send data
    res.json({ 'd': user });
};

/**
 * Adds/Updates the hub
 */
exports.upsertHub = function (req, res) {
    // validate existence
    req.checkBody('newHub', `New Hub is not a valid location. Must have key of iata or icao.`).notEmpty();
    req.checkBody('newHub.iata', `${req.body.newHub.iata} is not a valid location. Must have key of iata in string format.`).isString();
    req.checkBody('newHub.icao', `${req.body.newHub.icao} is not a valid location. Must have key of icao in string format.`).isString();
    req.checkBody('newHub', `There is no airport based on this this location '${req.body.newHub.iata}' & '${req.body.newHub.icao}'.`).existsInArray(airportCodes);

    // if there is an old hub
    if(req.body.oldHub && (req.body.oldHub.iata != '' || req.body.oldHub.icao != '')) {
        // validate existence
        req.checkBody('oldHub', `Old Hub is not a valid location. Must have key of iata or icao.`).notEmpty();
        req.checkBody('oldHub.iata', `${req.body.oldHub.iata} is not a valid location. Must have key of iata in string format.`).isString();
        req.checkBody('oldHub.icao', `${req.body.oldHub.icao} is not a valid location. Must have key icao in string format.`).isString();
        req.checkBody('oldHub', `There is no airport based on this this location '${req.body.oldHub.iata}' & '${req.body.oldHub.icao}'.`).existsInArray(airportCodes);
    }

    // validate errors
    req.getValidationResult().then(function(errors) {
        // if any errors exists
        if(!errors.isEmpty()) {
            // holds all the errors in one text
            var errorText = '';

            // add all the errors
            for(var x = 0; x < errors.array().length; x++) {
                // if not the last error
                if(x < errors.array().length - 1) {
                    errorText += errors.array()[x].msg + '\r\n';
                }
                else {
                    errorText += errors.array()[x].msg;
                }
            }

            // send bad request
            res.status(400).send({ title: errorHandler.getErrorTitle({ code: 400 }), message: errorText });
        }
        else {
            // initialize new hub
            var newHub = {
                'iata': req.body.newHub.iata.toUpperCase(),
                'icao': req.body.newHub.icao.toUpperCase()
            };

            // initialize new hub
            var oldHub = null;

            // holds the index of old/new hubs
            var oldIndex = -1,
                newIndex = _.findIndex(req.user.hubs, newHub);

            // if there is an old hub
            if(req.body.oldHub && (req.body.oldHub.iata != '' || req.body.oldHub.icao != '')) {
                oldHub = {
                    'iata': req.body.oldHub.iata.toUpperCase(),
                    'icao': req.body.oldHub.icao.toUpperCase()
                };

                // find index of old hub
                oldIndex = _.findIndex(req.user.hubs, oldHub);
            }

            // if there already a hub
            if(newIndex != -1 && oldIndex == -1) {
                // send bad request
                res.status(400).send({ title: errorHandler.getErrorTitle({ code: 400 }), message: 'Cannot have duplicate hubs.' });
            }
            else {
                // get the airport
                var index = _.findIndex(airportCodes, newHub);;

                // set airport
                var airport = index != -1 ? airportCodes[index] : null;
                airport = _.cloneDeep(airport);

                // clone hubs and add
                var hubs = _.cloneDeep(req.user.hubs);

                // if index
                if(oldIndex != -1) {
                    // replace
                    hubs[oldIndex] = {
                        'iata': airport.iata,
                        'icao': airport.icao
                    };
                }
                else {  
                    // add
                    hubs.push({ 'iata': airport.iata, 'icao': airport.icao });
                }

                // if setting as main hub
                if(req.body.newHub.main) {
                    // remove old main hub
                    _.forEach(hubs, function(value) {
                        delete value.main;
                    });

                    // set new main hub
                    oldIndex != -1 ? hubs[oldIndex].main = true : hubs[hubs.length - 1].main = true;
                    airport.main = true;
                }

                // create the updated values object
                var updatedValues = {
                    'hubs': hubs
                };

                // check the length to see if user tried to go over the limit
                if(hubs.length > req.user.maxHubs) {
                    // send bad request
                    res.status(400).send({ title: errorHandler.getErrorTitle({ code: 400 }), message: `Cannot add more than ${req.user.maxHubs} hubs.` });
                }
                else {
                    // update the values
                    User.update(req.user, updatedValues, function(err, updatedUser) {
                        // if an error occurred
                        if (err) {
                            // send internal error
                            res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                            console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                        }
                        else if (updatedUser) {
                            // create the safe user object
                            var safeUserObj = createUserReqObject(updatedUser);

                            // set the updated object
                            var p = req.user.paymentInfo;
                            req.user = safeUserObj;
                            req.user.paymentInfo = p;

                            // recreate the hub location object
                            var hub = _.cloneDeep(airport);
                            delete hub.id;

                            // send data
                            res.json({ 'd': hub });
                        }
                        else {
                            // send internal error
                            res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                            console.log(clc.error(`In ${path.basename(__filename)} \'upsertHub\': ` + errorHandler.getGenericErrorMessage({ code: 500 }) + ' Couldn\'t update User.'));
                        }
                    });
                }
            }
        }
    });
};

/**
 * Deletes the hub
 */
exports.deleteHub = function (req, res) {
    // find the index of the hub to delete
    var index = _.findIndex(req.user.hubs, { 'iata': req.query.iata ? req.query.iata.toUpperCase() : null, 'icao': req.query.icao ? req.query.icao.toUpperCase() : null });

    // if found
    if(index != -1) {
        // clone hubs and remove
        var hubs = _.cloneDeep(req.user.hubs);
        var deletedHub = hubs.splice(index, 1);

        // create the updated values object
        var updatedValues = {
            'hubs': hubs
        };

        // update the values
        User.update(req.user, updatedValues, function(err, updatedUser) {
            // if an error occurred
            if (err) {
                // send internal error
                res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
            }
            else if (updatedUser) {
                // create the safe user object
                var safeUserObj = createUserReqObject(updatedUser);

                // set the updated object
                var p = req.user.paymentInfo;
                req.user = safeUserObj;
                req.user.paymentInfo = p;

                // send data
                res.json({ 'd': { 'hub': deletedHub, title: errorHandler.getErrorTitle({ code: 200 }), message: 'Hub successfully deleted.' } });
            }
            else {
                // send internal error
                res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                console.log(clc.error(`In ${path.basename(__filename)} \'deleteHub\': ` + errorHandler.getGenericErrorMessage({ code: 500 }) + ' Couldn\'t update User.'));
            }
        });
    }
    else {
        // send not found
        res.json({ 'd': { error: true, title: errorHandler.getErrorTitle({ code: 404 }), message: 'Hub not found.' } });
    };
};

/**
 * Gets airline preferences
 */
exports.readAirlinePreferences = function (req, res) {
    // create safe profile object
    var user = User.toObject(req.user, { 'hide': 'created displayName firstName lastName sex email phone lastLogin tierId billingCycle nextBillingDate subscribed passwordUpdatedLast hubs maxHubs  notificationNews notificationReminderEmail notificationResearch notificationReminderSMS paymentInfo' });
    user.maxPreferences = 5;
    user.maxNonPreferences = 5;

    // current position
    var pos = 0;

    // go through all values and check if airline exists
    _.forEach(user.airlinePreferences, function(value) {
        // find index
        var index = _.findIndex(airlines, { 'id': value });

        // set airline
        var airline = index != -1 ? airlines[index] : null;
        user.airlinePreferences[pos] = _.cloneDeep(airline);

        // increase to next position
        pos++;
    });

    // reset
    pos = 0;

    // go through all values and check if airline exists
    _.forEach(user.airlineNonPreferences, function(value) {
        // find index
        var index = _.findIndex(airlines, { 'id': value });

        // set airline
        var airline = index != -1 ? airlines[index] : null;
        user.airlinePreferences[pos] = _.cloneDeep(airline);

        // increase to next position
        pos++;
    });

    // send data
    res.json({ 'd': user });
};

/**
 * Updates the airline preferences
 */
exports.updateAirlinePreferences = function (req, res) {
    // validate existence
    req.checkBody('airlinePreferences', 'You must have your airport preferences.').exists();
    req.checkBody('airlineNonPreferences', 'You must have your non airport preferences.').exists();

    // validate errors
    req.getValidationResult().then(function(errors) {
        // if any errors exists
        if(!errors.isEmpty()) {
            // holds all the errors in one text
            var errorText = '';

            // add all the errors
            for(var x = 0; x < errors.array().length; x++) {
                // if not the last error
                if(x < errors.array().length - 1) {
                    errorText += errors.array()[x].msg + '\r\n';
                }
                else {
                    errorText += errors.array()[x].msg;
                }
            }

            // send bad request
            res.status(400).send({ title: errorHandler.getErrorTitle({ code: 400 }), message: errorText });
        }
        else {
            // create the updated values object
            var updatedValues = {
                'airlinePreferences': req.body.airlinePreferences,
                'airlineNonPreferences': req.body.airlineNonPreferences
            };

            // the found preferences/non preferences
            var foundPreferences = [];
            var foundNonPreferences = [];

            // go through all values and check if airport exists
            _.forEach(updatedValues.airlinePreferences, function(value) {
                // find index
                var index = _.findIndex(airlines, { 'id': value });

                // if index found
                if(index != -1) {
                    foundPreferences.push(value);
                }
            });

            // go through all values and check if airport exists
            _.forEach(updatedValues.airlineNonPreferences, function(value) {
                // find index
                var index = _.findIndex(airlines, { 'id': value });

                // if index found
                if(index != -1) {
                    foundNonPreferences.push(value);
                }
            });

            // update values
            updatedValues.airlinePreferences = foundPreferences;
            updatedValues.airlineNonPreferences = foundNonPreferences;

            // update the values
            User.update(req.user, updatedValues, function(err, updatedUser) {
                // if an error occurred
                if (err) {
                    // send internal error
                    res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                    console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                }
                else if (updatedUser) {
                    // create the safe user object
                    var safeUserObj = createUserReqObject(updatedUser);

                    // set the updated object
                    var p = req.user.paymentInfo;
                    req.user = safeUserObj;
                    req.user.paymentInfo = p;

                    // read the airline preferences
                    module.exports.readAirlinePreferences(req, res);
                }
                else {
                    // send internal error
                    res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                    console.log(clc.error(`In ${path.basename(__filename)} \'updateNotifications\': ` + errorHandler.getGenericErrorMessage({ code: 500 }) + ' Couldn\'t update User.'));
                }
            });
        }
    });
};

/**
 * Get the membership details
 */
exports.readMembership = function (req, res) {
    // create safe profile object
    var user = User.toObject(req.user, { 'hide': 'created displayName firstName lastName sex email phone lastLogin passwordUpdatedLast hubs maxHubs airlinePreferences airlineNonPreferences notificationNews notificationReminderEmail notificationResearch notificationReminderSMS' });

    // send data
    res.json({ 'd': user });
};

/**
 * Changes the membership details
 */
exports.changeMembership = function (req, res) {
    // get next valid date
    var nextValidMonthYear = new Date();
    nextValidMonthYear.setMonth(nextValidMonthYear.getMonth() + 1);
    var minMonth = nextValidMonthYear.getMonth();
    minMonth++;
    minMonth = minMonth < 10 ? `0${minMonth.toString()}` : minMonth.toString();

    // get the next 5 years based on the next valid date
    var fiveComing = new Date(nextValidMonthYear);
    fiveComing.setFullYear(fiveComing.getFullYear() + 5);
    var acceptableDateRangeForExpiration = { 
        'minMonth': parseInt(minMonth), 
        'maxMonth': 12, 
        'minYear': parseInt(nextValidMonthYear.getFullYear().toString().substring(2)), 
        'maxYear': parseInt(fiveComing.getFullYear().toString().substring(2))
    };

    // validate existence
    req.checkBody('number', 'You must have a credit card number.').notEmpty();
    req.checkBody('number', 'Credit card number must be in string format of 16 digits.').isString();
    req.checkBody('number', 'Invalid Credit card number.').isValidCC(validCCTypes);
    req.checkBody('expiration', 'You must have the expirtation date.').notEmpty();
    req.checkBody('expiration', 'Expirtation date needs to be in the string format of MMYY.').isString();
    req.checkBody('expiration', 'Expirtation date is not 4 digits in the format of MMYY.').isOfLength(4);
    req.checkBody('expiration', `Expirtation date is not a valid date (must be the minumum date ${acceptableDateRangeForExpiration.minMonth}/${acceptableDateRangeForExpiration.minYear} and maximum date ${acceptableDateRangeForExpiration.maxMonth}/${acceptableDateRangeForExpiration.maxYear} ).`).isValidExpMonthYear(acceptableDateRangeForExpiration);
    req.checkBody('ccv', 'You must have the CCV number.').notEmpty();
    req.checkBody('ccv', 'CCV number must be in string format of 3 digits.').isString();
    req.checkBody('ccv', 'CCV number is not 3 digits.').isOfLength(3);

    // validate errors
    req.getValidationResult().then(function(errors) {
        // if any errors exists
        if(!errors.isEmpty()) {
            // holds all the errors in one text
            var errorText = '';

            // add all the errors
            for(var x = 0; x < errors.array().length; x++) {
                // if not the last error
                if(x < errors.array().length - 1) {
                    errorText += errors.array()[x].msg + '\r\n';
                }
                else {
                    errorText += errors.array()[x].msg;
                }
            }

            // send bad request
            res.status(400).send({ title: errorHandler.getErrorTitle({ code: 400 }), message: errorText });
        }
        else {
            // TODO: if user has membership and is currently subscribed, charge them only the difference, else create new

            // verify tier id is valid
            Tier.findById(req.body.tierId, function(err, foundTier) {
                // if an error occurred
                if (err) {
                    // send internal error
                    res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                    console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                }
                else if (foundTier) {
                    // billing cycle start/end
                    var billingCycleStart = new Date();
                    var billingCycleEnd = new Date();
                    var nextBillingDate = new Date();
                    billingCycleEnd.setMonth(billingCycleEnd.getMonth() + 1);
                    billingCycleEnd.setDate(billingCycleEnd.getDate() - 1);
                    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                    
                    // create the updated values object
                    var updatedValues = {
                        '_id': req.user._id,
                        'tierId': req.body.tierId,
                        'subscribed': true,
                        'billingCycle': { 'start': billingCycleStart, 'end': billingCycleEnd },
                        'nextBillingDate': nextBillingDate,
                        'maxHubs': foundTier.maxHubs
                    };

                    // check the length to see if new membership has correct hub length (-1 means unlimited)
                    if(req.user.hubs.length > foundTier.maxHubs && foundTier.maxHubs != -1) {
                        // holds the number of hubs to drop
                        var numToDrop = req.user.hubs.length - foundTier.maxHubs;

                        // copy arry
                        updatedValues.hubs = _.cloneDeep(req.user.hubs);

                        // cut down the hubs to appropriate length
                        updatedValues.hubs = _.dropRight(updatedValues.hubs, numToDrop);
                    }

                    // update the values
                    User.update(req.user, updatedValues, function(err, updatedUser) {
                        // if an error occurred
                        if (err) {
                            // send internal error
                            res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                            console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                        }
                        else if (updatedUser) {
                            // create the safe user object
                            var safeUserObj = createUserReqObject(updatedUser);

                            // set the updated object
                            var p = req.user.paymentInfo;
                            req.user = safeUserObj;
                            req.user.paymentInfo = p;

                            // read the membership
                            module.exports.readMembership(req, res);
                        }
                        else {
                            // send internal error
                            res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                            console.log(clc.error(`In ${path.basename(__filename)} \'changeMembership\': ` + errorHandler.getGenericErrorMessage({ code: 500 }) + ' Couldn\'t update User.'));
                        }
                    });
                }
                else {
                    // send bad request
                    res.status(400).send({ title: errorHandler.getErrorTitle({ code: 400 }), message: 'Not a valid membership level' });
                }
            });
        }
    });
};

/**
 * Cancels the membership
 */
exports.cancelMembership = function (req, res) {
    // get the current membership
    var currentMembership = req.user.tierId;

    // if there is a current membership
    if(currentMembership) {
        // create the updated values object
        var updatedValues = {
            'subscribed': false,
            'billingCycle': null,
            'nextBillingDate': null
        };

        // update the values
        User.update(req.user, updatedValues, function(err, updatedUser) {
            // if an error occurred
            if (err) {
                // send internal error
                res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
            }
            else if (updatedUser) {
                // create the safe user object
                var safeUserObj = createUserReqObject(updatedUser);

                // set the updated object
                var p = req.user.paymentInfo;
                req.user = safeUserObj;
                req.user.paymentInfo = p;

                // read the membership
                module.exports.readMembership(req, res);
            }
            else {
                // send internal error
                res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                console.log(clc.error(`In ${path.basename(__filename)} \'cancelMembership\': ` + errorHandler.getGenericErrorMessage({ code: 500 }) + ' Couldn\'t update User.'));
            }
        });
    }
    else {
        // send bad request
        res.json({ 'd': { error: true, title: errorHandler.getErrorTitle({ code: 400 }), message: 'There is no current membership to be canceled.' } });
    }
};

/**
 * Get the notification details
 */
exports.readNotifications = function (req, res) {
    // create safe profile object
    var user = User.toObject(req.user, { 'hide': 'created displayName firstName lastName sex email phone lastLogin tierId billingCycle nextBillingDate subscribed passwordUpdatedLast hubs maxHubs airlinePreferences airlineNonPreferences paymentInfo' });

    // send data
    res.json({ 'd': user });
};

/**
 * Updates the notification details
 */
exports.updateNotifications = function (req, res) {
    // create the updated values object
    var updatedValues = {
        'notificationNews': req.body.notificationNews,
        'notificationReminderEmail': req.body.notificationReminderEmail,
        'notificationResearch': req.body.notificationResearch,
        'notificationReminderSMS': req.body.notificationReminderSMS
    };

    // remove all undefined members
    helpers.removeUndefinedMembers(updatedValues);

    // if there is something to update
    if(Object.keys(updatedValues).length > 0) {
        // update the values
        User.update(req.user, updatedValues, function(err, updatedUser) {
            // if an error occurred
            if (err) {
                // send internal error
                res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
            }
            else if (updatedUser) {
                // create the safe user object
                var safeUserObj = createUserReqObject(updatedUser);

                // set the updated object
                var p = req.user.paymentInfo;
                req.user = safeUserObj;
                req.user.paymentInfo = p;

                // read the notifications
                module.exports.readNotifications(req, res);
            }
            else {
                // send internal error
                res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                console.log(clc.error(`In ${path.basename(__filename)} \'updateNotifications\': ` + errorHandler.getGenericErrorMessage({ code: 500 }) + ' Couldn\'t update User.'));
            }
        });
    }
    else {
        // read the notifications
        module.exports.readNotifications(req, res);
    }
};

/**
 * Read the DB middleware
 */
exports.readDB = function (req, res, next) {
    // holds the needed number of completed reads
    var needCompleted = 4;

    // holds the number of completed reads
    var completed = 0;

    // check if file exists
    fs.stat(accountDetailsPath, function(err, stats) {
        // if the file exists
        if (stats.isFile()) {
            // read content
            fs.readFile(accountDetailsPath, 'utf8', (err, data) => {
                // if error occurred
                if (err) {
                    // send internal error
                    res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                    console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                }
                else {
                    try {
                        // read content
                        accountDetails = JSON.parse(data);

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
            accountDetails = {};

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

    // check if file exists
    fs.stat(ccTypesDetailsPath, function(err, stats) {
        // if the file exists
        if (stats.isFile()) {
            // read content
            fs.readFile(ccTypesDetailsPath, 'utf8', (err, data) => {
                // if error occurred
                if (err) {
                    // send internal error
                    res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                    console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                }
                else {
                    try {
                        // read content
                        validCCTypes = JSON.parse(data);

                        // go through each cc and transform regex to regex object
                        _.forEach(validCCTypes, function(value) {
                            value.regex = new RegExp(value.regex);
                        });

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
            validCCTypes = [];

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

// creates the safe user object to set in the request
function createUserReqObject(user) {
    // clone to not overwrite
    var safeObj = _.cloneDeep(user);

    // save the id since it will be lost when going to object
    // hide the information for security purposes
    var id = safeObj._id;
    safeObj = User.toObject(safeObj, { 'hide': 'password lastPasswords internalName created' });
    safeObj._id = id;

    // return the safe obj
    return safeObj;
};

// creates the safe payment type object to set in the request
function createPaymentTypeReqObject(pt) {
    // clone to not overwrite
    var safeObj = _.cloneDeep(pt);

    // save the id since it will be lost when going to object
    // hide the information for security purposes
    var id = safeObj._id;
    safeObj = PaymentType.toObject(safeObj, { 'hide': 'created internalName userId' });
    safeObj._id = id;

    // return the safe obj
    return safeObj;
};