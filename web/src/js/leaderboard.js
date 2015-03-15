var reqwest = require('reqwest');
var $ = require('jquery');
var _ = require('lodash');
var L = require('leaflet');
var moment = require('moment');
require('moment-timezone');
var loader = require('./loader');
var providers = require('./leaflet/providers');
var leafletAwesomeMarkers = require('../vendor/leaflet.awesome-markers/leaflet.awesome-markers');
var liveUpdater = require('./live-updater');
var Assets = require('./resources/assets');
var Survivor = require('./resources/survivor');
var Notifier = require('./notifications/notifier');
var awesomeMarkerColors = require('./util/awesome-marker-css-colors');

var search = require('../vendor/leaflet-search/leaflet-search');

var serverFailure = function (resp) {
    Notifier.failure({
        title: 'Trakit is down.',
        message: 'Server returned: ' + resp.response
    });
}

var addUserInfoToPanel = function (user) {
  $( "#user-panel" ).find('.name').text(user.properties.name);
  $( "#user-panel" ).find('.score').text(user.properties.data.event);
}

var generateTable = function(resp){
  var table =  $( "tbody" ); 
  resp.map(function(item){
    var row =  '<tr>' +
                  '<td>' + resp.asset.name + '</td>' +
                  '<td>' + resp.distance +'</td>' +
                '</tr>'
    table.append(row);
  });
}

function init() {
  loader.show();
  Survivor.getLeaderBoard()
  .then(function(result) {
    loader.hide();
    generateTable(result);
    liveUpdater.start({tiid: result.maxTiid});
  }, function(error) {
    console.log('Error retrieving assets: ', error);
  });

}

module.exports = {
  init: init
};