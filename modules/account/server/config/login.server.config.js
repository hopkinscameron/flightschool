'use strict';

/**
 * Module dependencies
 */
var // passport for authentication
    passport = require('passport'),
    // path
    path = require('path'),
    // the application configuration
    config = require(path.resolve('./config/config')),
    // lodash
    _ = require('lodash'),
    // the User model
    User = require(path.resolve('./modules/account/server/models/model-user')),
    // the Payment Type model
    PaymentType = require(path.resolve('./modules/account/server/models/model-payment-type'));

/**
 * Module init function
 */
module.exports = function (app, db) {
    // =========================================================================
    // Passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // Passport needs ability to serialize and unserialize users out of session
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        // find the user
        User.findById(id, function(err, user) {
            // if error occurred
            if (err) {
                // send internal error
                res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
            }
            else if(user) {
                // save the id since it will be lost when going to object
                // hide the password for security purposes
                var id = user._id;
                user = User.toObject(user, { 'hide': 'password lastPasswords internalName resetPasswordToken resetPasswordExpires' });
                user._id = id;

                // get the payment object
                PaymentType.findOne({ 'userId': id }, function(err, foundPayment) {
                    // if an error occurred
                    if (err) {
                        // send internal error
                        res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                        console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                    }
                    else if (foundPayment) {
                        // clone to not overwrite
                        var safePaymentObj = _.cloneDeep(foundPayment);

                        // hide the information for security purposes
                        var id = safePaymentObj._id;
                        safePaymentObj = PaymentType.toObject(safePaymentObj, { 'hide': 'created internalName ccv userId' });
                        safePaymentObj._id = id;    

                        // set the payment object
                        user.paymentInfo = safePaymentObj;
                    }
                    
                    done(err, user);
                });
            }
            else {
                done(err, null);
            }
        });
    });

    // initialize strategies
    config.utils.getGlobbedPaths(path.join(__dirname, './strategies/**/*.js')).forEach(function (strategy) {
        require(path.resolve(strategy))(config);
    });

    // add passport's middleware
    app.use(passport.initialize());
    app.use(passport.session());
};