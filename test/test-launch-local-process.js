/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

// SEE https://addons.mozilla.org/en-US/developers/docs/sdk/1.1/packages/api-utils/docs/unit-test.html

const {Ci} = require("chrome");
const localProcess = require("launch-local-process");

exports.test_getEnvVar = function(test) {
  let v1 = localProcess.getEnvironmentVariable("WINDIR");
  test.assertEqual(v1.toUpperCase(), "C:\\WINDOWS");
  
  test.assertRaises(function() {
    localProcess.getEnvironmentVariable("__MUH__");
    },
    "getEnvironmentVariable: variable does not exist: __MUH__");
}

exports.test_pathExists = function(test) {
  test.assertEqual(localProcess.pathExists("C:\\Windows\\explorer.exe"), true);
  test.assertEqual(localProcess.pathExists("C:\\muh.exe"), false);
}

exports.test_getILocalFileFromPath = function(test) {
  let localFile = localProcess.getILocalFileFromPath("C:\\Windows\\explorer.exe");
  localFile.QueryInterface(Components.interfaces.nsIFile);
  test.assertEqual(localFile.exists(), true);
  
  localFile = localProcess.getILocalFileFromPath("C:\\muh");
  localFile.QueryInterface(Components.interfaces.nsIFile);
  test.assertEqual(localFile.exists(), false);
  
  // folder with space
  localFile = localProcess.getILocalFileFromPath("C:\\Windows\\Downloaded Program Files");
  localFile.QueryInterface(Components.interfaces.nsIFile);
  test.assertEqual(localFile.exists(), true);
  
  // with ""
  localFile = localProcess.getILocalFileFromPath("\"C:\\Windows\\Downloaded Program Files\"");
  localFile.QueryInterface(Components.interfaces.nsIFile);
  test.assertEqual(localFile.exists(), true);  
}

exports.test_runProcess = function(test) {
  let windir = localProcess.getEnvironmentVariable("WINDIR");
  let explorerPath = windir + "\\explorer.exe";
  let explorerFile = localProcess.getILocalFileFromPath(explorerPath);
  // let explorerFile = localProcess.getILocalFileFromPath("C:\\Users\\alien\\Documents\\test.cmd");
  
  // start explorer and select itself
  // let args = [ "/select," + explorerPath ]; // ok
  // let args = [ "/e,/root,C:\\Windows\\Downloaded Program Files" ]; // TODO: does not work because of space
  let args = [ "/e,/root,C:\\Windows" ];
  // TODO: a test case with \\uncpath\hallo\test
  
  console.debug(args);
  localProcess.runProcess(explorerFile, args, false);
  //localProcess.runProcess(explorerFile, args, false);
  //console.info("plese comment in the line above");
  
  // localProcess.runProcess(explorerFile, [ "/root", "C:\\Windows\\Downloaded Program Files" ]);
  
  console.info("You should see the Windows Explorer.");
  test.pass("You should see the Windows Explorer.");
}
