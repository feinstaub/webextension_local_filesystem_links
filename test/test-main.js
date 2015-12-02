var main = require( "../lib/main" ),
    tabs = require( "sdk/tabs" ),
    whitelist = require( "sdk/simple-prefs" ).prefs.whitelist;

exports[ "test in whitelist" ] = function( assert, done ) {
    whitelist = "*.jsfiddle.net";
    tabs.open( "http://www.jsfiddle.net" );

    tabs.on( "ready", function( tab ) {
        assert.ok( main.isAttached() === 1, "Attached whitelisted" );
        tab.close();

        done();
    } );

};

require( "sdk/test" ).run( exports );
