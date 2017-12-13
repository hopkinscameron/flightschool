'use strict';

// register the modules
ApplicationConfiguration.registerModule('trips', ['core']);
ApplicationConfiguration.registerModule('trips.services');
ApplicationConfiguration.registerModule('trips.routes', ['core.routes']);