'use strict';

/**
 * Module dependencies
 */
var // the path
    path = require('path'),
    // the error handler
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    // acl for permissions
    acl = require('acl');

// using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Permissions
 */
exports.invokeRolesPolicies = function () {
    /*
    // set the policies
    acl.allow([
        {
            roles: ['admin'],
            allows: [
                {
                    resources: '/api/articles',
                    permissions: '*'
                },
                {
                    resources: '/api/articles/:articleId',
                    permissions: '*'
                }
            ]
        }, 
        {
            roles: ['user'],
            allows: [
                {
                    resources: '/api/articles',
                    permissions: ['get']
                }, 
                {
                    resources: '/api/articles/:articleId',
                    permissions: ['get']
                }
            ]
        }, 
        {
            roles: ['guest'],
            allows: [
                {
                    resources: '/api/articles',
                    permissions: ['get']
                }, 
                {
                    resources: '/api/articles/:articleId',
                    permissions: ['get']
                }
            ]
        }
    ]);
    */
};

/**
 * Check if Dashboard policy allows
 */
exports.isAllowed = function (req, res, next) {
    // if user is authenticated in the session, carry on 
	if (req.isAuthenticated() && req.user.role == 'user') {
        return next();
    }
	else {
        // create unauthorized error
        return res.status(401).send({ title: errorHandler.getErrorTitle({ code: 401 }), message: errorHandler.getGenericErrorMessage({ code: 401 }) });
    }
};