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
    accountDetailsPath = path.join(__dirname, '../data/account.json'),
    // the file details for this view
    accountDetails = {},
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
    var user = User.toObject(req.user, { 'hide': 'tierId renewalDate subscribed passwordUpdatedLast' });

    // send data
    res.json({ 'd': user });
};

/**
 * Updates the profile details
 */
exports.updateProfile = function (req, res) {
    // send data
    res.json({ 'd': accountDetails });
};

/**
 * Updates password
 */
exports.updatePassword = function (req, res, next) {
    // set the user
    var user = req.foundUser;

    // if found user
    if(user) {
        // set updated values 
        var updatedValues = {
            'password': req.body.newpassword
        };

        // check if user entered a previous password
        User.compareLastPasswords(user, req.body.newpassword, function(err, isPastPassword) {
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
                // update user
                User.update(user, updatedValues, function(err, updatedUser) {
                    // if error occurred occurred
                    if (err) {
                        // send internal error
                        res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                        console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                    }
                    else if(updatedUser) {
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
    else {
        // send not found
        res.status(404).send({ title: errorHandler.getErrorTitle({ code: 404 }), message: errorHandler.getGenericErrorMessage({ code: 404 }) + ' Usernmae/Password is incorrect.' });
    }
};

/**
 * Get the hub details
 */
exports.readHubs = function (req, res) {
    // send data
    res.json({ 'd': accountDetails });
};

/**
 * Updates the hub details
 */
exports.updateHubs = function (req, res) {
    // send data
    res.json({ 'd': accountDetails });
};

/**
 * Get the membership details
 */
exports.readMembership = function (req, res) {
    // send data
    res.json({ 'd': accountDetails });
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
    // send data
    res.json({ 'd': accountDetails });
};

/**
 * Get the notification details
 */
exports.readNotifications = function (req, res) {
    // send data
    res.json({ 'd': accountDetails });
};

/**
 * Updates the notification details
 */
exports.updateNotifications = function (req, res) {
    // send data
    res.json({ 'd': accountDetails });
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
                    // if draft was found
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
                        res.status(404).send({ title: errorHandler.getErrorTitle({ code: 404 }), message: 'Usernmae/Password is incorrect.' });
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