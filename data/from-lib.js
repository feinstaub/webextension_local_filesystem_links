/*
 * License: www.mozilla.org/MPL/
 */

/* 
 * this is code copied from lib
 */

function looksLikeLocalFileLink(text) {  
  if (strStartsWith(text, "file:///")) {
    return true;
  }
  
  // TODO
  // 
  // return text.length < 30;
  
  return false;
}

function strStartsWith(str, prefix) {
  return str.substring(0, prefix.length) === prefix;
}
