// Preferences.js
var simplePrefs = require( "sdk/simple-prefs" );//,
//handlers = []; //>>>>>>>later check if we have to detach handlers

exports.addPrefChangeHandler = function( prefName, callback ) {
    simplePrefs.on( prefName, callback );
};

exports.options = simplePrefs.prefs;
