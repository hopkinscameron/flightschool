'use strict';

/**
 * Module dependencies
 */
var // the path
    path = require('path'),
    // get the current config
	config = require(path.resolve('./config/config')),
    // the error handler
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    // chalk for console logging
    clc = require(path.resolve('./config/lib/clc')),
    // the ability to send emails
    nodemailer = require('nodemailer'),
    // the file details for this view
    contactDetails = require('../data/contact');

// create reusable transporter object using the default SMTP transport
// secure:true for port 465, secure:false for port 587
let transporter = nodemailer.createTransport({
    host: config.mailer.options.host,
    port: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'developmentp' ? 465 : 587,
    secure: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'developmentp' ? true : false,
    auth: {
        user: config.mailer.options.auth.user,
        pass: config.mailer.options.auth.pass
    },
	//proxy: 'http://localhost:3128',
    //service: config.mailer.options.service
});

// verify connection configuration
transporter.verify(function(err, success) {
    // if error occurred
    if (err) {
        // log internal error
        console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
    } 
    else {
        console.log(clc.success('Transporter server is ready to take our messages'));
    }
});


/**
 * Show the current page
 */
exports.read = function (req, res) {
    // send data
    res.json({ 'd': contactDetails });
};

/**
 * Sends an email to owner
 */
exports.sendEmailToOwner = function (req, res) {
    // validate existence
    req.checkBody('fullName', 'Full name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Not a valid email').isEmail();
    req.checkBody('subject', 'Subject is required').notEmpty();
    req.checkBody('message', 'Message is required').notEmpty();

    // validate errors
    req.getValidationResult().then(function(errors) {
        // if any errors exists
        if(!errors.isEmpty()) {
            // holds all the errors in one text
            var errorText = "";

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
            var fromString = req.body.fullName + " " + req.body.lastName + "<" + req.body.email + ">";
            
            // setup email data with unicode symbols
            let mailOptions = {
                from: fromString, // sender address
                to: config.mailer.to, // list of receivers
                subject: req.body.subject, // Subject line
                text: req.body.message, // plain text body
                html: '<p>' + req.body.message + '</p>' // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (err, info) => {
                // if error occurred
                if (err) {
                    // send internal error
                    res.status(500).send({ error: true, title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) });
                    console.log(clc.error(errorHandler.getDetailedErrorMessage(err)));
                }
                else {
                    // setup success
                    var err = {
                        code: 200
                    };

                    // return success
                    res.status(200).send({ 'd': { title: errorHandler.getErrorTitle(err), message: errorHandler.getGenericErrorMessage(err) + " Your email has been sent!" } });
                }
            });	
        }
    });
};