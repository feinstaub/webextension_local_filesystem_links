/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

var {Cc, Ci} = require("chrome");
const linkUtil = require("link-util");
const stringUtil = require("string-util");

//
// returns the value of the given environment variable
// throws if variable does not exist
// SEE https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIEnvironment
//
function getEnvironmentVariable(variableName) {
  var env = Cc["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment);
  if (!env.exists(variableName)) {
    throw "getEnvironmentVariable: variable does not exist: " + variableName;
  }
  else {
    return env.get(variableName);
  }
}
exports.getEnvironmentVariable = getEnvironmentVariable;

//
// returns an instance of nsILocalFile
// localPath: e. g. "C:\\Windows\\explorer.exe"
//
function getNsIFileFromPath(localPath) {
  
  localPath = linkUtil.stripQuotes(localPath);
  
  // we need this because the nsILocalFile seems not happy with file:/// on Windows (but Windows explorer would be)
  localPath = linkUtil.osSpecificLinkStringFix(localPath);
   
  // create an nsILocalFile for the executable
  // "An nsIFile can be retrieved by either instantiating an nsILocalFile using a platform specific
  //  path string or by using cross-platform locations retrieved from the directory service."
  // https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIFile
  var nsLocalFile = Cc["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
  // file.initWithPath("C:\\Windows\\system32\\calc.exe"); // works
  // file.initWithPath("C:\\Windows\\explorer.exe"); // works
  //// console.debug(localPath);
  nsLocalFile.initWithPath(localPath);

  nsLocalFile.QueryInterface(Components.interfaces.nsIFile);

  return nsLocalFile; // which is now nsIFile
}
exports.getNsIFileFromPath = getNsIFileFromPath;

//
// nsFile: e. g. getNsIFileFromPath("C:\\Windows\\explorer.exe")
// argumentArray: e. g. [ "/select,C:\\tmp" ]
// blocking: e. g. false
//
// TODO: remove if not needed anymore
//
function runProcess(nsFile, argumentArray, blocking) {

  // https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIProcess
  // create an nsILocalFile for the executable  
  var process = Cc["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
  process.init(nsFile);
  // Run the process.  
  // If first param is true, calling thread will be blocked until  
  // called process terminates.  
  // Second and third params are used to pass command-line arguments  
  // to the process.
  
  // var args = ["argument1", "argument2"];
  //// console.debug("argumentArray: " + argumentArray);
  process.run(blocking, argumentArray, argumentArray.length); 
  
  // console.log(getAllProperties(process));
}
exports.runProcess = runProcess;

function pathExists(localPath) {
  let localFile = getNsIFileFromPath(localPath);
  return localFile.exists();
}
exports.pathExists = pathExists;

//
// opens the Windows Explorer (or other file manager)
// with the given localPath selected (if it is a file)
// or set as root (if it is a directory)
//
// might throw if localPath does not exist
//
// "Ask the operating system to open the folder which contains this file or folder."
//
exports.revealPathInFileManager = function(localPath) {
  
  localPath = linkUtil.stripQuotes(localPath);
  localPath = linkUtil.osSpecificLinkStringFix(localPath); // why (see above)
  
  //// console.debug("showPathInWindowsExplorer: " + localPath);
  
  ////let windir = getEnvironmentVariable("WINDIR");
  //let cmdPath = windir + "\\System32\\cmd.exe";
  ////let explorerExePath = windir + "\\explorer.exe";
  ////let explorerExeFile = getILocalFileFromPath(explorerExePath);

  ////let explorerArgs = "";
  
  let localFile = getNsIFileFromPath(localPath);

  if (localFile.isFile()) {
    ////explorerArgs = "/select";
    // ok
  } else if (localFile.isDirectory()) {
    ////if (stringUtil.strEndsWith(localPath, "\\")) { // remove trailing bachslash if it is a directory, otherwise Windows Explorer will open in "Documents"
    ////  localPath = localPath.substr(0, localPath.length - 1);
    ////}
    // /root,... make the given path the root of the explorer window
    // /e,... opens the folder
    //
    //// explorerArgs = "/e";
    // ok
  } else {
    throw "revealPathInFileManager: Path does not exist: " + localPath;
  }

  // Kris Maglione gave the exquisite hint to use this method instead of the code below
  // see also: https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsILocalFile#reveal%28%29
  // fixes the "comma in path is not working" bug
  localFile.reveal();
}
