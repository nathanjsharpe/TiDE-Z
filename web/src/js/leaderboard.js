var reqwest = require('reqwest');
var $ = require('jquery');
var _ = require('lodash');
var L = require('leaflet');
var moment = require('moment');
require('moment-timezone');
var loader = require('./loader');
var providers = require('./leaflet/providers');
var leafletAwesomeMarkers = require('../vendor/leaflet.awesome-markers/leaflet.awesome-markers');
var Survivor = require('./resources/survivor');
var Notifier = require('./notifications/notifier');
var awesomeMarkerColors = require('./util/awesome-marker-css-colors');
var leaderboardTemplate = require('./templates/leaderboard');
var Handlebars = require('handlebars');

var search = require('../vendor/leaflet-search/leaflet-search');

var serverFailure = function (resp) {
    Notifier.failure({
        title: 'Trakit is down.',
        message: 'Server returned: ' + resp.response
    });
}

Handlebars.registerHelper("inc", function(value, options) {
    return parseInt(value) + 1;
});

Handlebars.registerHelper("distance", function(distance, options)
{
    return parseFloat(distance).toFixed(2);
});

var template;

var addUserInfoToPanel = function (user) {
  $( "#user-panel" ).find('.name').text(user.properties.name);
  $( "#user-panel" ).find('.score').text(user.properties.data.event);
}

var generateTable = function(resp){
  var context = { survivors: resp }
  var html = template(context);
  $('table tbody').html(html);
}

function setupNext(interval) {
  window.setTimeout(function() {
    Survivor.getLeaderBoard()
    .then(function(result) {
      loader.hide();
      generateTable(result);
      setupNext(1500);
    }, function(error) {
      console.log('Error retrieving assets: ', error);
    });
  }, interval)
}

function init() {
  loader.show();
  template = Handlebars.compile(leaderboardTemplate);
  setupNext(10);
}

module.exports = {
  init: init
};