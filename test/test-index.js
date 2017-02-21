var main = require( "../index" ),
    tabs = require( "sdk/tabs" );

let { before, after } = require('sdk/test/utils');

// todo add pagemod whitelist testing

// exports.testWhitelist = function( assert, done ) {
//     // var options = require( "../lib/common/preferences" ).options;
//     // console.log('simplePrefs', options);
//     tabs.open( {
//       url: 'http://www.google.de', //'http://localhost:3000',
//     }, function(tab) {
//         tab.on('ready', function() {
//           assert.ok( main.isAttached(), "Attached whitelisted" );
//           done();
//         });
//     });
// };

// before(exports, function (name, assert, done) {
//   tabs.open( {
//       url: 'http://localhost:3000',
//       onActivate: function() {
//           done();
//       }

//   });
// });


require( "sdk/test" ).run( exports );
