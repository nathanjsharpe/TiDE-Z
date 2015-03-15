var notify = require('../../vendor/bootstrap-notify');
var $ = require('jquery');
var moment = require('moment');
var _ = require('lodash');
var Options = require('../util/Options');

var defaultSettings = {
    element: 'body',
    position: null,
    type: "danger",
    allow_dismiss: true,
    newest_on_top: false,
    placement: {
      from: "top",
      align: "right"
    },
    offset: 20,
    spacing: 10,
    z_index: 1031,
    delay: 5000,
    timer: 1000,
    url_target: '_blank',
    mouse_over: "pause",
    animate: {
      enter: 'animated fadeInDown',
      exit: 'animated fadeOutUp'
    },
    onShow: null,
    onShown: null,
    onClose: null,
    onClosed: null,
    icon_type: 'class'
}

var Notifier = {

    arrayOfActiveNotifications: [],

    addNotificationToActiveList: function (opts) {
        if (_.indexOf(this.arrayOfActiveNotifications, opts.assetMessage.asset_id)){
            var id = opts.assetMessage.asset_id
            var newObj = {id: opts.assetMessage.asset_id,
                note: this.emergency(opts)
            }
            this.arrayOfActiveNotifications.push(newObj);
        }
    },

    checkForActiveNotifications: function (opts) {
        if (_.some(this.arrayOfActiveNotifications, 'id', opts.assetMessage.asset_id)){
            return
        } else {
            this.addNotificationToActiveList(opts)
        }
    },

    removeNotificationFromActiveList: function (opts) {
        var self = this;
        var index = _.indexOf(self.arrayOfActiveNotifications, opts.assetMessage.asset_id)
        this.arrayOfActiveNotifications.splice(index, 1);
        return function(opts){ 
            console.log('removed', self.arrayOfActiveNotifications)
            self.arrayOfActiveNotifications.splice(index, 1);
        }
    },

    setNotifier: function (opts) {
       this.checkForActiveNotifications(opts);
    },

    emergency: function (opts) {
        var settings = defaultSettings,
            options = new Options({
                title: 'Emergency mode activated.',
                message: '<strong>' + opts.assetMessage.asset_id + '</strong> has indicated emergency mode.'
            })
            .merge(opts)
        settings.onClosed = this.removeNotificationFromActiveList(opts);
        settings.delay = 8000;
        settings.template = '<div data-notify="click" data-notify="container" class="alert-container col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
            '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
            '<img data-notify="icon" class="img-circle pull-left">' +
            '<span data-notify="title">{1}</span>' +
            '<span data-notify="message">{2}</span></br>' +
            '<span data-notify="link">Click to View</span>' +
            '<div class="progress" data-notify="progressbar">' +
                '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
            '</div>' +
            '</div>'

        return $.notify({
            icon: 'glyphicon glyphicon-warning-sign',
            title: options.title,
            message: options.message,
            target: '_self'
        }, settings);
    },

    failure: function(opts) {
        var settings = defaultSettings,
            options = new Options(opts);

        $.notify({
            icon: 'fa fa-exclamation-triangle',
            title: options.title,
            message: options.message,
            target: '_blank'
        }, settings);
    },

    success: function(opts) {
        var settings = defaultSettings,
            options = new Options(opts);

        settings.type = 'success';

        $.notify({
            icon: 'fa fa-check',
            title: options.title,
            message: options.message,
            target: '_blank'
        }, settings);
    }
}

module.exports = Notifier;