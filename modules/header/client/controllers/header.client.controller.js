'use strict'

// set up the module
var headerModule = angular.module('header');

// create the controller
headerModule.controller('HeaderController', ['$scope', '$rootScope', '$location', '$window', 'Service', 'AccountFactory', 'FlightsFactory', 'HeaderFactory', function ($scope, $rootScope, $location, $window, Service, AccountFactory, FlightsFactory, HeaderFactory) {
    // initialize variables
    initializeVariables();

    // get the header information
    getHeaderInformation();
    
    // close the nav bar on link click
    $('.nav-link').on('click', function(){
        $('.navbar-collapse').collapse('hide');
    });

    // close the nav bar on non nav bar click
    $(document).on('click',function(){
        $('.navbar-collapse').collapse('hide');
    });

    /*
    // get the airport codes
    $.getJSON('/lib/airport-codes/airports.json', function(json) {
        $rootScope.$root.airportCodes = json;
    });

    // get the airlines
    $.getJSON('/lib/airlines/airlines.json', function(json) {
        $rootScope.$root.airlines = json;
    });
    */
    
    // get flight information
    getFlightInformation();

    // on refresh
    $rootScope.$on('refreshHeader', function (event, data) {
        // initialize variables
        initializeVariables();

        // get the header information
        getHeaderInformation();
    });

    // format date
    $rootScope.$root.formatDate = function(type, dateToFormat) {
        try {
            var date = new Date(dateToFormat);
            date.setSeconds(0,0);

            // switch based on date type
            if(type == $rootScope.$root.dateShort) {
                return date.toLocaleString('en-us', { day: 'numeric', month: 'short', year: 'numeric' });
            }
            else if(type == $rootScope.$root.dateLong) {
                return date.toLocaleString('en-us', { day: 'numeric', month: 'long', year: 'numeric' });
            }
            else if(type == $rootScope.$root.dateOnly) {
                return date.toLocaleString('en-us', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });
            }
            else if(type == $rootScope.$root.locale) {
                return date.toLocaleString('en-us', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute:'2-digit' });
            }
            else if(type == $rootScope.$root.iso) {
                return date.toISOString();
            }
            else if(type == $rootScope.$root.shortNumeric) {
                return date.toLocaleString('en-us', { day: 'numeric', month: 'numeric', year: 'numeric' });
            }
            else if(type == $rootScope.$root.dateSkyPicker) {
                var skyPickerApiDate = date.toLocaleString('en-us', { day: 'numeric', month: 'numeric', year: 'numeric' });
                var dateSplit = skyPickerApiDate.split('/');
                skyPickerApiDate = `${dateSplit[1]}/${dateSplit[0]}/${dateSplit[2]}`;
                return skyPickerApiDate;
            }
        }
        catch (e) {
            return dateToFormat;
        }
    };

    // format time
    $rootScope.$root.formatTime = function(type, timeToFormat, locationOptions) {
        try {
            var date = new Date(timeToFormat);

            // switch based on time type
            if(type == $rootScope.$root.timeShort) {
                return date.toLocaleTimeString();
            }
            else if(type == $rootScope.$root.timeShortNoSeconds) {
                return date.toLocaleTimeString('en-us', { hour: '2-digit', minute:'2-digit' }); //, timeZone: 'America/New_York'
            }
            else if(type == $rootScope.$root.locationBasedProvided) {
                return date.toLocaleTimeString('en-us', { hour: '2-digit', minute:'2-digit', timeZone: locationOptions.timeZone });
            }
            else if(type == $rootScope.$root.locationBasedSearched) {
                // get the time based on location
                HeaderFactory.getTimeZoneInformation(locationOptions).then(function (responseTZ) {
                    return date.toLocaleTimeString('en-us', { hour: '2-digit', minute:'2-digit', timeZone: responseTZ.timeZoneId });                 
                })
                .catch(function (responseTZ) {
                    console.log(responseTZ);
                    return date.toLocaleTimeString('en-us', { hour: '2-digit', minute:'2-digit' });
                });
            }
        }
        catch (e) {
            return timeToFormat;
        }
    };

    // format from UNIX timestamp
    $rootScope.$root.formatFromUnixTimeStamp = function(timeInSeconds) {
        // time is in a UNIX timestamp (which is in seconds), so need to multiply by 1000 to get to correct JS time
        return new Date(timeInSeconds * 1000);
    };

    // get time since comment
    $rootScope.$root.getTimeSince = function(dateToCheck) {
        try {
            var now = new Date();
            var dateToCheck = new Date(dateToCheck);

            // get the time difference
            var diff = Math.floor(now.getTime() - dateToCheck.getTime());

            // if invalid
            if(diff < 0) {
                return '';
            }

            var secs = Math.floor(diff/1000);
            var mins = Math.floor(secs/60); // seconds in a minute
            var hours = Math.floor(secs/3600); // seconds in an hour
            var days = Math.floor(secs/86400); // seconds in a day
            var months = Math.floor(secs/2592000); // seconds in a month
            var years = Math.floor(secs/31536000); // seconds in a year

            // holds the time message
            var timeSince = ''; 

            // if less than a day ago
            if(days <= 0){
                // if less than an hour ago
                if(hours <= 0) {
                    // if less than a minute ago
                    if(mins <= 0) {
                        // if a second
                        if(secs == 1) {
                            timeSince = secs + ' second ago';
                        }
                        else {
                            timeSince = secs + ' seconds ago';
                        }
                    }
                    else {
                        // if a minute
                        if(mins == 1) {
                            timeSince = mins + ' minute ago';
                        }
                        else {
                            timeSince = mins + ' minutes ago';
                        }
                    }
                }
                else {
                    // if an hour
                    if(hours == 1) {
                        timeSince = hours + ' hour ago';
                    }
                    else {
                        timeSince = hours + ' hours ago';
                    }
                }
            }
            else {
                // if less than a year ago
                if(years <= 0){
                    // if less than a month ago
                    if(months <= 0) {
                        // if a day
                        if(days == 1) {
                            timeSince = days + ' day ago';
                        }
                        else {
                            timeSince = days + ' days ago';
                        }
                    }
                    else {
                        // if a month
                        if(months == 1) {
                            timeSince = months + ' month ago';
                        }
                        else {
                            timeSince = months + ' months ago';
                        }
                    }
                }
                else {
                    // if a year
                    if(years == 1) {
                        timeSince = years + ' year ago';
                    }
                    else {
                        timeSince = years + ' years ago';
                    }
                }
            }

            return timeSince;
        }
        catch (e) {
            return e;
        }
    };

    // get animation delays
    $rootScope.$root.getAnimationDelay = function() {
        // set the delay
        var delay = {
            '-webkit-animation-delay': '0.5s',
            '-moz-animation-delay': '0.5s',
            '-ms-animation-delay': '0.5s',
            '-o-animation-delay': '0.5s',
            'animation-delay': '0.5s'
        };

        return delay;
    };

    // get animation delays
    $rootScope.$root.getAnimationDelays = function(startTime, incrementTime, length) {
        // initialize the array
        var delays = new Array(length);

        // loop through all animation timing and set the times
        for(var x = 0; x < delays.length; x++) {
            delays[x] = {
                '-webkit-animation-delay': startTime + (x * incrementTime) + 's',
                '-moz-animation-delay': startTime + (x * incrementTime) + 's',
                '-ms-animation-delay': startTime + (x * incrementTime) + 's',
                '-o-animation-delay': startTime + (x * incrementTime) + 's',
                'animation-delay': startTime + (x * incrementTime) + 's'
            };
        }

        return delays;
    };

    // get waypoint starting offset
    $rootScope.$root.getWaypointStart = function() {
        // set the viewport and navbar height
        var vph = angular.element(window).height();
        var navbarHeight = 76;

        return vph - navbarHeight;
    };

    // set up waypoints
    $rootScope.$root.setUpWaypoints = function(waypointList) {
         // go through all waypoints
        _.forEach(waypointList, function(value) {
            // get the element
            var documentElement = document.getElementById(value.id);

            // see if element exists
            if(documentElement) {
                value.waypoint = new Waypoint({
                    element: documentElement,
                    handler: function(direction) {
                        // if direction is down
                        if(direction == 'down') {
                            // get the element
                            var ele = angular.element('#' + this.element.id);

                            // if the element exists
                            if(ele && ele['0']) {
                                ele.addClass(value.class);
                                ele['0'].style.visibility = 'visible';
                            }
                        }
                    },
                    offset: value.offset
                });
            }
        });
    };

    // determines if screen is larger than (not equal)
    $rootScope.$root.isDeviceWidthLargerThan = function(minWidth) {
        return angular.element($window).width() > minWidth;
    };

    // determines if screen is smaller than (not equal)
    $rootScope.$root.isDeviceWidthSmallerThan = function(maxWidth) {
        return angular.element($window).width() < maxWidth;
    };

    // checks if the page is active
    $rootScope.$root.isActive = function (page) {
        // get the third index of forward slash
        var index = nthIndexOf($window.location.href, '/', 3);
        var link = $window.location.href.substring(index + 1);
        
        // check if on page
        if (link == page) {
            // set the class as active
            return true;
        }

        return false;
    };

    // removed any undefined members from object
    $rootScope.$root.removeUndefinedMembers = function(obj) {
        // go through each option and remove
        _.forEach(Object.keys(obj), function (value) {
            // if undefined
            if(obj[value] === undefined) {
                delete obj[value];
            }
        });
    };

    // format float to number of decimals
    $rootScope.$root.formatFloat = function(value, numDecimals) {
        return value.toFixed(numDecimals);
    };

    // closes notification banner
    $rootScope.$root.closeBanner = function() {
        // if not already collapsing
        if(!angular.element('#notificationBanner').hasClass('collapsing')) {
            // hide
            $('#notificationBanner').collapse('hide');
        }

        // on collapsed
        $('#notificationBanner').on('hidden.bs.collapse', function () {
            // reset
            $rootScope.$root.showNotificationBanner = false;
            $rootScope.$root.notificationText = null;
            $rootScope.$root.notificationType = $rootScope.$root.notificationTypeInfo;
        });
    };

    // initialize variables
    function initializeVariables () {
        // set jQuery
        $rootScope.$root.$ = window.jQuery;

        // set animations
        $rootScope.$root.animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

        // set obtaining page data timeout (used for a slight animation)
        $rootScope.$root.getPageDataTimeout = 0;

        // set show page timeout (timeout before a page shows (used for collapsing body))
        $rootScope.$root.showPageTimeout = 500;
        
        // initialize show header
        $rootScope.$root.showHeader = true;

        // initialize show footer
        $rootScope.$root.showFooter = true;

        // general status error when something goes wrong
        $rootScope.$root.generalStatusError = 'Sorry, something went wrong on our end.';

        // the date formats
        $rootScope.$root.dateShort = 'short';
        $rootScope.$root.dateLong = 'long';
        $rootScope.$root.dateOnly = 'dateOnly';
        $rootScope.$root.dateLocale = 'dateLocale';
        $rootScope.$root.dateIso = 'dateIso';
        $rootScope.$root.shortNumeric = 'shortNumeric';
        $rootScope.$root.dateSkyPicker = 'dateSkyPicker';
        $rootScope.$root.timeShort = 'timeShort';
        $rootScope.$root.timeShortNoSeconds = 'timeShortNoSeconds';
        $rootScope.$root.locationBasedProvided = 'locationBasedProvided';
        $rootScope.$root.locationBasedSearched = 'locationBasedSearched';

        // the notification types
        $rootScope.$root.notificationTypeSuccess = 'success';
        $rootScope.$root.notificationTypeWarning = 'warning';
        $rootScope.$root.notificationTypeDanger = 'danger';
        $rootScope.$root.notificationTypeInfo = 'info';

        // the google timezone api key
        $rootScope.$root.timeZoneKey = window.sharedConfig.googleMapsTimeZone;

        // holds the header backend data
        $scope.header = {};

        // set up all regex's
        setUpRegex();
    };

    // sets up the regex
    function setUpRegex() {
        // email regex
        $rootScope.$root.emailRegex = /^(([^<>()\[\]\\.,;:\s@\']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        // url regex
        $rootScope.$root.urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

        // phone number regex
        $rootScope.$root.phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

        // credit card regex
        $rootScope.$root.visaRegex = /^4[0-9]{12}(?:[0-9]{3})?$/;
        $rootScope.$root.masterCardRegex = /^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$/;
        $rootScope.$root.americanExpressRegex = /^3[47][0-9]{13}$/;
        $rootScope.$root.discoverRegex = /^6(?:011|5[0-9]{2})[0-9]{12}$/;
    };

    // gets the membership information
    function retrieveMembership() {
        // get the membership
        var membership = window.user.membership;

        // if there is not a next billing date but the user was previously subscribed
        if(membership && membership.tierId && !membership.billingCycle) {
            // FIXME: used for testing
            membership.payments = [
                { 'start': new Date('November 30 2017'), 'end': new Date('December 29 2017'), 'price': 40.00, 'tax': 2.40, 'tier': 'Bronze Wanderer', 'cardType': 'VISA', 'cardDigits': '1234' },
                { 'start': new Date('November 13 2017'), 'end': new Date('December 12 2017'), 'price': 40.00, 'tax': 2.40, 'tier': 'Bronze Wanderer', 'cardType': 'VISA', 'cardDigits': '1234' },
                { 'start': new Date('October 13 2017'), 'end': new Date('November 12 2017'), 'price': 40.00, 'tax': 2.40, 'tier': 'Bronze Wanderer', 'cardType': 'VISA', 'cardDigits': '1234' }
            ];

            // if today's date is before the end of the last payment cycle
            if(membership.payments && new Date() < membership.payments[0].end) {
                // set a banner
                $rootScope.$root.showNotificationBanner = true;
                $rootScope.$root.notificationText = `Hey ${window.user.firstName}, it looks like your membership is expiring on ${$rootScope.$root.formatDate($rootScope.$root.shortNumeric, new Date(responseM.payments[0].end))}`;
                $rootScope.$root.notificationType = $rootScope.$root.notificationTypeDanger;

                // if not already collapsing
                if(!angular.element('#notificationBanner').hasClass('collapsing')) {
                    // hide
                    $('#notificationBanner').collapse('show');
                }
            }
        }

        /*
        // get membership page data
        AccountFactory.getMembershipPageInformation().then(function (responseM) {
            // if returned a valid response
            if (responseM && !responseM.error) {
                // if there is not a next billing date but the user was previously subscribed
                if(responseM.tierId && !responseM.billingCycle) {
                    // FIXME: used for testing
                    responseM.payments = [
                        { 'start': new Date('November 30 2017'), 'end': new Date('December 29 2017'), 'price': 40.00, 'tax': 2.40, 'tier': 'Bronze Wanderer', 'cardType': 'VISA', 'cardDigits': '1234' },
                        { 'start': new Date('November 13 2017'), 'end': new Date('December 12 2017'), 'price': 40.00, 'tax': 2.40, 'tier': 'Bronze Wanderer', 'cardType': 'VISA', 'cardDigits': '1234' },
                        { 'start': new Date('October 13 2017'), 'end': new Date('November 12 2017'), 'price': 40.00, 'tax': 2.40, 'tier': 'Bronze Wanderer', 'cardType': 'VISA', 'cardDigits': '1234' }
                    ];

                    // if today's date is before the end of the last payment cycle
                    if(responseM.payments && new Date() < responseM.payments[0].end) {
                        // set a banner
                        $rootScope.$root.showNotificationBanner = true;
                        $rootScope.$root.notificationText = `Hey ${window.user.firstName}, it looks like your membership is expiring on ${$rootScope.$root.formatDate($rootScope.$root.shortNumeric, new Date(responseM.payments[0].end))}`;
                        $rootScope.$root.notificationType = $rootScope.$root.notificationTypeDanger;

                        // if not already collapsing
                        if(!angular.element('#notificationBanner').hasClass('collapsing')) {
                            // hide
                            $('#notificationBanner').collapse('show');
                        }
                    }
                }
            }
        })
        .catch(function (responseM) {});
        */
    };

    // gets the header information
    function getHeaderInformation() {
        // get the header information
        HeaderFactory.getHeaderInformation().then(function (responseHeader) {
            // set the header
            $scope.header = responseHeader;
            $rootScope.$root.isLoggedIn = responseHeader.isLoggedIn;

            // if logged in
            if($rootScope.$root.isLoggedIn) {
                // get membership information
                retrieveMembership();
            }

            // header refreshed
            $rootScope.$broadcast('headerRefreshed', {});
        })
        .catch(function (responseHeader) {
            // header refreshed with error
            $rootScope.$broadcast('headerRefreshed', { 'error': true, 'message': responseHeader.message });
        });
    };

    // gets the nth index of substring
    function nthIndexOf(string, subString, index) {
        return string.split(subString, index).join(subString).length;
    };

    // gets flight information such as airlines and airports
    function getFlightInformation() {
        // get airlines
        FlightsFactory.getAirlines().then(function (responseA) {
            // if returned a valid response
            if (responseA && !responseA.error) {
                $rootScope.$root.airlines = responseA;
            }
            else {
                $rootScope.$root.airlines = [];
            }
        })
        .catch(function (responseA) {});

        // get airports
        FlightsFactory.getAirports().then(function (responseA) {
            // if returned a valid response
            if (responseA && !responseA.error) {
                $rootScope.$root.airportCodes = responseA;
            }
            else {
                $rootScope.$root.airportCodes = [];
            }
        })
        .catch(function (responseA) {});
    };

    // on window resize
    angular.element($window).resize(function() {
        $scope.$apply();
    });
}]);