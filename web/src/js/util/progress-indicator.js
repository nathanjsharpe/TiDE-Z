var $ = require('jquery');
var ProgressBar = require('progressbar.js');
var Options = require('./Options');

var defaultOptions = {
    duration: 3000,
    color: 'green',
    strokeWidth: 20
}

var progress = {
    circle: null,
    options: {},
    init: function(opts) {
        this.options = new Options(defaultOptions)
            .merge(opts);

        this.circle = new ProgressBar.Circle('#poll-indicator', {
            color: this.options.color,
            strokeWidth: this.options.strokeWidth
        });

        return this;
    },
    start: function(opts) {
        var options = new Options(this.options)
            .merge(opts);

        if (!this.circle) {
            this.init(opts);
        }

        this.circle.set(0);
        this.circle.animate(1, {
            duration: this.options.duration
        });
        return this;
    },
    setText: function(text) {
        this.circle.setText(text);
        return this;
    },
    setColor: function(color) {
        this.options.color = color;
        this.circle.path.setAttribute('stroke', color);
        return this;
    }
}

module.exports = progress;
