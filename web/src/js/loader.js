$ = require('jquery');

function showLoader() {
  $('.loading-modal').show();
}

function hideLoader() {
  $('.loading-modal').hide();
}

module.exports = {
  hide: hideLoader,
  show: showLoader
}