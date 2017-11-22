'use strict';

// register the modules
ApplicationConfiguration.registerModule('flights', ['core']);
ApplicationConfiguration.registerModule('flights.services');
ApplicationConfiguration.registerModule('flights.routes', ['core.routes']);