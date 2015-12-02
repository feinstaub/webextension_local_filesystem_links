/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

// Var main = require("../"); // later for jpm

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

////exports.test_runProcess = function(test) {
////  let windir = localProcess.getEnvironmentVariable("WINDIR");
////  let explorerPath = windir + "\\explorer.exe";
////  ////let explorerFile = localProcess.getNsIFileFromPath(explorerPath);
////
////  // start explorer and select itself
////  let args = [ "/select," + explorerPath ]; // OK, works
////  ////let args = [ "/e,/root,C:\\Windows" ]; // NOTE: /e,/root makes no sense
////
////  console.log(args);
////  ////localProcess.runProcess(explorerFile, args, false);
////  console.info("please comment in the line above for interactive test");
////
////  //// localProcess.runProcess(explorerFile, [ "/e,", "C:\\Windows\\Downloaded Program Files" ]); // OK, works
////  //// localProcess.runProcess(explorerFile, [ "/e,", "C:\\tmp\\path with blanks" ]); // OK, works
////  //// localProcess.runProcess(explorerFile, [ "/e,", "\"C:\\tmp\\path,with,comma\"" ]); // does NOT work
////  //// localProcess.runProcess(explorerFile, [ "/e",  "\"C:\\tmp\\path,with,comma\"" ]); // does NOT work
////  //// localProcess.runProcess(explorerFile, [ "/e,", "C:\\tmp\\path,with,comma" ]); // does NOT work
////  //// localProcess.runProcess(explorerFile, [ "/e,", "C:\\tmp\\path\",\"with\",\"comma" ]); // does NOT work
////  console.info("please comment in the line above for interactive test");
////
////  console.info("You should see the Windows Explorer.");
////  test.pass("Check if you see the Windows Explorer window with correct item selected.");
////}
