'use strict';

// register the modules
ApplicationConfiguration.registerModule('account', ['core']);
ApplicationConfiguration.registerModule('account.services');
ApplicationConfiguration.registerModule('account.routes', ['core.routes']);