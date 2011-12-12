/*
 * License: www.mozilla.org/MPL/
 */
"use strict"

// maps an integer id (loop counter) to the found href
var hrefMap = {};
var initData;

self.on('message', function onMessage(message) {
  if (message.event === "init") {
    initData = message.data;
    console.debug("init: " + initData.styleFileUrl);
    
    let link = jQuery('<link rel="stylesheet" type="text/css" />');
    link.attr('href', initData.styleFileUrl);
    link.appendTo("head"); // alternative: jQuery('head').append(link);
  }
  else if (message.event === "scan") {
    console.debug("scan hyperlinks");
    scanHyperlinks();
  }
  else if (message.event === "href_mod") {    
    modifyHyperlinkFromIndex(message.data); // message.data == i
  }
  else {
    console.warn("unknown command");
  }
});

function scanHyperlinks() {
  console.debug("scanHyperlinks");
  let data = $("a");
  var hrefs = [];
  
  for (var i = 0; i < data.length; i += 1) {
    
    // todo?: get href caption (for what?)
    
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
function __modifyHyperlink_old(i) {
  console.debug(i);
  var domHref = hrefMap[i];
  var origHref = domHref.href;
  domHref.addEventListener("click", hrefClickCallback);
  domHref.href = "#" + origHref;
  domHref.origHref = origHref; // set new attribute for later
}

function modifyHyperlinkFromIndex(i) {
  console.debug(i);
  modifyHyperlink(hrefMap[i]);
}

function modifyHyperlink(domHref) {
  var origHref = domHref.href;
  
  //$(domHref).after(" [<a class='myButtonLink' href='hallo'>hallo</a>]");
  $(domHref).after("<a class='myButtonLink'></a>");
  var insertedNode = $(domHref).next();
  insertedNode.attr("href", "#" + origHref); // TODO: on hover show something in status bar to avoid having the #... in the address bar
  insertedNode.attr("title", "Open in Windows Explorer: " + origHref); // quicktip
  insertedNode.attr("alien_OrigHref", origHref); // set new attribute for later in callback
  // insertedNode.css('background-color', 'yellow');
  
  // http://stackoverflow.com/questions/2316199/jquery-get-dom-node  --> [0]
  // we use the original DOM node to add the event listener because the addon works only in FF
  // insertedNode[0].addEventListener("click", hrefClickCallback);
  
  insertedNode.click({ origHref: origHref }, hrefClickCallback);
}

//function hrefClickCallback(mouseEvent) {
function hrefClickCallback(e) {
  // let href = mouseEvent.currentTarget.alien_OrigHref;
  let href = e.data.origHref; // http://api.jquery.com/event.data/
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
