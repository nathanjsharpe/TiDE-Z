var _ = require('lodash');

var Options = function(options) {
    for (var attr in options) {
        this[attr] = options[attr];
    }
}

Options.prototype.merge = function(options) {
    for (var attr in options) {
        this[attr] = options[attr];
    }
    return this;
}

Options.prototype.require = function(requiredAttrs) {
    var required = _.flatten([requiredAttrs]);

    for (var attr in required) {
        if (this[attr] === undefined) {
            var exceptionMessage = attr + ' is required but was undefined';
            throw exceptionMessage;
        }
    }
}

module.exports = Options;