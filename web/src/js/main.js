var mapLive = require('./map-live');
var $ = require('jquery');
var loader = require('./loader');
var Leaderboard = require('./leaderboard');

window._ = require('lodash');

$(document).ready(function() {
	var menuToggle = $('#js-mobile-menu').unbind();
	$('#js-navigation-menu').removeClass("show");

	menuToggle.on('click', function(e) {
		e.preventDefault();
		$('#js-navigation-menu').slideToggle(function(){
		  if($('#js-navigation-menu').is(':hidden')) {
		    $('#js-navigation-menu').removeAttr('style');
		  }
		});
	});

	var userToggle = $('#tab-select').unbind();
	var toggleIcon = $('.fa-caret-up').unbind();
	$('#user-panel').removeClass("show");
	var panelHeight = $('#user-panel').outerHeight();
	userToggle.on('click', function (e) {
		e.preventDefault();
		userToggle.animate({
		    bottom: panelHeight
		  });
		toggleIcon.addClass('fa-rotate-180');
		$('#user-panel').slideToggle(function(){
	  		if($('#user-panel').is(':hidden')) {
	    		$('#user-panel').removeAttr('style');
				toggleIcon.removeClass('fa-rotate-180');
	  		}
		});
		panelHeight = $('#user-panel').outerHeight();
	});

});


if ($('#map-live').length > 0) {
  mapLive.init();
}

if ($('#leaderboard').length > 0) {
   Leaderboard.init();
}