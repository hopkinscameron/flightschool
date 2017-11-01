'use strict';

// register the modules
ApplicationConfiguration.registerModule('careers', ['core']);
ApplicationConfiguration.registerModule('careers.services');
ApplicationConfiguration.registerModule('careers.routes', ['core.routes']);