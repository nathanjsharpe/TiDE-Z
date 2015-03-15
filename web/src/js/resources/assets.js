var reqwest = require('reqwest');
var config = require('../configuration');
var Q = require('q');
var _ = require('lodash');
var Options = require('../util/Options');

var urls = {
  base: config.appApiUrl + '/asset',
  live: config.appApiUrl + '/live',
  updates: config.appApiUrl + '/updates'
}

function getAllAssets(opts) {
  var options = new Options(config.defaultReqwestOpts)
      .merge({
        url: urls.base,
        method: 'get'
      })
      .merge(opts);

  return reqwest(options);
}

function getRecentMessages(opts) {
    var options = new Options(config.defaultReqwestOpts)
        .merge({
            url:    urls.live + '?trail=' + opts.trail,
            method: 'get'
        })
        .merge(opts);

  return reqwest(options);
}

function getAllWithTrails(opts) {
    var options = new Options({
            trail: 20
        })
        .merge(opts);

  // Get list of assets from app api
  assets = getAllAssets();

  // Get most recent raw messages from data api
  messages = getRecentMessages({trail: options.trail});

  // Await results, combine them when finished
  return Q.spread([assets, messages], function (assets, response) {
    var messages = response.asset_datas,
        groupedMessages = _.groupBy(messages, 'asset_id'),
        filteredAssets = _.filter(assets, function(asset) { return groupedMessages[asset.deviceAddress]}),
        compiledAssetsWithTrails = matchAssetsWithMessages(filteredAssets, groupedMessages);

    // Get max tiid for polling purposes
    var maxTiid = _.max(messages, function(msg) {
      return msg.tiid;
    }).tiid;

    // Remove assets with no messages from return value
    return {
      assets: compiledAssetsWithTrails.recent,
      trails: compiledAssetsWithTrails.trails,
      maxTiid: maxTiid
    };
  }, function(error) {
    console.log(error);
  });
}

function matchAssetsWithMessages(assets, messages) {
  var compiledAssets = {
    recent: null,
    trails: []
  };

  compiledAssets.recent = assets.map(function(asset) {
    if (messages[asset.deviceAddress]) {
      return assetWithMessage(asset, messages[asset.deviceAddress].splice(0, 1)[0]);
    }
  });

  assets.forEach(function(asset) {
    if (messages[asset.deviceAddress] && messages[asset.deviceAddress].length > 0) {
      messages[asset.deviceAddress].forEach(function(message) {
        compiledAssets.trails.push(assetWithMessage(asset, message));
      });
    }
  });

  return compiledAssets;
}

function assetWithMessage(asset, message) {
  return  {
    type: "Feature",
    id: asset.id,
    geometry: {
      type: "Point",
      coordinates: [message.longitude, message.latitude]
    },
    properties: {
      tiid: message.tiid,
      altitude: message.altitude,
      speed: message.speed,
      timestamp: message.timestamp,
      data: message.data,
      latitude: message.latitude,
      longitude: message.longitude,
      location: message.longitude + ", " + message.latitude,
      asset: asset,
      name: asset.name
    }
  }
}

function getUpdates(opts) {
    var options = new Options(config.defaultReqwestOpts)
        .merge({
            url:    urls.updates + '?tiid=' + opts.tiid,
            method: 'get'
        })
        .merge(opts);

    return reqwest(options);
}

module.exports = {
  getAllWithTrails: getAllWithTrails,
  getAll: getAllAssets,
  getUpdates: getUpdates
}