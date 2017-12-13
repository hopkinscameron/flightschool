'use strict';

// register the modules
ApplicationConfiguration.registerModule('admin', ['core']);
ApplicationConfiguration.registerModule('admin.services');
ApplicationConfiguration.registerModule('admin.routes', ['core.routes']);