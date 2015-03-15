var reqwest = require('reqwest');
var config = require('../configuration');
var Q = require('q');
var _ = require('lodash');
var Options = require('../util/Options');
var L = require('leaflet');
var trakitMap = require('../leaflet/map');
var leafletAwesomeMarkers = require('../../vendor/leaflet.awesome-markers/leaflet.awesome-markers');

var landmarkUrl = [config.appApiUrl, 'landmark'].join('/');

function getAllLandmarks(opts) {
    var options = new Options(config.defaultReqwestOpts)
        .merge({
            url: landmarkUrl,
            method: 'get'
        })
        .merge(opts);

    return reqwest(options);
}

function createLandmark(landmark, opts) {
    var options = new Options(config.defaultReqwestOpts)
        .merge({
            url:    landmarkUrl,
            method: 'post',
            data:   JSON.stringify(landmark)
        })
        .merge(opts);

    return reqwest(options);
}

function deleteLandmark(landmarkId, opts) {
    var options = new Options(config.defaultReqwestOpts)
        .merge({
            url:    landmarkUrl + '/' + landmarkId,
            method: 'delete'
        })
        .merge(opts);

    return reqwest(options);
}

function updateLandmark(landmark, opts) {
    var options = new Options(config.defaultReqwestOpts)
        .merge({
            url:    landmarkUrl + '/' + landmark.id,
            method: 'put',
            data:   JSON.stringify(landmark)
        })
        .merge(opts);

    return reqwest(options);
}

function createOrUpdateLandmark(landmark, opts) {
    if (landmark.id) {
        return updateLandmark(landmark, opts);
    } else {
        return createLandmark(landmark, opts);
    }
}

function addAllAsLayer(opts) {
    var options = new Options(opts);

    return getAllLandmarks(options)
    .then(function(landmarks) {
        addLandmarksToMap(landmarks, options);
    })
    .fail(function(error) {
        console.log('Error retrieving landmarks: ', error);
    })
}

function addLandmarksToMap(landmarks, opts) {
    var landmarkMarkers = [],
        landmarksGroup;

    var options = new Options({
        controlTitle: 'Landmarks',
        markerColor: 'black'
    })
    .merge(opts);

    landmarks.forEach(function(landmark) {
      var markerOptions, marker;

      markerOptions = {
        icon: L.AwesomeMarkers.icon({
          icon: landmark.icon,
          markerColor: options.markerColor,
          prefix: 'fa'
        })
      }

      marker = L.marker([landmark.latitude, landmark.longitude], markerOptions)
                .bindPopup(landmarkPopupContent(landmark));
      landmarkMarkers.push(marker);
    });

    landmarksGroup = L.layerGroup(landmarkMarkers);
    trakitMap.layerControl.addOverlay(landmarksGroup, options.controlTitle);
}

function landmarkPopupContent(landmark) {
  var popupContent = '<h4>'+ landmark.name +'</h4>' +
    '<p>' + landmark.description + '</p>';

  return popupContent;
}

module.exports = {
    getAll: getAllLandmarks,
    create: createLandmark,
    delete: deleteLandmark,
    addAllAsLayer: addAllAsLayer,
    update: updateLandmark,
    createOrUpdate: createOrUpdateLandmark
}