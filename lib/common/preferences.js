// Preferences.js
var simplePrefs = require( "sdk/simple-prefs" ),
    handlers = []; //>>>>>>>later check if we have to detach handlers

function addPrefChangeHandler( prefName, callback ) {
    var handler = simplePrefs.on( prefName, callback ),
        index = handlers.indexOf( handler );

    if ( index === -1 ) {
        handlers.push( handler );
    } else {
        handlers[ index ] = handler;
    }
}

exports.addPrefChangeHandler = addPrefChangeHandler;

exports.options = simplePrefs.prefs;
