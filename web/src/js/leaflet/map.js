var L = require('leaflet');
var providers = require('./providers');

var DEFAULTS = {
  transitionDuration: 500,
  zoomLevel: 16
}

var map = {
  layerControl: null,
  map: null,
  data: {
    markers: {}
  },
  addTransitionToMarkers: function(transitionDuration) {
    if (transitionDuration === undefined) { transitionDuration = DEFAULTS.transitionDuration; }

    if (L.DomUtil.TRANSITION) {
      for (var m in this.data.markers) {
        if (this.data.markers[m]._icon) { this.data.markers[m]._icon.style[L.DomUtil.TRANSITION] = ('all ' + transitionDuration + 'ms linear'); }
        if (this.data.markers[m]._shadow) { this.data.markers[m]._shadow.style[L.DomUtil.TRANSITION] = 'all ' + transitionDuration + 'ms linear'; }
      }
    }
  },
  removeTransitionFromMarkers: function() {
    if (L.DomUtil.TRANSITION) {
      for (var m in this.data.markers) {
        if (this.data.markers[m]._icon) { this.data.markers[m]._icon.style[L.DomUtil.TRANSITION] = (''); }
        if (this.data.markers[m]._shadow) { this.data.markers[m]._shadow.style[L.DomUtil.TRANSITION] = ''; }
      }
    }
  },
  focusAndZoom: function(latlng, zoomLevel) {
    if (zoomLevel === undefined) { zoomLevel = DEFAULTS.zoomLevel; }

    this.map.setView(latlng, zoomLevel);
  },
  init: function(containerId, options) {
    var mapOptions = {
      center: [46.8772, -96.7894],
      zoom: 11,
      layers: [providers.mbStreets]
    };

    for (var attrname in options) { mapOptions[attrname] = options[attrname] }

    if (this.map) {
      console.log('Map already initialized.')
    } else {
      this.map = L.map(containerId, mapOptions);

      providers.mbStreets.addTo(this.map);

      map_layers = {
        "Street": providers.mbStreets,
        "Satellite": providers.mbSatellite,
        "Pirate": providers.mbPirate,
        "Open Street Maps": providers.osm,
        "ESRI Streets": providers.esriStreets,
        "ESRI Imagery": providers.esriImagery,
        "MapQuest Open": providers.mqOpen
      };

      // include google maps, but only if we've included the google api
      // in the global namespace -- as of now this is only possible
      // when including google via a <script> call, not require()
      if (!(typeof google === "undefined")) {
        map_layers = $.extend(map_layers, {
          "Google Roadmap": providers.googleRoads,
          "Google Roadmap (brony)": providers.googleRoads2,
          //"Google Satellite": providers.googleSatellite,
          "Google Terrain": providers.googleTerrain,
          "Google Satellite": providers.googleHybrid
        });
      }

      this.layerControl = L.control.layers(map_layers, {
        "Temperature": providers.temperature,
        "Precipitation": providers.precipitation,
        //"Heatmap": providers.heatMap
      }).addTo(this.map);
    }
    return this.map;
  }
}
module.exports = map;