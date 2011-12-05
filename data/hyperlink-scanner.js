/*
 * License: www.mozilla.org/MPL/
 */
"use strict"

self.on('message', function onMessage(commandString) {
  if (commandString === "scan") {
    console.debug("scan hyperlinks");
    scanAndModifyHyperlinks();
  } else {
    console.warn("unknown command");
  }
});

//
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
  };

  console.debug(hrefs.length);
  // console.debug(hrefs);
  
  let lflHrefs = [];
  
  for (var i in hrefs) {
    //console.debug(getAllProperties(hrefs[i]));
    if (looksLikeLocalFileLink(hrefs[i].href)) {
      lflHrefs.push(hrefs[i]);
    }
  }
  
  // console.debug(lflHrefs);
  let lflHrefsLength = lflHrefs.length;
  
  for (var i = 0; i < lflHrefsLength; i += 1) {
    console.debug(i);
    var origHref = lflHrefs[i].href;
    if (strStartsWith(origHref, "file:///")) {
      console.debug(origHref);
      lflHrefs[i].addEventListener("click", hrefClickCallback);
      lflHrefs[i].href = "#" + origHref;
      lflHrefs[i].origHref = origHref; // set new attribute!
    }
  }  
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
