/*
 * License: www.mozilla.org/MPL/
 * Created by https://github.com/feinstaub/firefox_addon_local_filesystem_links
 */
"use strict";

const osUtil = require( "./os-util" );
const stringUtil = require( "./string-util" );

//
// Used for Windows OS:
// delete file:/// and replace / with \
//
// Todo add short syntax for Windows C:\ or //network/test
// //network not working because browser does a http request
// added regex so double slash can be used instead of triple
// and 4 slashes are possible for network path

var fixFileLinkStringForWindowsOs = function( link ) {
    var regex = /file:(\/\/){2}/;

    if ( link.match( regex ) ) {

        // Four slashes ////network/test
        link = link.replace( regex, "//" );
    } else {
        // console.log( "two or three slashes", link );
        link = link.replace( /file:(\/){2,3}/, "" ); // Two or three slashes
        // console.log( "replaced", link );
    }

    // http://www.w3schools.com/jsref/jsref_replace.asp
    link = link.replace( /\//g, "\\" ); // Globally find / and replace with \
    // console.log( "fixed win", link );
    return link;
};
exports.fixFileLinkStringForWindowsOs = fixFileLinkStringForWindowsOs;

// TODO: write unit test
var fixFileLinkStringForLinuxOs = function( link ) {
    //console.log('fix linux file link (input)', link);
    /* feinstaub's code
    link = link.replace( "file://", "" ); // file:///home/user --> /home/user
                                          // or file:////home/user --> //home/user
                                          // or file:///~/dev --> /~/dev

    link = link.replace( "//", "/" );     // /home/user        --> /home/user
                                          // or //home/user        --> /home/user
                                          // or /~/dev        --> /~/dev

    // Hack because we assume that ~ has the 'home' meaning:
    link = link.replace( "/~", "~" );     // /home/user        --> /home/user
                                          // or //home/user        --> /home/user
                                          // or /~/dev        --> ~/dev
    */

    var regex = /file:(\/\/){2}/;

    if ( link.match( regex ) ) {

        // Four slashes ////network/test
        link = link.replace( regex, "//" );
    } else {
        // console.log( "two or three slashes", link ); // e.g. file:///path or file://path
        link = link.replace( /file:\//, "" );        // Two or three slashes --> keep one or two slashes
        // console.log( "replaced", link ); // --> /path or //path
    }

    // same hack to remove / before ~

    link = link.replace(/(\/){1,2}~/, "~"); // one or two slashes before ~

    // http://www.w3schools.com/jsref/jsref_replace.asp
    //link = link.replace( /\//g, "/" ); // Globally find / and replace with \ --> not needed in linux forward slashes are OK
    // console.log( "fixed linux", link );
    return link;
};

exports.osSpecificLinkStringFix = function( link ) {
    if ( osUtil.isWindowsOs() ) {
        return fixFileLinkStringForWindowsOs( link );
    } else {
        return fixFileLinkStringForLinuxOs( link );
    }
};

//
// "aaa" --> "aaa"
// "\"bbb\"" --> "bbb"
//
var stripQuotes = function( localPathWithOrWithoutQuotes ) {
    let trimmed = stringUtil.strTrim( localPathWithOrWithoutQuotes );
    if ( stringUtil.strStartsWith( trimmed, "\"" ) ) {
        return trimmed.replace( /^\"(.*)\"$/, "$1" );
    } else {
        return trimmed;
    }
};
exports.stripQuotes = stripQuotes;

exports.looksLikeLocalFileLink = function( text ) {
    if ( text !== undefined && stringUtil.strStartsWith( text, "file:///" ) ) {

        // TODO: e. g. the first part must only be one letter (the drive letter and a colon)

        return true;
    }

    // Return text.length < 30;

    return false;
};
