'use strict';

/**
 *  Name: The Payment Type Schema
    Description: Determines how a Payment Type is defined
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
    db = require('./db/payment-type'),
    // the db full path
    dbPath = 'modules/account/server/models/db/payment-type.json',
    // get the default config
	defaultConfig = require(path.resolve('./config/env/default')),
    // crypto for encrypting and decrypting
    crypto = require('crypto');;

/**
 * Payment Type Schema
 */ 
var PaymentTypeSchema = {
    _id: {
        type: String,
        overwriteable: false
    },
    created: {
        type: Date,
        overwriteable: false
    },
    userId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['VISA', 'MASTERCARD', 'AMERICANEXPRESS', 'DISCOVER'],
        default: null
    },
    number: {
        type: String,
        required: true
    },
    expiration: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    ccv: {
        type: String,
        required: true
    }
};

// the required properties
var requiredSchemaProperties = helpers.getRequiredProperties(PaymentTypeSchema);

// the non overwritable properties the user cannot self change
var nonOverwritableSchemaProperties = helpers.getNonOverwritableProperties(PaymentTypeSchema);

// the non default properties
var defaultSchemaProperties = helpers.getDefaultProperties(PaymentTypeSchema);

// the searchable properties
var searchableSchemaProperties = helpers.getSearchableProperties(PaymentTypeSchema);

// the acceptable value properties
var acceptableValuesSchemaProperties = helpers.getAcceptableValuesProperties(PaymentTypeSchema);

// the trimmable value properties
var trimmableSchemaProperties = helpers.getTrimmableProperties(PaymentTypeSchema);

/**
 * Converts to object
 */
exports.toObject = function(obj, options) {
    // decrypt the object
    decryptObject(obj);

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

        // check and set acceptable values
        helpers.checkAndSetAcceptableValueForProperties(acceptableValuesSchemaProperties, PaymentTypeSchema, objToSave);

        // trim any values
        helpers.trimValuesForProperties(trimmableSchemaProperties, objToSave);

        // the index of the possible draft
        var index = -1;

        // find the object matching the object index
        index = _.findIndex(db, { 'internalName': objToSave.internalName });
        obj = index != -1 ? db[index] : null;

        // if object was found
        if(obj) {
            // encrypt information
            encryptObject(objToSave);

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
            helpers.setNonOverwritablePropertyDefaults(defaultSchemaProperties, PaymentTypeSchema, objToSave);
            helpers.setNonExisistingPropertyDefaults(defaultSchemaProperties, PaymentTypeSchema, objToSave);

            // encrypt information
            encryptObject(objToSave);

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

    // the query to search on (only seach on _id since all other data is encrypted)
    var newQuery = { '_id': query._id };

    // find the object matching the object index
    var index = _.findIndex(db, newQuery);
    obj = index != -1 ? db[index] : null;

    // if object was found
    if(obj) {
        // remove any keys that may have tried to been overwritten
        helpers.removeAttemptedNonOverwritableProperties(nonOverwritableSchemaProperties, updatedObj);

        // check and set acceptable values
        helpers.checkAndSetAcceptableValueForProperties(acceptableValuesSchemaProperties, PaymentTypeSchema, updatedObj);

        // trim any values
        helpers.trimValuesForProperties(trimmableSchemaProperties, updatedObj);

        // encrypt information
        encryptObject(updatedObj);

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

// encrypt object
function encryptObject(pt) {
    // if there is a number
    if(pt.number) {
        // encrypt the value
        pt.number = encrypt(pt.number);
    }

    // if there is an expiration
    if(pt.expiration) {
        // encrypt the value
        pt.expiration = encrypt(pt.expiration);
    }

    // if there is a name
    if(pt.name) {
        // encrypt the value
        pt.name = encrypt(pt.name);
    }

    // if there is a ccv
    if(pt.ccv) {
        // encrypt the value
        pt.ccv = encrypt(pt.ccv);
    } 
};

// decrypt information
function decryptObject(pt) {
    // if there is a number
    if(pt.number) {
        // encrypt the value
        pt.number = decrypt(pt.number);
    }

    // if there is an expiration
    if(pt.expiration) {
        // encrypt the value
        pt.expiration = decrypt(pt.expiration);
    }

    // if there is a name
    if(pt.name) {
        // encrypt the value
        pt.name = decrypt(pt.name);
    }

    // if there is a ccv
    if(pt.ccv) {
        // encrypt the value
        pt.ccv = decrypt(pt.ccv);
    } 
};

// encrypts the text
function encrypt(text) {
    // copy the text to prevent overwriting
    var copy = _.clone(text);

    var t = defaultConfig.encryption.type,
        s = defaultConfig.encryption.secret,
        d = defaultConfig.encryption.digest
    // create the cipher
    var cipher = crypto.createCipher(defaultConfig.encryption.type, defaultConfig.encryption.secret);

    // create the encrypting text
    var crypted = cipher.update(copy, 'utf8', defaultConfig.encryption.digest);

    // add the final value
    crypted += cipher.final(defaultConfig.encryption.digest);

    // return the crypted value
    return crypted;
}

// decrypts the text
function decrypt(text) {
    // copy the text to prevent overwriting
    var copy = _.clone(text);

    // create the decipher
    var decipher = crypto.createDecipher(defaultConfig.encryption.type, defaultConfig.encryption.secret);

    // create the decrypting text
    var decrypted = decipher.update(copy, defaultConfig.encryption.digest, 'utf8');

    // add the final value
    decrypted += decipher.final('utf8');

    // return the decrypted value
    return decrypted;
} 