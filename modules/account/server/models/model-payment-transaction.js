'use strict';

/**
 *  Name: The Payment Transaction Schema
    Description: Determines how a Payment Transaction is defined
 */

/**
 * Module dependencies
 */
var // generate UUID's
    uuidv1 = require('uuid/v1'),
    // short id generator
    shortid = require('shortid'),
    // lodash
    _ = require('lodash'),
    // the path
    path = require('path'),
    // the helper functions
    helpers = require(path.resolve('./config/lib/global-model-helpers')),
    // the db
    db = require('./db/payment-transactions'),
    // the db full path
    dbPath = 'modules/account/server/models/db/payment-transactions.json';

/**
 * Payment Transaction Schema
 */ 
var PaymentTransactionSchema = {
    _id: {
        type: String,
        overwriteable: false
    },
    created: {
        type: Date,
        overwriteable: false
    },
    internalName: {
        type: String,
        overwriteable: false
    },
    paymentTypeId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        overwriteable: false
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    }
};

// the required properties
var requiredSchemaProperties = helpers.getRequiredProperties(PaymentTransactionSchema);

// the non overwritable properties the user cannot self change
var nonOverwritableSchemaProperties = helpers.getNonOverwritableProperties(PaymentTransactionSchema);

// the non default properties
var defaultSchemaProperties = helpers.getDefaultProperties(PaymentTransactionSchema);

// the searchable properties
var searchableSchemaProperties = helpers.getSearchableProperties(PaymentTransactionSchema);

// the acceptable value properties
var acceptableValuesSchemaProperties = helpers.getAcceptableValuesProperties(PaymentTransactionSchema);

// the trimmable value properties
var trimmableSchemaProperties = helpers.getTrimmableProperties(PaymentTransactionSchema);

/**
 * Converts to object
 */
exports.toObject = function(obj, options) {
    // return the obj
    return _.cloneDeep(helpers.toObject(obj, options));
};

/**
 * Find
 */
exports.find = function(query, callback) {
    // find
    helpers.find(db, query, searchableSchemaProperties, function(err, objs) {
        // if a callback
        if(callback) {
            // hit the callback
            callback(err, _.cloneDeep(objs));
        }
    });
};

/**
 * Find By Id
 */
exports.findById = function(id, callback) {
    // find one
    helpers.findById(db, id, function(err, obj) {
        // if a callback
        if(callback) {
            // hit the callback
            callback(err, _.cloneDeep(obj));
        }
    });
};

/**
 * Find One
 */
exports.findOne = function(query, callback) {
    // find one
    helpers.findOne(db, query, function(err, obj) {
        // if a callback
        if(callback) {
            // hit the callback
            callback(err, _.cloneDeep(obj));
        }
    });
};

/**
 * Save
 */
exports.save = function(objToSave, callback) {
    // the object to return
    var obj = null;
    
    // the error to return
    var err = null;

    // the first property value that isn't present
    var firstProp = helpers.checkRequiredProperties(requiredSchemaProperties, objToSave);

    // if there is a property that doesn't exist
    if(firstProp) {
        // create new error
        err = new Error(`All required properties are not present on object. The property \'${firstProp}\' was not in the object.`);
        
        // if a callback
        if(callback) {
            // hit the callback
            callback(err);
        }
    }
    else {
        // remove any keys that may have tried to been overwritten
        helpers.removeAttemptedNonOverwritableProperties(nonOverwritableSchemaProperties, objToSave);

        // the index of the possible draft
        var index = -1;

        // find the object matching the object index
        index = _.findIndex(db, { 'internalName': objToSave.internalName });
        obj = index != -1 ? db[index] : null;

        // if object was found
        if(obj) {
            // merge old data with new data
            _.merge(obj, objToSave);
            
            // replace item at index using native splice
            db.splice(index, 1, obj);

            // update the db
            helpers.updateDB(dbPath, db, function(e) {
                // set error
                err = e;

                // if error, reset object
                obj = err ? null : obj;

                // if a callback
                if(callback) {
                    // hit the callback
                    callback(err, _.cloneDeep(obj));
                }
            });
        }
        else {
            // set all defaults
            helpers.setNonOverwritablePropertyDefaults(defaultSchemaProperties, PaymentTransactionSchema, objToSave);

            // generate UUID
            objToSave._id = uuidv1();

            // set created date
            objToSave.created = new Date();

            // generate a short id if the current one doesn't exist
            objToSave.internalName = shortid.generate();

            // push the new object
            db.push(objToSave);

            // update the db
            helpers.updateDB(dbPath, db, function(e) {
                // set error
                err = e;

                // if error, reset object
                objToSave = err ? null : objToSave;

                // if a callback
                if(callback) {
                    // hit the callback
                    callback(err, _.cloneDeep(objToSave));
                }
            });
        }
    }
};

/**
 * Update
 */
exports.update = function(query, updatedObj, callback) {
    // the object to return
    var obj = null;
    
    // the error to return
    var err = null;

    // find the object matching the object index
    var index = _.findIndex(db, query);
    obj = index != -1 ? db[index] : null;

    // if object was found
    if(obj) {
        // remove any keys that may have tried to been overwritten
        helpers.removeAttemptedNonOverwritableProperties(nonOverwritableSchemaProperties, updatedObj);

        // merge old data with new data
        _.merge(obj, updatedObj);

        // replace item at index using native splice
        db.splice(index, 1, obj);

        // update the db
        helpers.updateDB(dbPath, db, function(e) {
            // set error
            err = e;

            // if error, reset object
            obj = err ? null : obj;

            // if a callback
            if(callback) {
                // hit the callback
                callback(err, _.cloneDeep(obj));
            }
        });
    }
    else {
        // if a callback
        if(callback) {
            // hit the callback
            callback(err, _.cloneDeep(obj));
        }
    }
};

/**
 * Remove
 */
exports.remove = function(obj, callback) {
    // remove
    helpers.remove(db, obj, function(err, removedObjs) {
        // if error occurred
        if(err) {
            // if a callback
            if(callback) {
                // hit the callback
                callback(err);
            }
        }
        else {
            // update the db
            helpers.updateDB(dbPath, db, function(e) {
                // if a callback
                if(callback) {
                    // hit the callback
                    callback(e, removedObjs);
                }
            });
        }
    });
};

/**
 * Sort
 */
exports.sort = function(arr, query, callback) {
    // sort
    helpers.sort(arr, query, function(err, objs) {
        // if a callback
        if(callback) {
            // hit the callback
            callback(err, _.cloneDeep(objs));
        }
    });
};