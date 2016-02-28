var main = require( "../lib/main" ),
    tabs = require( "sdk/tabs" );

let { before, after } = require('sdk/test/utils');
/*
// todo add pagemod whitelist testing
exports[ "test in whitelist" ] = function( assert, done ) {
    var options = require( "../lib/common/preferences" ).options;
    console.log('simplePrefs', options);
    // assert.pass("whitelist done");
    assert.ok( main.isAttached(), "Attached whitelisted" );
};

before(exports, function (name, assert, done) {
  tabs.open( {
      url: 'http://localhost:3000',
      onActivate: funcion() {
          done();
      }

  });
});
*/
require( "sdk/test" ).run( exports );
