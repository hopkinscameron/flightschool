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
    // lodash
    _ = require('lodash'),
    // the file system reader
    fs = require('fs'),
    // the helper functions
    helpers = require(path.resolve('./config/lib/global-model-helpers')),
    // airport codes
    airportCodes = require('airport-codes').toJSON(),
    // the path to the file details for this view
    accountDetailsPath = path.join(__dirname, '../data/account.json'),
    // the file details for this view
    accountDetails = {},
    // the Payment Transaction model
    PaymentTransaction = require(path.resolve('./modules/account/server/models/model-payment-transaction')),
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
    var user = User.toObject(req.user, { 'hide': 'tierId renewalDate subscribed homeLocation hubs maxHubs passwordUpdatedLast notificationNews notificationReminderEmail notificationResearch notificationReminderSMS' });

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
                req.user = safeUserObj;

                // read the profile
                module.exports.readProfile(req, res);
            }
            else {
                // send internal error
                res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                console.log(clc.error(`In ${path.basename(__filename)} \'updateProfile\': ` + errorHandler.getDetailedErrorMessage({ code: 500 }) + ' Couldn\'t update User.'));
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
                                            req.user = safeUserObj;

                                            // return password changed
                                            res.json({ 'd': { title: errorHandler.getErrorTitle({ code: 200 }), message: errorHandler.getGenericErrorMessage({ code: 200 }) + ' Successful password change.' } });
                                        }
                                        else {
                                            // send internal error
                                            res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                                            console.log(clc.error(`In ${path.basename(__filename)} \'changePassword\': ` + errorHandler.getDetailedErrorMessage({ code: 500 }) + ' Couldn\'t update User.'));
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
                    console.log(clc.error(`In ${path.basename(__filename)} \'changePassword\': ` + errorHandler.getDetailedErrorMessage({ code: 500 }) + ' Couldn\'t find User.'));
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
    var user = User.toObject(req.user, { 'hide': 'firstName lastName sex email phone lastLogin tierId renewalDate subscribed homeLocation hubs maxHubs passwordUpdatedLast notificationNews notificationReminderEmail notificationResearch notificationReminderSMS' });

    // send data
    res.json({ 'd': user.paymentInfo });
};

/**
 * Updates the payment information
 */
exports.updatePayment = function (req, res) {
    // validate existence
    req.checkBody('number', 'You must have a credit card number.').notEmpty();
    req.checkBody('number', 'Credit card number must be in string format of 16 digits.').isString();
    req.checkBody('number', 'Credit card number must be of 16 digits.').isOfLength(16);
    req.checkBody('expiration', 'You must have the expirtation date.').notEmpty();
    req.checkBody('expiration', 'Expirtation date needs to be in the string format of MMYY.').isString();
    req.checkBody('expiration', 'Expirtation date is not 4 digits in the format of MMYY.').isOfLength(4);
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
            // create the updated values object
            var updatedValues = {
                'userId': req.user._id,
                'number': req.body.number,
                'expiration': req.body.expiration,
                'name': req.body.name,
                'ccv': req.body.ccv
            };

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

                    // read the profile
                    module.exports.readProfile(req, res);
                }
                else {
                    // send internal error
                    res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                    console.log(clc.error(`In ${path.basename(__filename)} \'updatePayment\': ` + errorHandler.getDetailedErrorMessage({ code: 500 }) + ' Couldn\'t save Payment Type.'));
                }
            });
        }
    });
};

/**
 * Get the hub details
 */
exports.readHubs = function (req, res) {
    // create safe profile object
    var user = User.toObject(req.user, { 'hide': 'firstName lastName sex email phone lastLogin tierId renewalDate subscribed passwordUpdatedLast notificationNews notificationReminderEmail notificationResearch notificationReminderSMS' });

    // if home location exists
    if(user.homeLocation) {
        // get the airport
        var index = _.findIndex(airportCodes, user.homeLocation);

        // set airport
        var airport = index != -1 ? airportCodes[index] : null;

        // recreate the home location object
        user.homeLocation = _.cloneDeep(airport);
        delete user.homeLocation.id;
    }
    
    // current position
    var pos = 0;

    // loop through all hubs
    _.forEach(user.hubs, function(value) {
        // get the airport
        var index = _.findIndex(airportCodes, value);

        // set airport
        var airport = index != -1 ? airportCodes[index] : null;

        // redefine the hub to save
        user.hubs[pos] = _.cloneDeep(airport);
        delete user.hubs[pos].id;

        // increase to next position
        pos++;
    });

    // send data
    res.json({ 'd': user });
};

/**
 * Updates the hub home location
 */
exports.updateHubHome = function (req, res) {
    // validate existence
    req.checkBody('homeLocation', `You must have a location. Must have key of iata or icao.`).notEmpty();
    req.checkBody('homeLocation.iata', `${req.body.homeLocation.iata} is not a valid location. Must have key of iata or icao.`).isString();
    req.checkBody('homeLocation.icao', `${req.body.homeLocation.icao} is not a valid location. Must have key of iata or icao.`).isString();
    req.checkBody('homeLocation', `There is no airport based on this this location '${req.body.homeLocation.iata}' & '${req.body.homeLocation.icao}'.`).exists(airportCodes);

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
                'homeLocation': {
                    'iata': req.body.homeLocation.iata.toUpperCase(),
                    'icao': req.body.homeLocation.icao.toUpperCase()
                } 
            };

            // get the airport
            var index = _.findIndex(airportCodes, updatedValues.homeLocation);

            // set airport
            var airport = index != -1 ? airportCodes[index] : null;

            // redefine the home location to save
            updatedValues.homeLocation.iata = airport.iata;
            updatedValues.homeLocation.icao = airport.icao;

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
                    req.user = safeUserObj;

                    // recreate the home location object
                    var homeLocation = _.cloneDeep(airport);
                    delete homeLocation.id;

                    // send data
                    res.json({ 'd': homeLocation });
                }
                else {
                    // send internal error
                    res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                    console.log(clc.error(`In ${path.basename(__filename)} \'updateHubHome\': ` + errorHandler.getDetailedErrorMessage({ code: 500 }) + ' Couldn\'t update User.'));
                }
            });
        }
    });
};

/**
 * Deletes the hub home location
 */
exports.deleteHubHome = function (req, res) {
    // get the home location
    var deletedHome = req.user.homeLocation;

    // if there is a home location
    if(deletedHome) {
        // create the updated values object
        var updatedValues = {
            'homeLocation': null
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
                req.user = safeUserObj;

                // send data
                res.json({ 'd': { 'hub': deletedHome, title: errorHandler.getErrorTitle({ code: 200 }), message: 'Home Hub successfully deleted.' } });
            }
            else {
                // send internal error
                res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                console.log(clc.error(`In ${path.basename(__filename)} \'deleteHubHome\': ` + errorHandler.getDetailedErrorMessage({ code: 500 }) + ' Couldn\'t update User.'));
            }
        });
    }
    else {
        // send bad request
        res.json({ 'd': { error: true, title: errorHandler.getErrorTitle({ code: 400 }), message: 'Home location does not currently exist. Cannot delete.' } });
    }
};

/**
 * Adds/Updates the hub
 */
exports.upsertHub = function (req, res) {
    // validate existence
    req.checkBody('newHub', `New Hub is not a valid location. Must have key of iata or icao.`).notEmpty();
    req.checkBody('newHub.iata', `${req.body.newHub.iata} is not a valid location. Must have key of iata in string format.`).isString();
    req.checkBody('newHub.icao', `${req.body.newHub.icao} is not a valid location. Must have key of icao in string format.`).isString();
    req.checkBody('newHub', `There is no airport based on this this location '${req.body.newHub.iata}' & '${req.body.newHub.icao}'.`).exists(airportCodes);

    // if there is an old hub
    if(req.body.oldHub && (req.body.oldHub.iata != '' || req.body.oldHub.icao != '')) {
        // validate existence
        req.checkBody('oldHub', `Old Hub is not a valid location. Must have key of iata or icao.`).notEmpty();
        req.checkBody('oldHub.iata', `${req.body.oldHub.iata} is not a valid location. Must have key of iata in string format.`).isString();
        req.checkBody('oldHub.icao', `${req.body.oldHub.icao} is not a valid location. Must have key icao in string format.`).isString();
        req.checkBody('oldHub', `There is no airport based on this this location '${req.body.oldHub.iata}' & '${req.body.oldHub.icao}'.`).exists(airportCodes);
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
            if(newIndex != -1) {
                // send bad request
                res.status(400).send({ title: errorHandler.getErrorTitle({ code: 400 }), message: 'Cannot have duplicate hubs.' });
            }
            else {
                // get the airport
                var index = _.findIndex(airportCodes, newHub);;

                // set airport
                var airport = index != -1 ? airportCodes[index] : null;

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

                // create the updated values object
                var updatedValues = {
                    'hubs': hubs
                };

                // check the lenth to see if user tried to go over the limit
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
                            req.user = safeUserObj;

                            // recreate the hub location object
                            var hub = _.cloneDeep(airport);
                            delete hub.id;

                            // send data
                            res.json({ 'd': hub });
                        }
                        else {
                            // send internal error
                            res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                            console.log(clc.error(`In ${path.basename(__filename)} \'upsertHub\': ` + errorHandler.getDetailedErrorMessage({ code: 500 }) + ' Couldn\'t update User.'));
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
                req.user = safeUserObj;

                // send data
                res.json({ 'd': { 'hub': deletedHub, title: errorHandler.getErrorTitle({ code: 200 }), message: 'Hub successfully deleted.' } });
            }
            else {
                // send internal error
                res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                console.log(clc.error(`In ${path.basename(__filename)} \'deleteHub\': ` + errorHandler.getDetailedErrorMessage({ code: 500 }) + ' Couldn\'t update User.'));
            }
        });
    }
    else {
        // send not found
        res.json({ 'd': { error: true, title: errorHandler.getErrorTitle({ code: 404 }), message: 'Hub not found.' } });
    };
};

/**
 * Get the membership details
 */
exports.readMembership = function (req, res) {
    // create safe profile object
    var user = User.toObject(req.user, { 'hide': 'firstName lastName sex email phone lastLogin passwordUpdatedLast homeLocation hubs maxHubs notificationNews notificationReminderEmail notificationResearch notificationReminderSMS' });

    // send data
    res.json({ 'd': user });
};

/**
 * Changes the membership details
 */
exports.changeMembership = function (req, res) {
    // send data
    res.json({ 'd': accountDetails });
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
            'tierId': null,
            'subscribed': false,
            'renewalDate': null
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
                req.user = safeUserObj;

                // send data
                res.json({ 'd': { 'hub': currentMembership, title: errorHandler.getErrorTitle({ code: 200 }), message: 'Membership cancelled.' } });
            }
            else {
                // send internal error
                res.status(500).send({ error: true, title: errorHandler.getErrorTitle({ code: 500 }), message: errorHandler.getGenericErrorMessage({ code: 500 }) });
                console.log(clc.error(`In ${path.basename(__filename)} \'cancelMembership\': ` + errorHandler.getDetailedErrorMessage({ code: 500 }) + ' Couldn\'t update User.'));
            }
        });
    }
    else {
        // send bad request
        res.json({ 'd': { error: true, title: errorHandler.getErrorTitle({ code: 400 }), message: 'There is no current membership to be cancelled.' } });
    }
};

/**
 * Get the notification details
 */
exports.readNotifications = function (req, res) {
    // create safe profile object
    var user = User.toObject(req.user, { 'hide': 'firstName lastName sex email phone lastLogin tierId renewalDate subscribed passwordUpdatedLast homeLocation hubs maxHubs' });

    // send data
    res.json({ 'd': user });
};

/**
 * Updates the notification details
 */
exports.updateNotifications = function (req, res) {
    // create the updated values object
    var updatedValues = {
        
    };

    // remove all undefined members
    helpers.removeUndefinedMembers(updatedValues);

    // if there is something to update
    if(Object.keys(updatedValues).length > 0) {

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
    // check if file exists
    fs.exists(accountDetailsPath, (exists) => {
        // if the file exists
        if(exists) {
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
            accountDetails = {};
        }
    });
};


/**
 * User middleware
 */
/*
exports.userById = function (req, res, next, id) {
    // if user is authenticated in the session
    if (req.isAuthenticated()) {
        // validate existence
        req.checkBody('email', 'Email is required.').notEmpty();
        req.checkBody('email', 'Not a valid email.').isEmail();
        req.checkBody('oldpassword', 'Old Password is required.').notEmpty();
        req.checkBody('newpassword', 'New Password is required.').notEmpty();
        
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
                // convert to lowercase
                id = id ? id.toLowerCase() : id;

                // find user based on id
                User.findOne({ 'username': id }, function(err, foundUser) {
                    // if error occurred occurred
                    if (err) {
                        // return error
                        return next(err);
                    }
                    // if user was found
                    else if(foundUser) {
                        // compare equality
                        User.comparePassword(req.body.oldpassword, function(err, isMatch) {
                            // if error occurred occurred
                            if (err) {
                                // send internal error
                                res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                                console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                            }
                            else if(!isMatch) {
                                // send not found
                                res.status(404).send({ title: errorHandler.getErrorTitle({ code: 404 }), message: 'Username/Password is incorrect.' });
                            }
                            else {
                                // bind the data to the request
                                req.foundUser = foundUser;
                                next();
                            }
                        });	
                    }
                    else {
                        // send not found
                        res.status(404).send({ title: errorHandler.getErrorTitle({ code: 404 }), message: 'Username/Password is incorrect.' });
                    }
                });
            }
        });
    }
    else {
        // create forbidden error
        res.status(403).send({ title: errorHandler.getErrorTitle({ code: 403 }), message: errorHandler.getGenericErrorMessage({ code: 403 }) });
    }
};
*/

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
    safeObj = PaymentType.toObject(safeObj, { 'hide': 'created' });
    safeObj._id = id;

    // set the last 4 digits and delete the full number
    safeObj.lastFour = safeObj.number.substring(safeObj.number.length - 4);
    delete safeObj.number;
    delete safeObj.ccv;

    // return the safe obj
    return safeObj;
};