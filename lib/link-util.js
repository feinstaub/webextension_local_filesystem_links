/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

const stringUtil = require("string-util");

//
// strip file:/// and replace / with \
//
function fileLinkToWindowsPath(link) {
  link = link.replace("file:///", "");
  // http://www.w3schools.com/jsref/jsref_replace.asp
  link = link.replace(/\//g, "\\"); // globally find / and replace with \
  return link;
}
exports.fileLinkToWindowsPath = fileLinkToWindowsPath;

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

function looksLikeLocalFileLink(text) {
  if (stringUtil.strStartsWith(text, "file:///")) {
    
    // TODO: e. g. the first part must only be one letter (the drive letter and a colon)
    
    return true;
  }
  
  // return text.length < 30;
  
  return false;
}
exports.looksLikeLocalFileLink = looksLikeLocalFileLink;
