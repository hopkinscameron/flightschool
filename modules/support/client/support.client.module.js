'use strict';

// register the modules
ApplicationConfiguration.registerModule('support', ['core']);
ApplicationConfiguration.registerModule('support.services');
ApplicationConfiguration.registerModule('support.routes', ['core.routes']);