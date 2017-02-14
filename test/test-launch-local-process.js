/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

// SEE https://addons.mozilla.org/en-US/developers/docs/sdk/1.1/packages/api-utils/docs/unit-test.html

const { Ci, Cc } = require( "chrome" );
const localProcess = require( "../lib/launch-local-process" );
const isWindowsOs = require('../lib/utils/os-util').isWindowsOs;

var existingFile, notExisting, folderWithSpaceExisting, folderWithSpaceQuotedExisting;

if (isWindowsOs()) {
    existingFile = "C:\\Windows\\explorer.exe";
    notExisting = "C:\\muh.exe";
    folderWithSpaceExisting = "C:\\Windows\\Downloaded Program Files";
    folderWithSpaceQuotedExisting = "\"C:\\Windows\\Downloaded Program Files\"";
}
else {
    // console.log('unix system');
    existingFile = "/etc/issue";
    notExisting = "/muh/notfound";
    // todo --> create path at /tmp/ folder
    folderWithSpaceExisting = "/tmp/path with spaces";
    folderWithSpaceQuotedExisting = "\"/tmp/path with spaces\"";

    // check if folder is existing --> create it if it's missing
    var file = Cc['@mozilla.org/file/local;1'].
                createInstance(Ci.nsILocalFile);
    file.initWithPath(folderWithSpaceExisting);
    if (file && !file.exists()) {
      file.create(1, 384); // oct 0600 --> only current user can read/write
    }
}

/*exports.test_getEnvVar = function( test ) {
  let v1 = localProcess.getEnvironmentVariable( "WINDIR" );
  test.assertEqual( v1.toUpperCase(), "C:\\WINDOWS" );

  test.assertRaises( function() {
    localProcess.getEnvironmentVariable( "__MUH__" );
    },
    "getEnvironmentVariable: variable does not exist: __MUH__" );
};*/

exports.test_pathExists = function( test ) {
    var localFile = Cc[ "@mozilla.org/file/local;1" ]
        .createInstance( Ci.nsILocalFile );

    localFile.initWithPath(existingFile);
    test.assertEqual( localProcess.pathExists( localFile ), true );

    localFile.initWithPath(notExisting);
    test.assertEqual( localProcess.pathExists( localFile ), false );
};

exports.test_getNsIFileFromPath = function( test ) {
  let nsFile = localProcess.getNsIFileFromPath( existingFile );
  test.assertEqual( nsFile.exists(), true );

  nsFile = localProcess.getNsIFileFromPath( notExisting );
  test.assertEqual( nsFile.exists(), false );

  // Folder with space
  nsFile = localProcess.getNsIFileFromPath( folderWithSpaceExisting );
  test.assertEqual( nsFile.exists(), true );

  // With ""
  nsFile = localProcess.getNsIFileFromPath( folderWithSpaceQuotedExisting );
  test.assertEqual( nsFile.exists(), true );
};