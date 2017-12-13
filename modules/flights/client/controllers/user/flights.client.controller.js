﻿'use strict';

// set up the module
var flightsModule = angular.module('flights');

// create the controller
flightsModule.controller('FlightsController', ['$scope', '$rootScope', '$compile', '$location', '$window', '$timeout', 'Service', 'TierFactory', 'AccountFactory', 'FlightsFactory', function ($scope, $rootScope, $compile, $location, $window, $timeout, Service, TierFactory, AccountFactory, FlightsFactory) {
    // determines if a page has already sent a request for load
    var pageRequested = false;

    // set jQuery
    $ = window.jQuery;

    // set the path
    Service.afterPath = $location.path();

    // holds the error
    $scope.error = {
        'error': false,
        'title': '',
        'status': 404,
        'message': ''
    };

    // TODO: removed, used for testing
    $scope.forceDisable = true;

    // user membership
    var userMembership = undefined;

    // get todays date
    var today = new Date();
    
    // get three days from now date
    var threeDays = new Date(today);
    threeDays.setDate(threeDays.getDate() + 3);

    // holds the minimum depart/return date
    $scope.departDateMin = new Date();
    $scope.returnDateMin = new Date();

    // the initial text of a dropdown
    $scope.initialText = 'Select One';

    // the hub options
    $scope.hubOptions = {
        'options': []
    };

    // holds the sign up form data
    $scope.searchForm = {
        'inputs': {
            'depart': $scope.initialText,
            'arrive': '',//'Los Angeles Intl',
            'departDate': today,
            'returnDate': threeDays,
            'adults': 1,
            'roundTripOrOneWay': 'oneway',
            'nonStop': false
        },
        'errors': {
            'generic': {
                'message': '',
                'isError': false,
            },
            'depart': {
                'isError': false,
                'message': 'Please select a departing location',
                'optionalMessages': ['Please select a departing location', 'Cannot depart and arrive at same location', 'Must have a Hub as a departing or arriving location', 'Not a valid airport location']
            },
            'arrive': {
                'isError': false,
                'message': 'Please select a arrival location',
                'optionalMessages': ['Please select an arrival location', 'Cannot depart and arrive at same location', 'Must have a Hub as a departing or arriving location', 'Not a valid airport location']
            },
            'departDate': {
                'isError': false,
                'message': 'Please provide a departing date'
            },
            'returnDate': {
                'isError': false,
                'message': 'Please provide a returning date'
            },
            'adults': {
                'isError': false,
                'message': 'Please provide a at least 1 adult'
            }         
        }
    };

    // flight filters
    $scope.flightFilters = {
        'airlines': 'airlines',
        'dTime': 'dTime',
        'aTime': 'aTime',
        'price': 'price',
        'stops': 'stops'
    };

    // time slider values
    $scope.timeSlider = {
        'min': 0,
        'max': 0,
        'value': 0,
        'displayValue': '0 minutes'
    };

    // departure slider values
    $scope.departSlider = {
        'min': 0,
        'max': 0,
        'value': 0,
        'displayValue': '12:00 AM'
    };

    // arrival slider values
    $scope.arriveSlider = {
        'min': 0,
        'max': 0,
        'value': 0,
        'displayValue': '12:00 AM'
    };

    // price slider values
    $scope.priceSlider = {
        'min': 0,
        'max': 0,
        'value': 0,
        'displayValue': '$0.00'
    };

    // layover slider values
    $scope.layoverSlider = {
        'min': 0,
        'max': 0,
        'value': 0,
        'displayValue': '0'
    };

    // determines which direction user is going for their hub
    $scope.hubDirection = 'depart';

    // the direction text
    $scope.directionText = {
        'current': 'Switch to hub arrival <i class="fa fa-arrow-right" aria-hidden="true"></i>',
        'changeTo': 'arrive',
        'textOptions': ['\<i class="fa fa-arrow-left" aria-hidden="true"></i> Switch to hub departure', 'Switch to hub arrival <i class="fa fa-arrow-right" aria-hidden="true"></i>'],
        'changeOptions': ['depart', 'arrive']
    };

    // the sorting
    $scope.sortDirection = {
        'dTime': 'asc',
        'aTime': 'asc',
        'tTime': 'asc',
        'price': 'asc'
    };

    // determines if form is in transit
    $scope.formInTransit = false;

    // determines if the page is fully loaded
    $scope.pageFullyLoaded = false;

    // check if header/footer was initialized
    if($rootScope.$root.showHeader === undefined || $rootScope.$root.showFooter === undefined) {
        // refresh header
        $rootScope.$emit('refreshHeader', {});

        // refresh footer
        $rootScope.$emit('refreshFooter', {});
    }
    else {
        // always refresh header to ensure login
        $rootScope.$emit('refreshHeader', {});
    }

    // on header refresh
    $rootScope.$on('headerRefreshed', function (event, data) {
        // if footer still hasn't been initialized
        if($rootScope.$root.showFooter === undefined) {
            // refresh footer
            $rootScope.$emit('refreshFooter', {});
        }
        else {
            // initialize the page
            initializePage();
        }
    });

    // on footer refresh
    $rootScope.$on('footerRefreshed', function (event, data) {
        // if footer still hasn't been initialized
        if($rootScope.$root.showHeader === undefined) {
            // refresh header
            $rootScope.$emit('refreshHeader', {});
        }
        else {
            // initialize the page
            initializePage();
        }
    });

    // changes round trip option
    $scope.changeRoundTripOption = function() {
        // if round trip, set the day to three days after the current date given
        if($scope.searchForm.inputs.roundTripOrOneWay == 'round') {
            // get three days from depart date
            var threeDays = new Date($scope.searchForm.inputs.departDate);
            threeDays.setDate(threeDays.getDate() + 3);
            $scope.searchForm.inputs.returnDate = threeDays;
        }
        // if one way, remove date
        else if($scope.searchForm.inputs.roundTripOrOneWay == 'oneway') {
            $scope.searchForm.inputs.returnDate = null;
        }
    };

    // switch between depart and arrive for hubs
    $scope.switchTo = function (departOrArrive) {
        // set null
        $scope.hubDirection = null;

        // if switching to arrive
        if(departOrArrive == 'arrive') {
            // swap to depart
            $scope.directionText.current = $scope.directionText.textOptions[0];
            $scope.directionText.changeTo = $scope.directionText.changeOptions[0];
        }
        else {
            // swap to arrive
            $scope.directionText.current = $scope.directionText.textOptions[1];
            $scope.directionText.changeTo = $scope.directionText.changeOptions[1];
        }
        
        // swap values
        $timeout(function() {
             // if arrive
            departOrArrive == 'arrive' ? $scope.hubDirection = departOrArrive : $scope.hubDirection = 'depart';

            // swap values
            var prevArr = $scope.searchForm.inputs.arrive;
            var prevDep = $scope.searchForm.inputs.depart;
            $scope.searchForm.inputs.arrive = prevDep;
            $scope.searchForm.inputs.depart = prevArr;
        }, 750);
    };

    // on change of depart date
    $scope.changeDepartDate = function() {
        // if the return date is before the departure date
        if($scope.searchForm.inputs.returnDate < $scope.searchForm.inputs.departDate && $scope.searchForm.inputs.roundTripOrOneWay == 'round') {
            // get three days from depart date
            var threeDays = new Date($scope.searchForm.inputs.departDate);
            threeDays.setDate(threeDays.getDate() + 3);
            $scope.searchForm.inputs.returnDate = threeDays;
            $scope.returnDateMin = new Date($scope.searchForm.inputs.departDate);
        }
    };

    // searches for flights
    $scope.searchFlights = function () {
        // check for any errors in the values
        checkErrorValues();

        // check if an error exists
        if(!$scope.searchForm.errors.depart.isError && !$scope.searchForm.errors.arrive.isError && !$scope.searchForm.errors.departDate.isError && !$scope.searchForm.errors.returnDate.isError && !$scope.searchForm.errors.adults.isError) {
            // disable button but showing the form has been submitted
            $scope.formInTransit = true;

            // get the depart
            var depart = null;
            var arrive = null;

            // if direction is arrive
            if($scope.hubDirection == 'arrive') {
                // get the index of ' (Main)'
                var mainIndex = $scope.searchForm.inputs.arrive.indexOf(' (Main)');

                // if user selected main hub
                if(mainIndex != -1) {
                    arrive = $scope.searchForm.inputs.arrive.substring(0, mainIndex);
                }
                else {
                    arrive = $scope.searchForm.inputs.arrive;
                }

                // set depart
                depart = $scope.searchForm.inputs.depart;
            }
            else {
                // get the index of ' (Main)'
                var mainIndex = $scope.searchForm.inputs.depart.indexOf(' (Main)');
                
                // if user selected main hub
                if(mainIndex != -1) {
                    depart = $scope.searchForm.inputs.depart.substring(0, mainIndex);
                }
                else {
                    depart = $scope.searchForm.inputs.depart;
                }

                // set arrive
                arrive = $scope.searchForm.inputs.arrive;
            }

            // get the departing/arriving location
            var foundDepart = _.find($rootScope.$root.airportCodes, { 'name': depart });
            var foundArrive = _.find($rootScope.$root.airportCodes, { 'name': arrive });

            // if both are found
            if(foundDepart && foundArrive) {
                // the data to send
                var searchData = {
                    'depart': { 'iata': foundDepart.iata, 'icao': foundDepart.icao },
                    'arrive': { 'iata': foundArrive.iata, 'icao': foundArrive.icao },
                    'departDate': $scope.searchForm.inputs.departDate,
                    'returnDate': $scope.searchForm.inputs.returnDate,
                    'adults': $scope.searchForm.inputs.adults,
                    'typeFlight': $scope.searchForm.inputs.roundTripOrOneWay == 'round' ? 'round' : 'oneway',
                    'preferredAirlines': ['DL', 'AA', 'WN', 'F9', 'UA', 'NK', 'VX', 'B6', 'G4'],
                    'nonPreferredAirlines': [],
                    'nonStop': $scope.searchForm.inputs.nonStop ? 1 : 0
                };

                // search flights
                FlightsFactory.getFlights(searchData).then(function (responseF) {
                    // if returned a valid response
                    if (responseF && !responseF.error) {
                        // set the data
                        $scope.flights.flightListData = responseF;
                        $scope.flights.flightListTo = responseF.data;
                        $scope.origionalFlightList = [];
                        $scope.filteredFlights = [];

                        // go through each filtered flight and remove any that don't start or end at the selected locations
                        _.forEach(responseF.data, function(value) {
                            if((value.flyFrom == foundDepart.iata || value.flyFrom == foundDepart.icao) 
                                && (value.flyTo == foundArrive.iata || value.flyTo == foundArrive.icao)) {
                                value.fly_duration_minutes = getMinutesFromFlight(value.fly_duration);
                                $scope.origionalFlightList.push(value);
                            }
                        });

                        // the airline filter models
                        $scope.airlineFilterModels = { };
                        $scope.airlineFilterChecks = { };

                        // go through all airlines
                        for(var x = 0; x < responseF.all_airlines.length; x++) {
                            $scope.airlineFilterModels[x] = responseF.all_airlines[x];
                            $scope.airlineFilterChecks[x] = true; // x == responseF.all_airlines.length - 1 ? true : false//
                        };

                        // set up time slider
                        setUpTimeSlider();

                        // set up depart slider
                        setUpDepartSlider();

                        // set up arrive slider
                        setUpArriveSlider();

                        // set up price slider
                        setUpPriceSlider();

                        // set up layover slider
                        setUpLayoverSlider();

                        // apply filter
                        $scope.updateSearchResults();

                        // show the form is no longer in transit
                        $scope.formInTransit = false;
                    }
                    else {
                        // show error
                        swal({
                            title: 'Error!',
                            text: 'Sorry! There was an error: ' + responseF.message,
                            type: 'error',
                            confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                            buttonsStyling: false
                        }).then(function () {
                            // show error
                            $scope.searchForm.errors.generic.message = responseF.message;
                            $scope.searchForm.errors.generic.isError = true;
                            $scope.formInTransit = false;

                            // force apply
                            $scope.$apply();
                        },
                        // handling the promise rejection
                        function (dismiss) {
                            // show error
                            $scope.searchForm.errors.generic.message = responseF.message;
                            $scope.searchForm.errors.generic.isError = true;
                            $scope.formInTransit = false;

                            // force apply
                            $scope.$apply();         
                        });
                    }
                })
                .catch(function (responseF) {
                    // show error
                    swal({
                        title: 'Error!',
                        text: 'Sorry! There was an error: ' + responseF.message,
                        type: 'error',
                        confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                        buttonsStyling: false
                    }).then(function () {
                        // show error
                        $scope.searchForm.errors.generic.message = responseF.message;
                        $scope.searchForm.errors.generic.isError = true;
                        $scope.formInTransit = false;

                        // force apply
                        $scope.$apply();
                    },
                    // handling the promise rejection
                    function (dismiss) {
                        // show error
                        $scope.searchForm.errors.generic.message = responseF.message;
                        $scope.searchForm.errors.generic.isError = true;
                        $scope.formInTransit = false;

                        // force apply
                        $scope.$apply();           
                    });
                });
            }
            else {
                // show error
                swal({
                    title: 'Error!',
                    text: 'Sorry! There was an error: Please try again later.',
                    type: 'error',
                    confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                    buttonsStyling: false
                }).then(function () {
                    // show error
                    $scope.searchForm.errors.generic.message = $rootScope.$root.generalStatusError;
                    $scope.searchForm.errors.generic.isError = true;
                    $scope.formInTransit = false;

                    // force apply
                    $scope.$apply();
                },
                // handling the promise rejection
                function (dismiss) {
                    // show error
                    $scope.searchForm.errors.generic.message = $rootScope.$root.generalStatusError;
                    $scope.searchForm.errors.generic.isError = true;
                    $scope.formInTransit = false;

                    // force apply
                    $scope.$apply();           
                });
            }
        }
    };

    // get specific airline name
    $scope.getAirlineName = function (airlineCode) {
        // get the airline
        var airline = _.find($rootScope.$root.airlines, { 'id': airlineCode});
        return airline ? airline.name : airlineCode;
    };

    // get all airline names in array
    $scope.getAllAirlineNames = function (airlineArr) {
        var arr = [];

        // go through each airline code and add
        _.forEach(airlineArr, function(value) {
            // get the airline
            var airline = _.find($rootScope.$root.airlines, { 'id': value});
            arr.push(airline ? airline.name : value);
        });

        return arr;
    };

    // gets airlines as a tool tip text
    $scope.getAirlinesAsTooltip = function (airlineArr) {
        // drop the first element and return as string
        airlineArr = _.drop(airlineArr);
        return airlineArr.join();
    };

    // get the flight departure time
    $scope.getFlightDepartureTime = function (routes) {
        // get the first time stamp
        var time = routes[0].dTimeUTC;

        // create the options for specific timezone
        var options = {
            'lat': routes[0].latFrom,
            'long': routes[0].lngFrom,
            'timestamp': time,
            'timeZone': 'America/' + (routes[0].cityFrom).replace(/ /g, '_')
        };

        return $rootScope.$root.formatTime($rootScope.$root.locationBasedProvided, $rootScope.$root.formatFromUnixTimeStamp(time), options);
    };

    // get the flight arrival time
    $scope.getFlightArrivalTime = function (routes) {
        // get the last time stamp
        var time = routes[routes.length - 1].aTimeUTC;

        // create the options for specific timezone
        var options = {
            'lat': routes[routes.length - 1].latTo,
            'long': routes[routes.length - 1].lngTo,
            'timestamp': time,
            'timeZone': 'America/' + (routes[routes.length - 1].cityTo).replace(/ /g, '_')
        };

        return $rootScope.$root.formatTime($rootScope.$root.locationBasedProvided, $rootScope.$root.formatFromUnixTimeStamp(time), options);
    };

    // get flight numbers
    $scope.getRouteFlightNumbers = function (routes) {
        // holds the flight numbers
        var flightNos = '';

        var pos = 0;
        // go through each route
        _.forEach(routes, function(value) {
            // tack on the fight number
            pos == 0 ? flightNos += value.flight_no : flightNos += ',' + value.flight_no;
            pos++;
        });

        return flightNos;
    };

    // get flight path
    $scope.getFlightPath = function (routes) {
        // holds the flight numbers
        var flightPath = '';

        var pos = 0;
        // go through each route
        _.forEach(routes, function(value) {
            /*
            // if the initial value
            if(pos == 0) {
                var from = `<div class="d-inline-flex align-items-center"><p class="mb-0 d-inline-block text-center">${value.flyFrom}<small class="d-block text-center">(${value.cityFrom})</small></p><p class="d-inline-block mb-0"> -> </p></div>`;
                var to = `<div class="d-inline-flex align-items-center"><p class="mb-0 d-inline-block text-center">${value.flyTo}<small class="d-block text-center">(${value.cityTo})</small></p></div>`;

                // tack on the fight number
                flightPath += from + ' ' + to;
            }
            else {
                var to = `<div class="d-inline-flex align-items-center"><p class="d-inline-block mb-0"> -> </p><p class="mb-0 d-inline-block text-center">${value.flyTo}<small class="d-block text-center">(${value.cityTo})</small></p></div>`;
                
                // tack on the fight number
                flightPath += to;
            }
            */
            pos == 0 ? flightPath += value.flyFrom + ' -> ' + value.flyTo : flightPath += ' -> ' + value.flyTo;
            pos++;
        });

        return flightPath;
    };

    // get user flight price
    $scope.getUserFlightPrice = function (origionalPrice) {
        // holds the price
        var price = origionalPrice;

        // if user membership
        if(userMembership) {
            // get the discount and subtract from origional price
            var discount = price * userMembership.discount * 0.01;
            price -= discount;
        }

        return $rootScope.$root.formatFloat(price, 2);
    };

    // sort flights
    $scope.sortFlights = function (sortBy) {
        // change based on filter
        switch(sortBy) {
            case 'dTime':
                $scope.sortDirection.dTimeUTC = $scope.sortDirection.dTimeUTC == 'asc' ? 'desc' : 'asc';
                $scope.filteredFlights =  _.orderBy($scope.filteredFlights, ['dTime'], [$scope.sortDirection.dTimeUTC]);
                break;
            case 'aTime':
                $scope.sortDirection.aTimeUTC = $scope.sortDirection.aTimeUTC == 'asc' ? 'desc' : 'asc';
                $scope.filteredFlights =  _.orderBy($scope.filteredFlights, ['aTime'], [$scope.sortDirection.aTimeUTC]);
                break;
            case 'tTime':
                $scope.sortDirection.tTime = $scope.sortDirection.tTime == 'asc' ? 'desc' : 'asc';
                $scope.filteredFlights =  _.orderBy($scope.filteredFlights, ['fly_duration_minutes'], [$scope.sortDirection.tTime]);
                break;
            case 'price':
                $scope.sortDirection.price = $scope.sortDirection.price == 'asc' ? 'desc' : 'asc';
                $scope.filteredFlights =  _.orderBy($scope.filteredFlights, ['price'], [$scope.sortDirection.price]);                
                break;
            default:
                break;
        }

        // sort
        //$scope.filteredFlights =  _.orderBy($scope.filteredFlights, ['dTime', 'aTime', 'fly_duration', 'price'], [$scope.sortDirection.dTimeUTC, $scope.sortDirection.aTimeUTC, $scope.sortDirection.tTime, $scope.sortDirection.price]);
    };

    // update time slider value
    $scope.updateTimeSliderValue = function () {
        var currentHours = Math.floor($scope.timeSlider.value / 60);
        var currentMins = $scope.timeSlider.value - (currentHours * 60);

        // if there are hours
        if(currentHours > 0) {
            $scope.timeSlider.displayValue = currentHours + 'h';
        }
        
        // if there are minutes
        if(currentMins > 0) {
            $scope.timeSlider.displayValue += currentHours > 0 ? ' ' + currentMins + 'm' : currentMins + 'm';
        }
    };

    // update depart slider value
    $scope.updateDepartSliderValue = function () {
        $scope.departSlider.displayValue = $rootScope.$root.formatTime($rootScope.$root.timeShortNoSeconds, $rootScope.$root.formatFromUnixTimeStamp($scope.departSlider.value));
    };

    // update arrival slider value
    $scope.updateArriveSliderValue = function () {
        $scope.arriveSlider.displayValue = $rootScope.$root.formatTime($rootScope.$root.timeShortNoSeconds, $rootScope.$root.formatFromUnixTimeStamp($scope.arriveSlider.value));        
    };

    // update price slider value
    $scope.updatePriceSliderValue = function () {
        $scope.priceSlider.displayValue = '$' + $scope.priceSlider.value;
    };

    // update layover slider value
    $scope.updateLayoverSliderValue = function () {
        // if zero
        if($scope.layoverSlider.value == 0) {
            $scope.layoverSlider.displayValue = 'Nonstop';            
        }
        else if($scope.layoverSlider.value == 1) {
            $scope.layoverSlider.displayValue = $scope.layoverSlider.value + ' stop';            
        }
        else {
            $scope.layoverSlider.displayValue = $scope.layoverSlider.value + ' stops';            
        }
    };

    // updates search results
    $scope.updateSearchResults = function () {
        // get airline values
        var airlineValues = [];

        // checked values
        var checkValues = Object.values($scope.airlineFilterChecks);
        for(var x = 0; x < checkValues.length; x++) {
            // if value is checked
            if(checkValues[x]) {
                airlineValues.push($scope.airlineFilterModels[x]);
            }
        }

        // filter results
        $scope.filteredFlights = _.filter($scope.origionalFlightList, function(o) {
            // check if this flight matches any of the selected airline
            var isAirline = airlineValues.some(function (v) {
                return o.airlines.indexOf(v) != -1;
            });

            // check if this flight length is within time range
            var flightLength = getMinutesFromFlight(o.fly_duration);
            var isFlightTimeLessThan = flightLength <= $scope.timeSlider.value;

            // check if this flight depart/arrive time is within range
            var isFlightDepartTimeGreaterThan = o.route[0].dTimeUTC >= $scope.departSlider.value;
            var isFlightArriveTimeLessThan = o.route[o.route.length - 1].aTimeUTC <= $scope.arriveSlider.value;

            // check if this flight price is within range
            var isFlightPriceLessThan = o.price <= $scope.priceSlider.value;

            // check if this flight layovers is within range
            var isFlightLayoverLessThan = o.route.length <= $scope.layoverSlider.value;

            return isAirline && isFlightTimeLessThan && isFlightDepartTimeGreaterThan && isFlightArriveTimeLessThan && isFlightPriceLessThan && isFlightLayoverLessThan; 
        });
    };

    // selects the flight
    $scope.selectFlight = function (flight) {
        // TODO: implement
        swal({
            title: 'Sorry!',
            text: 'This feature isn\'t available yet',
            type: 'info',
            confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
            buttonsStyling: false,
            timer: 2500
        }).then(function () {},
        // handling the promise rejection
        function (dismiss) {});
    };

    // initialize page
    function initializePage() {
        // show the header if not shown     
        if (!$rootScope.$root.showHeader) {
            $rootScope.$root.showHeader = true;
        }

        // show the footer if not shown
        if (!$rootScope.$root.showFooter) {
            $rootScope.$root.showFooter = true;
        }

        // if page hasn't been requested yet
        if(!pageRequested) {
            // set page has been requested
            pageRequested = true;

            // show the page after a timeout
            $timeout(getPageData, $rootScope.$root.getPageDataTimeout);
        }
    };

    // gets the page data
    function getPageData() {
        // initialize
        $scope.flights = {};
                
        // get flights page data
        FlightsFactory.getFlightsPageInformation().then(function (responseF) {
            // if returned a valid response
            if (responseF && !responseF.error) {
                // set the data
                $scope.flights.data = responseF;
                $scope.flights.title = 'Flights';
                $scope.flights.pageHeader = $scope.flights.title;
                $scope.flights.pageSubHeader = $rootScope.$root.isLoggedIn ? `Hey ${$window.user.firstName}, where do you wanna go?` : 'Please sign in to search flights';

                // holds the page title
                $scope.pageTitle = $scope.flights.title + ' | ' + ApplicationConfiguration.applicationName;
                
                // holds the animation time
                $scope.animationStyle = $rootScope.$root.getAnimationDelay();

                // setup page
                setUpPage();
            }
            else {
                // set error
                $scope.pageTitle = responseF.title;
                $scope.error.error = true;
                $scope.error.title = responseF.title;
                $scope.error.status = responseF.status;
                $scope.error.message = responseF.message;

                // setup page
                setUpPage();
            }
        })
        .catch(function (responseF) {
            // set error
            $scope.pageTitle = responseF.title;
            $scope.error.error = true;
            $scope.error.title = responseF.title;
            $scope.error.status = responseF.status;
            $scope.error.message = responseF.message;

            // setup page
            setUpPage();
        });
    };

    // sets up the page
    function setUpPage() {
        // set up the title
        var titleDOM = document.getElementById('pageTitle');
        var title = '\'' + $scope.pageTitle + '\'';
        titleDOM.setAttribute('ng-bind-html', title);
        $compile(titleDOM)($scope);

        // set page fully loaded
        $scope.pageFullyLoaded = true;

        // show the page after a timeout
        $timeout(showPage, $rootScope.$root.showPageTimeout);
    };

    // shows the page
    function showPage() {
        // check if collapsing is already occuring
        if(!angular.element('#pageShow').hasClass('collapsing')) {
            // show the page
            angular.element('#pageShow').collapse('show');

            // if an error does not exists
            if(!$scope.error.error) {
                // setup all waypoints
                setUpWaypoints();

                // checks if user is logged in
                checkLoggedIn();
            }
        }
    };

    // sets up all waypoints
    function setUpWaypoints() {
        // get the starting offset
        var startOffset = $rootScope.$root.getWaypointStart();

        // initialize the waypoint list
        var waypointList = [
            { id: 'flights-FIXME', offset: startOffset, class: 'animated fadeIn' }
        ];

        // set up waypoints
        $rootScope.$root.setUpWaypoints(waypointList);
    };

    // checks if user is logged in
    function checkLoggedIn() {
        // if user not logged in, open up drop down to tell user to login
        if(!$rootScope.$root.isLoggedIn) {
            // show not signed in
            swal({
                title: 'Not Signed In!',
                text: 'Please sign in to view flights',
                type: 'info',
                confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                buttonsStyling: false,
                timer: 2500
            }).then(function () {
                // wait a second before showing
                $timeout(function() {
                    // show dropdown login form
                    $('#navbarDropdownLogin').dropdown('toggle');
                }, 500);
            },
            // handling the promise rejection
            function (dismiss) {
                // wait a second before showing
                $timeout(function() {
                    // show dropdown login form
                    $('#navbarDropdownLogin').dropdown('toggle');
                }, 500);              
            });
        }
        else {
            // initialize
            $scope.hub = {};
            
            // set loading hubs
            $scope.loadingHubs = true;

            // get hub page data
            AccountFactory.getHubPageInformation().then(function (responseH) {
                // if returned a valid response
                if (responseH && !responseH.error) {
                    // set the data
                    $scope.hub.data = responseH;

                    // add initial text
                    $scope.hubOptions.options.push($scope.initialText);

                    // add all available hubs and home locations
                    _.forEach(responseH.hubs, function(value) {
                        // get the airport code
                        var hubAirport = value.iata ? value.iata : value.icao;

                        // if main
                        if(value.main) {
                            // set main
                            $scope.hubOptions.options.push(`${value.name} (Main)`);
                        }
                        else {
                            // set hub
                            $scope.hubOptions.options.push(value.name);
                        }
                    });

                    // TODO: remove me, used for testing
                    //$scope.searchForm.inputs.depart = $scope.hubOptions.options[$scope.hubOptions.options.length - 1];

                    // if the user doesn't have hubs
                    if(responseH.hubs.length == 0) {
                        // show error
                        swal({
                            title: 'No hubs!',
                            text: 'Sorry! It looks like you don\'t have any hubs. Lets add some!',
                            type: 'info',
                            confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                            buttonsStyling: false
                        }).then(function () {
                            // go to account page
                            $window.href = '/account/hubs';
                        },
                        // handling the promise rejection
                        function (dismiss) {
                            // go to account page
                            $window.href = '/account/hubs';
                        });
                    }
                    else {
                        // get the tiers
                        TierFactory.getTiers().then(function (responseT) {
                            // if returned a valid response
                            if (responseT && !responseT.error) {
                                // get user membership
                                _.forEach(responseT, function(value) {
                                    // if membership matches
                                    if(window.user.membership.tierId == value._id) {
                                        userMembership = _.cloneDeep(value);
                                    }
                                });
                                
                                // if membership not found
                                if(!userMembership) {
                                    // set no longer attempting to load hubs
                                    $scope.loadingHubs = undefined;

                                    // show error
                                    swal({
                                        title: 'Error!',
                                        text: 'Sorry! There was an error: Couldn\'t get your membeship information',
                                        type: 'error',
                                        confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                                        buttonsStyling: false
                                    }).then(function () {},
                                    // handling the promise rejection
                                    function (dismiss) {});
                                }
                                else {
                                    // set no longer loading hubs
                                    $scope.loadingHubs = false;
                                }
                            }
                            else {
                                // set error
                                $scope.pageTitle = responseT.title;
                                $scope.error.error = true;
                                $scope.error.title = responseT.title;
                                $scope.error.status = responseT.status;
                                $scope.error.message = responseT.message;

                                // set no longer attempting to load hubs
                                $scope.loadingHubs = undefined;

                                // show error
                                swal({
                                    title: 'Error!',
                                    text: 'Sorry! There was an error: ' + responseT.message,
                                    type: 'error',
                                    confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                                    buttonsStyling: false
                                }).then(function () {},
                                // handling the promise rejection
                                function (dismiss) {});
                            }
                        })
                        .catch(function (responseT) {
                            // set error
                            $scope.pageTitle = responseT.title;
                            $scope.error.error = true;
                            $scope.error.title = responseT.title;
                            $scope.error.status = responseT.status;
                            $scope.error.message = responseT.message;

                            // set no longer loading attempting to load hubs
                            $scope.loadingHubs = undefined;

                            // show error
                            swal({
                                title: 'Error!',
                                text: 'Sorry! There was an error: ' + responseT.message,
                                type: 'error',
                                confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                                buttonsStyling: false
                            }).then(function () {},
                            // handling the promise rejection
                            function (dismiss) {});
                        });
                    }
                }
                else {
                    // set no longer loading attempting to load hubs
                    $scope.loadingHubs = undefined;
                    
                    // show error
                    swal({
                        title: 'Error!',
                        text: 'Sorry! There was an error: ' + responseH.message,
                        type: 'error',
                        confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                        buttonsStyling: false
                    }).then(function () {},
                    // handling the promise rejection
                    function (dismiss) {});
                }
            })
            .catch(function (responseH) {
                // set no longer loading attempting to load hubs
                $scope.loadingHubs = undefined;

                // show error
                swal({
                    title: 'Error!',
                    text: 'Sorry! There was an error: ' + responseH.message,
                    type: 'error',
                    confirmButtonClass: 'btn btn-theme-primary btn-cursor-pointer',
                    buttonsStyling: false
                }).then(function () {},
                // handling the promise rejection
                function (dismiss) {});
            });
        }
    };

    // checks for any errors in the values
    function checkErrorValues() {
        // check for any empty values
        $scope.searchForm.errors.depart.isError = !$scope.searchForm.inputs.depart || $scope.searchForm.inputs.depart.length == 0 || ($scope.hubDirection == 'depart' && $scope.searchForm.inputs.depart == $scope.initialText)
                                                    || ($scope.hubDirection == 'depart' && _.indexOf($scope.hubOptions.options, $scope.searchForm.inputs.depart) == -1)
                                                    || ($scope.hubDirection == 'arrive' && _.findIndex($rootScope.$root.airportCodes, { 'name': $scope.searchForm.inputs.depart }) == -1);
        $scope.searchForm.errors.arrive.isError = !$scope.searchForm.inputs.arrive || $scope.searchForm.inputs.arrive.length == 0 || ($scope.hubDirection == 'arrive' && $scope.searchForm.inputs.arrive == $scope.initialText)
                                                    || ($scope.hubDirection == 'arrive' && _.indexOf($scope.hubOptions.options, $scope.searchForm.inputs.arrive) == -1)
                                                    || ($scope.hubDirection == 'depart' && _.findIndex($rootScope.$root.airportCodes, { 'name': $scope.searchForm.inputs.arrive }) == -1);
        $scope.searchForm.errors.departDate.isError = !$scope.searchForm.inputs.departDate || $scope.searchForm.inputs.departDate.length == 0;
        $scope.searchForm.errors.returnDate.isError = (!$scope.searchForm.inputs.returnDate || $scope.searchForm.inputs.returnDate.length == 0) && $scope.searchForm.inputs.roundTripOrOneWay == 'round';
        $scope.searchForm.errors.adults.isError = !$scope.searchForm.inputs.adults || $scope.searchForm.inputs.adults < 1;

        // set specific text based on empty or equality
        if($scope.hubDirection == 'arrive' && _.findIndex($rootScope.$root.airportCodes, { 'name': $scope.searchForm.inputs.depart }) == -1) {
            $scope.searchForm.errors.depart.message = $scope.searchForm.errors.depart.optionalMessages[3];
        }
        else if($scope.hubDirection == 'depart' && _.findIndex($rootScope.$root.airportCodes, { 'name': $scope.searchForm.inputs.arrive }) == -1) {
            $scope.searchForm.errors.arrive.message = $scope.searchForm.errors.arrive.optionalMessages[3];
        }

        if($scope.hubDirection == 'depart' && $scope.searchForm.inputs.depart != $scope.initialText && _.indexOf($scope.hubOptions.options, $scope.searchForm.inputs.depart) == -1) {
            $scope.searchForm.errors.depart.message = $scope.searchForm.errors.depart.optionalMessages[2];
        }
        else if($scope.hubDirection == 'arrive' && $scope.searchForm.inputs.arrive != $scope.initialText && _.indexOf($scope.hubOptions.options, $scope.searchForm.inputs.arrive) == -1) {
            $scope.searchForm.errors.arrive.message = $scope.searchForm.errors.arrive.optionalMessages[2];
        }

        if($scope.searchForm.inputs.depart == $scope.searchForm.inputs.arrive) {
            $scope.searchForm.errors.depart.message = $scope.searchForm.errors.depart.optionalMessages[1];
            $scope.searchForm.errors.arrive.message = $scope.searchForm.errors.arrive.optionalMessages[1];
        }
        if(!$scope.searchForm.inputs.depart || $scope.searchForm.inputs.depart.length == 0 || ($scope.hubDirection == 'depart' && $scope.searchForm.inputs.depart == $scope.initialText)) {
            $scope.searchForm.errors.depart.message = $scope.searchForm.errors.depart.optionalMessages[0];
        }
        if(!$scope.searchForm.inputs.arrive || $scope.searchForm.inputs.arrive.length == 0 || ($scope.hubDirection == 'arrive' && $scope.searchForm.inputs.arrive == $scope.initialText)) {
            $scope.searchForm.errors.arrive.message = $scope.searchForm.errors.arrive.optionalMessages[0];
        }
    };

    // set up the time slider
    function setUpTimeSlider() {
        // reset min/max
        $scope.timeSlider.min = 0;
        $scope.timeSlider.max = 0;

        // go through each time length and find the min/max
        _.forEach($scope.origionalFlightList, function(value) {
            // convert to minutes and add to total minute values
            //var totalMins = getMinutesFromFlight(value.fly_duration);
            
            // check the min/max
            $scope.timeSlider.min = $scope.timeSlider.min == 0 || value.fly_duration_minutes <  $scope.timeSlider.min ? value.fly_duration_minutes : $scope.timeSlider.min;
            $scope.timeSlider.max = $scope.timeSlider.max == 0 || value.fly_duration_minutes >  $scope.timeSlider.max ? value.fly_duration_minutes : $scope.timeSlider.max;
        });

        // set the current value as the max value
        $scope.timeSlider.value = $scope.timeSlider.max;
        $scope.updateTimeSliderValue();
    };

    // get minutes from flight length
    function getMinutesFromFlight(flightLength) {
        var totalMins = 0;

        // 18h 23m
        var hm = flightLength;
        hm = hm.toLowerCase();
        hm = hm.split(' ');

        // if there are two values
        if(hm.length == 2) {
            var hours = parseInt(hm[0].substring(0, hm[0].indexOf('h')));
            var mins = parseInt(hm[1].substring(0, hm[1].indexOf('m')));

            // convert to minutes and add to total minute values
            totalMins = hours * 60 + mins;
        }
        else if(hm.length == 1) {
            // get index of h or m
            var hIndex = hm[0].substring(0, hm[0].indexOf('h'));
            var mIndex = hm[0].substring(0, hm[0].indexOf('m'));

            // if hours
            if(hIndex != -1) {
                var hours = parseInt(hm[0].substring(0, hIndex));

                // convert to minutes and add to total minute values
                totalMins = hours * 60;
            }
            // if minutes
            else if(mIndex != -1) {
                totalMins = parseInt(hm[1].substring(0, mIndex));
            }
        }
        else {
            console.log('why is there 3 spaces?!?!!?! (time slider');
        }

        return totalMins;
    };

    // set up depart slider
    function setUpDepartSlider() {
        // reset min/max
        $scope.departSlider.min = 0;
        $scope.departSlider.max = 0;

        // go through each time length and find the min/max
        _.forEach($scope.origionalFlightList, function(value) {
            // check the min/max
            $scope.departSlider.min = $scope.departSlider.min == 0 || value.route[0].dTimeUTC <  $scope.departSlider.min ? value.route[0].dTimeUTC : $scope.departSlider.min;
            $scope.departSlider.max = $scope.departSlider.max == 0 || value.route[0].dTimeUTC >  $scope.departSlider.max ? value.route[0].dTimeUTC : $scope.departSlider.max;
        });

        // set the current value as the min value
        $scope.departSlider.value = $scope.departSlider.min;
        $scope.updateDepartSliderValue();
    };

    // set up arrive slider
    function setUpArriveSlider() {
        // reset min/max
        $scope.arriveSlider.min = 0;
        $scope.arriveSlider.max = 0;

        // go through each time length and find the min/max
        _.forEach($scope.origionalFlightList, function(value) {
            // check the min/max
            $scope.arriveSlider.min = $scope.arriveSlider.min == 0 || value.route[value.route.length - 1].aTimeUTC <  $scope.arriveSlider.min ? value.route[value.route.length - 1].aTimeUTC : $scope.arriveSlider.min;
            $scope.arriveSlider.max = $scope.arriveSlider.max == 0 || value.route[value.route.length - 1].aTimeUTC >  $scope.arriveSlider.max ? value.route[value.route.length - 1].aTimeUTC : $scope.arriveSlider.max;
        });

        // set the current value as the max value
        $scope.arriveSlider.value = $scope.arriveSlider.max;
        $scope.updateArriveSliderValue();
    };

    // set up price slider
    function setUpPriceSlider() {
        // reset min/max
        $scope.priceSlider.min = 0;
        $scope.priceSlider.max = 0;

        // go through each time length and find the min/max
        _.forEach($scope.origionalFlightList, function(value) {
            // get the user price
            var userPrice = $scope.getUserFlightPrice(value.price);
            userPrice = parseFloat(userPrice);

            // check the min/max
            $scope.priceSlider.min = $scope.priceSlider.min == 0 || userPrice <  $scope.priceSlider.min ? userPrice : $scope.priceSlider.min;
            $scope.priceSlider.max = $scope.priceSlider.max == 0 || userPrice >  $scope.priceSlider.max ? userPrice : $scope.priceSlider.max;
        });

        // round up to nearest 100
        $scope.priceSlider.min = Math.floor($scope.priceSlider.min / 100) * 100;

        // round up to nearest 100
        $scope.priceSlider.max = Math.ceil($scope.priceSlider.max / 100) * 100;

        // set the current value as the max value
        $scope.priceSlider.value = $scope.priceSlider.max;
        $scope.updatePriceSliderValue();
    };

    // set up layover slider
    function setUpLayoverSlider() {
        // reset min/max
        $scope.layoverSlider.min = 0;
        $scope.layoverSlider.max = 0;

        // go through each time length and find the min/max
        _.forEach($scope.origionalFlightList, function(value) {
            // check the max
            $scope.layoverSlider.max = $scope.layoverSlider.max == 0 || value.route.length >  $scope.layoverSlider.max ? value.route.length : $scope.layoverSlider.max;
        });

        // set the current value as the max value
        $scope.layoverSlider.value = $scope.layoverSlider.max;
        $scope.updateLayoverSliderValue();
    };
}]);