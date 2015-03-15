var reqwest = require('reqwest');
var config = require('../configuration');
var Q = require('q');
var _ = require('lodash');
var Options = require('../util/Options');

var urls = {
  base: config.survivorsUrl + '/survivors'
}

function getAllSurvivors(opts) {
  var options = new Options(config.defaultReqwestOpts)
      .merge({
        url: urls.base,
        method: 'get'
      })
      .merge(opts);

  return reqwest(options);
}

function getLeaderBoard(opts) {

  // Get list of assets from app api
  survivors = getAllSurvivors();

  // Await results, combine them when finished
  return Q.spread([survivors], function (survivors, response) {
    console.log(survivors);
    // Remove assets with no messages from return value
    return survivors;
  }, function(error) {
    console.log(error);
  });
}

module.exports = {
  getLeaderBoard: getLeaderBoard,
  getAllSurvivors: getAllSurvivors
}