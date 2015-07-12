/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

const stringUtil = require("sdk/string-util");
const osUtil = require("sdk/os-util");

//
// used for Windows OS:
// delete file:/// and replace / with \
//
function fixFileLinkStringForWindowsOs(link) {
  link = link.replace("file:///", "");
  // http://www.w3schools.com/jsref/jsref_replace.asp
  link = link.replace(/\//g, "\\"); // globally find / and replace with \
  return link;
}
exports.fixFileLinkStringForWindowsOs = fixFileLinkStringForWindowsOs;

// TODO: write test
function fixFileLinkStringForLinuxOs(link) {
  link = link.replace("file:///", "");
  return link;
}

exports.osSpecificLinkStringFix = function(link) {
    if (osUtil.isWindowsOs()) {
        return fixFileLinkStringForWindowsOs(link);
    }
    else {
        return fixFileLinkStringForLinuxOs(link);
    }
}

//
// "aaa" --> "aaa"
// "\"bbb\"" --> "bbb"
//
function stripQuotes(localPathWithOrWithoutQuotes) {
  let trimmed = stringUtil.strTrim(localPathWithOrWithoutQuotes);
  if (stringUtil.strStartsWith(trimmed, "\"")) {
    return trimmed.replace(/^\"(.*)\"$/, "$1");
  } else {
    return trimmed;
  }
}
exports.stripQuotes = stripQuotes;

exports.looksLikeLocalFileLink = function(text) {
  if (text !== undefined && stringUtil.strStartsWith(text, "file:///")) {
    
    // TODO: e. g. the first part must only be one letter (the drive letter and a colon)
    
    return true;
  }
  
  // return text.length < 30;
  
  return false;
}
