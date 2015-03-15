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
      layers: [providers.hereNight]
    };

    for (var attrname in options) { mapOptions[attrname] = options[attrname] }

    if (this.map) {
      console.log('Map already initialized.')
    } else {
      this.map = L.map(containerId, mapOptions);

      providers.hereNight.addTo(this.map);

      map_layers = {
        "HERE Night": providers.hereNight,
        "HERE Night Gray": providers.hereNightGray,
        "Open Street Maps": providers.osm,
        "ESRI Streets": providers.esriStreets,
        "ESRI Imagery": providers.esriImagery,
        "MapQuest Open": providers.mqOpen
      };

      this.layerControl = L.control.layers(map_layers, {
      }).addTo(this.map);
    }
    return this.map;
  }
}
module.exports = map;