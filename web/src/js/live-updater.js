// EXAMPLE USAGE
//
// var liveUpdater = require('./live-updater');

// liveUpdater.registerSuccessCallback(function);

// liveUpdater.start({
//   immediately: true,
//   tiid: 1234
// });
//
// CHECK LAST RESULT FOR SUCCESS
//
// if (!liveUpdater.lastResponse) {
//   console.log('PORK CHOP SANDWICHES');
// }

var _ = require('lodash');
var reqwest = require('reqwest');
var Assets = require('./resources/assets');
var progress = require('./util/progress-indicator');

function geoJsonify(messages) {
  return messages.map(function(message) {
    return {
      type: "Feature",
      id: message.tiid,
      geometry: {
        type: "Point",
        coordinates: [message.longitude, message.latitude]
      },
      properties: {
        assetId: message.asset_id,
        tiid: message.tiid,
        altitude: message.altitude,
        speed: message.speed,
        timestamp: message.timestamp,
        data: message.data,
        latitude: message.latitude,
        longitude: message.longitude,
        location: message.longitude + ", " + message.latitude,
      }
    }
  });
}

var liveUpdater = {
  successCallbacks: [],
  failureCallbacks: [],
  lastTiid: null,
  interval: 3000,
  timeoutId: null,
  lastResponse: {
    original: null,
    geoJson: null
  },
  results: {
    success: 0,
    failure: 0
  },
  registerSuccessCallback: function(callback) {
    this.successCallbacks.push(callback)
  },
  registerFailureCallback: function(callback) {
    this.failureCallbacks.push(callback)
  },
  update: function() {
    var self = this;
    Assets.getUpdates({tiid: this.lastTiid})
    .then(function(response) {
      self.results.success++;

      var messages = response;

      progress.setColor('green').setText(messages.length);

      // Set last tiid to tiid of last message
      if (messages.length > 0) {
        self.lastTiid = _.last(messages).tiid;
      }
      self.lastResponse = {
        original: messages,
        geoJson: geoJsonify(messages)
      };

      self.successCallbacks.forEach(function(callback) {
        callback(self.lastResponse);
      });

      self.setupNext();
      progress.start();
    }, function (error) {
      self.results.failure++;
      progress.setColor('red').setText('!');
      self.failureCallbacks.forEach(function(callback) {
        callback(error);
      });
      console.log('Live update error: ', error);
      self.lastResponse = error;
      self.setupNext();
      progress.start();
    });
  },
  setLastTiid: function(tiid) {
    this.lastTiid = tiid;
  },
  setInterval: function(interval) {
    this.interval = interval;
  },
  start: function(opts) {
    progress.init().start();
    if (!this.timeoutId) {
      var firstInterval = this.interval;

      this.lastTiid = opts.tiid;

      if (opts.immediately) {
        firstInterval = 100;
      }

      this.setupNext(firstInterval);
    } else {
      console.log('Attempted to start live updater, but it is already started with timeoutId: ', this.timeoutId);
    }
  },
  setupNext: function(interval) {
    if (interval === undefined) {
      interval = this.interval;
    }
    window.setTimeout(this.update.bind(this), interval)
  },
  stop: function() {
    window.clearTimeout(this.timeoutId);
    this.timeoutId = null;
  }
};

module.exports = liveUpdater;
