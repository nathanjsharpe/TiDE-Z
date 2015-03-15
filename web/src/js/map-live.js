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
var Landmarks = require('./resources/landmarks');
var trakitMap = require('./leaflet/map');
var Notifier = require('./notifications/notifier');
var awesomeMarkerColors = require('./util/awesome-marker-css-colors');
var Geofences = require('./resources/geofences');

var search = require('../vendor/leaflet-search/leaflet-search');

L.Icon.Default.imagePath = '../../node_modules/leaflet/dist/images/';

var serverFailure = function (resp) {
    Notifier.failure({
        title: 'Trakit is down.',
        message: 'Server returned: ' + resp.response
    });
}

var addUserInfoToPanel = function (user) {
  $( "#user-panel" ).find('#js-name').text(user.properties.name);
  $( "#user-panel" ).find('#js-compnay').text(user.properties.asset.notes);
  $( "#user-panel" ).find('#js-group').text(user.properties.asset.group);
  $( "#user-panel" ).find('#js-distance').text(user.properties.asset.event);
}

liveUpdater.registerSuccessCallback(function(resp) {
  resp.original.forEach(function(msg) {
    if (trakitMap.data.markers[msg.asset_id]) {
      // Remove oldest circle marker from map and from array
      trakitMap.data.trailsLayer.removeLayer(trakitMap.data.trailMarkers[msg.asset_id].shift());

      // Add circle marker at current marker location, add to  array
      var stupidColor = trakitMap.data.markers[msg.asset_id]._icon.className.match(/awesome-marker-icon-(\S+)/)[1]
      var newMarker = L.circleMarker(trakitMap.data.markers[msg.asset_id].getLatLng(), {
        color: '#' + awesomeMarkerColors[stupidColor]
      });
      newMarker.bindPopup(assetPopupContent(msg));
      trakitMap.data.trailsLayer.addLayer(newMarker);
      trakitMap.data.trailMarkers[msg.asset_id].push(newMarker);

      // Move marker to new location
      trakitMap.data.markers[msg.asset_id].setLatLng(L.latLng(
        msg.latitude,
        msg.longitude
      ));

      // Move map to new location if device is focused
      if (msg.asset_id === trakitMap.data.focusedDevice) {
        trakitMap.map.panTo(L.latLng(
          msg.latitude,
          msg.longitude
        ), {duration: 0.5});
      }
    }
  });
});

function setUpSearch (map, geoJson) {

    var searchControl = new L.Control.Search({layer: geoJson, propertyName: 'name', circleLocation:false});

    searchControl.on('search_locationfound', function(e) {
      trakitMap.data.focusedDevice = e.layer.feature.properties.asset.deviceAddress;
      trakitMap.focusAndZoom([e.latlng.lat, e.latlng.lng]);
    });

    trakitMap.map.addControl( searchControl );  //inizialize search control
}

liveUpdater.registerSuccessCallback(function (resp) {
  var sameAssetId= '';
  resp.original.forEach(function(msg) {
    var emergencyStatus = false;
    if(msg.data && msg.data.trakit_emergency_mode === "true"){
      emergencyStatus = true;
    }
    if (emergencyStatus && (msg.asset_id != sameAssetId)) {
      sameAssetId = msg.asset_id;
      // Notifier.emergency({
      //   assetMessage: msg
      // });
      Notifier.setNotifier({
        assetMessage: msg
      });
      $("[data-notify='click']").on('click', function(){
        trakitMap.focusAndZoom([msg.latitude, msg.longitude]);
        trakitMap.data.focusedDevice = msg.asset_id;
      });
    }
  });
});

function zoomToFeature(e) {
    trakitMap.map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    if (feature.properties) {
        layer.bindPopup(assetPopupContent(feature));
        layer.on({
          dblclick: function() {
            if (trakitMap.data.focusedDevice == feature.properties.asset.deviceAddress) {
              trakitMap.data.focusedDevice = null;
            } else {
              trakitMap.data.focusedDevice = feature.properties.asset.deviceAddress;
            }
          }
        });
    }
}

function assetPopupContent(feature) {
    var message = feature,
        asset;

    if (feature.properties) {
        message = feature.properties;
    }

    if (message.asset == undefined) {
        message.asset = trakitMap.data.assets[message.asset_id][0].properties.asset;
    }

    var dataList = '<ul>';
    if (message.data) {
      for(var prop in message.data) {
        dataList += '<li><b>' + prop + ':</b> ' + message.data[prop] + '</li>';
      }
    } else {
      dataList += "None"
    }
    dataList += '</ul>';

    var popupContent = '<h4>'+ message.asset.name +'</h4>' +
      '<table class="popup-table">' +
        '<tr><td><b>Date:</b></td><td>' +  moment(message.timestamp).tz("America/Chicago").format('MM/DD/YY') + '</td></tr>' +
        '<tr><td><b>Time: </b></td><td>' + moment(message.timestamp).tz("America/Chicago").format('h:mm a') + ' CST</td></tr>' +
        '<tr><td><b></b></td><td>' + moment(message.timestamp).fromNow() +
        '<tr><td><b>Speed: </b></td><td>' + message.speed + '</td></tr>' +
        '<tr><td><b>Altitude: </b></td><td>' + message.altitude + '</td></tr>' +
        '<tr><td><b>Lat, Lng: </b></td><td>' + message.latitude + ',' + message.longitude + '</td></tr>' +
        '<tr><td><b>Data: </b></td><td>' + dataList + '</td></tr>' +
      '</table>';

    return popupContent;
}

function pointToLayer(feature, latlng) {
  var markerOptions = {
    icon: L.AwesomeMarkers.icon({
      icon: feature.properties.asset.icon || 'question',
      markerColor: feature.properties.asset.color || 'blue',
      prefix: 'fa'
    })
  }
  var marker = L.marker(latlng, markerOptions);
  trakitMap.data.markers[feature.properties.asset.deviceAddress] = marker;
  return marker;
}

function trailPointToLayer(feature, latlng) {
  var markerOptions = {
        color: '#' + awesomeMarkerColors[feature.properties.asset.color]
      },
      marker = L.circleMarker(latlng, markerOptions);

  if (trakitMap.data.trailMarkers[feature.properties.asset.deviceAddress] == undefined) {
    trakitMap.data.trailMarkers[feature.properties.asset.deviceAddress] = [];
  }
  trakitMap.data.trailMarkers[feature.properties.asset.deviceAddress].unshift(marker);
  return marker;
}

function init() {
  trakitMap.init('map-live');

  trakitMap.data.markers = {};
  trakitMap.data.trailMarkers = {};
  trakitMap.data.focusedDevice = null; // to make !== undefined
  trakitMap.data.assets = {};

  loader.show();

  Assets.getAllWithTrails()
  .then(function(result) {
    console.log(result)
    loader.hide();
    trakitMap.data.assets = _.groupBy(result.assets, function(a) { return a.properties.asset.deviceAddress });
    setupMap(result.assets, result.trails);
    liveUpdater.start({tiid: result.maxTiid});
  }, function(error) {
    console.log('Error retrieving assets: ', error);
  });

  Landmarks.addAllAsLayer()
  .fail(function(error) {
    console.log('Error adding landmarks: ', error);
  });

  Geofences.addAllAsLayer()
  .fail(function(error) {
    console.log('Error adding geofences: ', error);
  });

  function setupMap(assets, trails, callback) {
    geojson = L.geoJson(assets, {
      onEachFeature: onEachFeature,
      pointToLayer: pointToLayer
    }).addTo(trakitMap.map);

    trakitMap.data.trailsLayer = L.geoJson(trails, {
      onEachFeature: onEachFeature,
      pointToLayer: trailPointToLayer
    });

    trakitMap.layerControl.addOverlay(trakitMap.data.trailsLayer, 'Asset Trails');

    trakitMap.map.fitBounds(geojson.getBounds());

    if (callback != undefined) {
      callback();
    }

    trakitMap.addTransitionToMarkers();

    // take care of zoom quirks
    trakitMap.map.on("zoomstart", function(e) {
      trakitMap.removeTransitionFromMarkers();
    });
    trakitMap.map.on("zoomend", function(e) {
      trakitMap.addTransitionToMarkers();
    })
    addUserInfoToPanel(assets[0]);
    setUpSearch(trakitMap.map, geojson);
  }
}

module.exports = {
  init: init
};