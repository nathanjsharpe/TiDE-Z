var L = require('leaflet');

// require the heatmap plugin, which we can set up later
require('leaflet.heat');

var mapbox_token = "pk.eyJ1IjoibmF0aGFuanNoYXJwZSIsImEiOiJXV1oxSlBjIn0.kEeFz6UxT0xJSMTJUXJPXg";

var mbStreetsLayer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/nathanjsharpe.lce3p9fe/{z}/{x}/{y}.png?access_token=' + mapbox_token, {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
});

var mbSatelliteLayer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/nathanjsharpe.lcmnall7/{z}/{x}/{y}.png?access_token=' + mapbox_token, {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
});

var mbpirateLayer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/nathanjsharpe.lcmnjbji/{z}/{x}/{y}.png?access_token=' + mapbox_token, {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
});

var osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18
});

var esriStreets = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var Esri_WorldPhysical = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
  maxZoom: 8
});

var MapQuestOpen_OSM = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
  attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: '1234'
});

var noaaTemperature = L.tileLayer.wms('http://gis.srh.noaa.gov/arcgis/services/NDFDTemps/MapServer/WMSServer', {
    format: 'img/png',
    transparent: true,
    layers: 16,
    opacity: 0.5
});

var noaaPrecipitation = L.tileLayer.wms('http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/obs', {
    format: 'image/png',
    transparent: true,
    layers: 'RAS_RIDGE_NEXRAD',
    opacity: 0.5
});

var noaaClouds = L.tileLayer.wms('http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/obs', {
    format: 'image/png',
    transparent: true,
    layers: 'RAS_GOES_I4',
    opacity: 0.5
});

// heatmap -- add the points later
var heat = L.heatLayer([]);

if (!(typeof google === "undefined")) {
  require('leaflet-plugins/layer/tile/Google');
  // SATELLITE, ROADMAP, HYBRID, TERRAIN
  var gglRoad1 = new L.Google('ROADMAP');
  var gglRoad2 = new L.Google('ROADMAP', {mapOptions: {styles: [ {
        featureType: 'all',
        stylers: [{hue: '#ff00ff'}]
  }]}});
  var gglSatellite = new L.Google('SATELLITE');
  var gglHybrid = new L.Google('HYBRID');
  var gglTerrain = new L.Google('TERRAIN');
}

module.exports = {
  mbStreets: mbStreetsLayer,
  mbSatellite: mbSatelliteLayer,
  mbPirate: mbpirateLayer,
  osm: osmLayer,
  googleRoads: gglRoad1,
  googleRoads2: gglRoad2,
  googleSatellite: gglSatellite,
  googleHybrid: gglHybrid,
  googleTerrain: gglTerrain,
  esriStreets: esriStreets,
  esriImagery: Esri_WorldImagery,
  mqOpen: MapQuestOpen_OSM,
  temperature: noaaTemperature,
  precipitation: noaaPrecipitation,
  clouds: noaaClouds,
  heatMap: heat
}