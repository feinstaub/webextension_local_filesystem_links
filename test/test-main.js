var main = require( "../lib/main" ),
    tabs = require( "sdk/tabs" );

let { before, after } = require('sdk/test/utils');
// exports[ "test start main"] = funcion( assert, done ) {
//
// }

exports[ "test in whitelist" ] = function( assert, done ) {
    var options = require( "../lib/common/preferences" ).options;
    console.log('simplePrefs', options);
    // assert.pass("whitelist done");
    assert.ok( main.isAttached(), "Attached whitelisted" );
    // done();
    // done();
    // tabs.open('http://localhost:3000', {
    //     onClose: function(tab) {
    //         assert.pass("done test");
    //         console.log('closing');
    //         //tab.close();
    //         done();
    //     }
    // });
    //options.whitelist = "http://localhost:3000/*";
    // main();
    // tabs.open( {
    //     url: "http://localhost:3000",
    //     // onActivate: function(tab) {
    //     //     // main();
    //     //     tab.on('ready', function(tab){
    //     //         // console.log(tab.url);
    //     //         // assert.ok( main.isAttached() === 1, "Attached whitelisted" );
    //     //         tab.close();
    //     //     });
    //     // },
    //     onClose: function () {
    //         assert.pass("done testing");
    //         // tab.close();
    //         done();
    //     }
    // });
    // tabs.on( "ready", function( tab ) {
    //     assert.ok( main.isAttached() === 1, "Attached whitelisted" );
    //     tab.close();
    //
    //     done();
    // } );

};

before(exports, function (name, assert, done) {
  tabs.open( {
      url: 'http://localhost:3000',
      onActivate: funcion() {
          done();
      }

  });
});

require( "sdk/test" ).run( exports );
