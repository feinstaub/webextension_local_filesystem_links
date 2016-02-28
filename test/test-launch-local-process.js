/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

// SEE https://addons.mozilla.org/en-US/developers/docs/sdk/1.1/packages/api-utils/docs/unit-test.html

const { Ci, Cc } = require( "chrome" );
const localProcess = require( "../lib/launch-local-process" );

exports.test_getEnvVar = function( test ) {
  let v1 = localProcess.getEnvironmentVariable( "WINDIR" );
  test.assertEqual( v1.toUpperCase(), "C:\\WINDOWS" );

  test.assertRaises( function() {
    localProcess.getEnvironmentVariable( "__MUH__" );
    },
    "getEnvironmentVariable: variable does not exist: __MUH__" );
};

exports.test_pathExists = function( test ) {
    var localFile = Cc[ "@mozilla.org/file/local;1" ]
        .createInstance( Ci.nsILocalFile );

    localFile.initWithPath("C:\\Windows\\explorer.exe");
    test.assertEqual( localProcess.pathExists( localFile ), true );

    localFile.initWithPath("C:\\muh.exe");
    test.assertEqual( localProcess.pathExists( localFile ), false );
};

exports.test_getNsIFileFromPath = function( test ) {
  let nsFile = localProcess.getNsIFileFromPath( "C:\\Windows\\explorer.exe" );
  test.assertEqual( nsFile.exists(), true );

  nsFile = localProcess.getNsIFileFromPath( "C:\\muh" );
  test.assertEqual( nsFile.exists(), false );

  // Folder with space
  nsFile = localProcess.getNsIFileFromPath( "C:\\Windows\\Downloaded Program Files" );
  test.assertEqual( nsFile.exists(), true );

  // With ""
  nsFile = localProcess.getNsIFileFromPath( "\"C:\\Windows\\Downloaded Program Files\"" );
  test.assertEqual( nsFile.exists(), true );
};
