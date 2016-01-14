/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

// SEE https://addons.mozilla.org/en-US/developers/docs/sdk/1.1/packages/api-utils/docs/unit-test.html

const { Ci } = require( "chrome" );
const localProcess = require( "../lib/launchExplorer" );

exports.test_getEnvVar = function( test ) {
  let v1 = localProcess.getEnvironmentVariable( "WINDIR" );
  test.assertEqual( v1.toUpperCase(), "C:\\WINDOWS" );

  test.assertRaises( function() {
    localProcess.getEnvironmentVariable( "__MUH__" );
    },
    "getEnvironmentVariable: variable does not exist: __MUH__" );
};

exports.test_pathExists = function( test ) {
  test.assertEqual( localProcess.pathExists( "C:\\Windows\\explorer.exe" ), true );
  test.assertEqual( localProcess.pathExists( "C:\\muh.exe" ), false );
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
