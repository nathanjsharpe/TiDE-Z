var reqwest = require('reqwest');
var config = require('../configuration');
var Q = require('q');
var _ = require('lodash');
var Options = require('../util/Options');
var trakitMap = require('../leaflet/map');

var geofenceUrl = [config.appApiUrl, 'geoFence'].join('/');

function getAllGeofences(opts) {
    var options = new Options(config.defaultReqwestOpts)
        .merge({
            url: geofenceUrl,
            method: 'get'
        })
        .merge(opts);

    return reqwest(options);
}

function getAllGeofencesAsGeoJSON(opts) {
    return getAllGeofences()
    .then(function(geofences) {
        return _.filter(geofences, nonCircles).map(geofenceGeojson);
    })
    .fail(function(error) {
        return error;
    });
}

function nonCircles(geofence) {
    return geofence.geometry.type != "Circle";
}

function geofenceGeojson(geofence) {
    return {
        type: "Feature",
        id: geofence.id,
        properties: {
            name: geofence.name,
            description: geofence.description,
            inclusive: geofence.inclusive == "true" ? true : false,
            assetIds: geofence.asset_ids
        },
        geometry: {
            type: "Polygon",
            coordinates: [geofence.geometry.coordinates]
        }
    }
}

function createGeofence(geofence, opts) {
    var options = new Options(config.defaultReqwestOpts)
        .merge({
            url:    geofenceUrl,
            method: 'post',
            data:   JSON.stringify(geoFenceJson(geofence))
        })
        .merge(opts);

    return reqwest(options);
}

function deleteGeofence(geofenceId, opts) {
    var options = new Options(config.defaultReqwestOpts)
        .merge({
            url:    geofenceUrl + '/' + geofenceId,
            method: 'delete'
        })
        .merge(opts);

    return reqwest(options);
}

function updateGeofence(geofence, opts) {
    var options = new Options(config.defaultReqwestOpts)
        .merge({
            url:    geofenceUrl + '/' + geofence.id,
            method: 'put',
            data:   JSON.stringify(geofenceJson(geofence))
        })
        .merge(opts);

    return reqwest(options);
}

function createOrUpdateGeofence(geofence, opts) {
    if (geofence.id) {
        return updateGeofence(geofence, opts);
    } else {
        return createGeofence(geofence, opts);
    }
}

function geoFenceJson(geofence) {
    return {
        name: geofence.name,
        description: geofence.description,
        asset_ids: ['*'],
        inclusive: geofence.inclusive,
        geometry: geofenceGeometry(geofence)
    }
}

function geofenceGeometry(geofence) {
    if (geofence.radius) {
        return {
            type: "Circle",
            coordinates: [geofence.coordinates.lat, geofence.coordinates.lng],
            radius: geofence.radius
        }
    } else {
        return {
            type: "MultiPoint",
            coordinates: geofence.coordinates.map(function(latlng) { return [latlng.lng, latlng.lat] })
        }
    }
}

function addAllGeofencesAsLayer(opts) {
    return getAllGeofencesAsGeoJSON()
    .then(function(geofences) {
      addGeofencesToMap(geofences, opts);
    })
    .fail(function(error) {
      console.log('Error retrieving geofences: ', error);
    });
}

function addGeofencesToMap(geofences) {
    var geofenceLayer,
        geofencesGroup;

    var options = new Options({
        inclusiveColor: 'blue',
        exclusiveColor: 'red',
        controlTitle: 'Geofences'
    });

    geofenceLayer = L.geoJson(geofences, {
        onEachFeature: onEachGeofence,
        style: function(feature) {
            if (feature.properties.inclusive) {
                return {color: options.inclusiveColor};
            } else {
                return {color: options.exclusiveColor};
            }
        }
    });

    trakitMap.layerControl.addOverlay(geofenceLayer, options.controlTitle);
}

function onEachGeofence(feature, layer) {
  layer.bindPopup(geofencePopupContent(feature));
}

function geofencePopupContent(feature) {
  return '<h4>' + feature.properties.name + '</h4>' +
         '<p>' + feature.properties.description + '</p>';
}


module.exports = {
    getAll: getAllGeofences,
    getAllGeoJSON: getAllGeofencesAsGeoJSON,
    create: createGeofence,
    delete: deleteGeofence,
    addAllAsLayer: addAllGeofencesAsLayer,
    update: updateGeofence,
    createOrUpdate: createOrUpdateGeofence
}