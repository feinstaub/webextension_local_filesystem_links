/*
 * License: www.mozilla.org/MPL/
 */
"use strict"

// maps an integer id (loop counter) to the found href
var hrefMap = {};

self.on('message', function onMessage(message) {
  if (message.event === "scan") {
    console.debug("scan hyperlinks");
    scanAndModifyHyperlinks();
  }
  else if (message.event === "href_mod") {
    // console.debug("........." + message.data);
    modifyHyperlink(message.data); // message.data == i
  }
  else {
    console.warn("unknown command");
  }
});

// TODO: rename
function scanAndModifyHyperlinks() {
  console.debug("scanAndModifyHyperlinks");
  let data = $("a");
  var hrefs = [];
  
  for (var i = 0; i < data.length; i += 1) {
    
    // TODO: get href caption (for what?)
    
    let hrefAttr = data[i].href;
    if (hrefAttr != undefined) {
      hrefs.push(data[i]); 
    }
  }

  console.debug(hrefs.length);
  // console.debug(hrefs);
  
  for (var i in hrefs) {
    // tell the main.js that we encountered a href and also pass the
    // href string
    hrefMap[i] = hrefs[i];
    var obj = { href: hrefs[i].href, i: i };
    self.port.emit('href_found', obj);
  }
}

// @param i index of the map
function modifyHyperlink(i) {
  console.debug(i);
  var domHref = hrefMap[i];
  var origHref = domHref.href;
  domHref.addEventListener("click", hrefClickCallback);
  domHref.href = "#" + origHref;
  domHref.origHref = origHref; // set new attribute for later! (TODO: rename if used)
}

function hrefClickCallback(mouseEvent) {
  let href = mouseEvent.currentTarget.origHref;
  let hrefDecoded = decodeURIComponent(href); // http://www.w3schools.com/jsref/jsref_decodeuricomponent.asp
  console.debug("Post: " + hrefDecoded);
  self.port.emit('href', hrefDecoded);
}

function strStartsWith(str, prefix) {
  return str.substring(0, prefix.length) === prefix;
}

function getAllProperties(obj) {
  var result = [];
  var names = Object.getOwnPropertyNames(obj);
  // print(names); // "firstName,lastName,5,test"
  for (var i in names) {
    // print(names[i]); // "firstName", ...
    let name = names[i];
    result.push(i + ":" + name + "[" + typeof obj[name] + "]");
  }

  return result;
};
