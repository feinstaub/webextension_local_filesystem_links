/*
 * License: www.mozilla.org/MPL/
 */
"use strict"

//maps an integer id (loop counter) to the found href
var hrefMap = {};
var initData;

self.on('message', function onMessage(message) {
    if (message.event === "init") {
        initData = message.data; // see main.js (INIT_DATA_DEFINITION)
        //// console.log("init: " + initData.styleFileUrl);

        let link = jQuery('<link rel="stylesheet" type="text/css" />');
        link.attr('href', initData.styleFileUrl);
        link.appendTo("head"); // alternative: jQuery('head').append(link);
    }
    else if (message.event === "scan_hyperlinks") {
        //// console.log("scan_hyperlinks");
        scanHyperlinks();
    }
    else if (message.event === "scan_textnodes") {
        //// console.log("scan_textnodes");
        scanTextNodes();
    }  
    else if (message.event === "href_mod") {    
        modifyHyperlinkFromIndex(message.data); // message.data == i
    }
    else if (message.event === "rescan_page") {
        scanHyperlinks(); // same as in event "scan_hyperlinks", can handle both cases
    }
    else {
        console.warn("unknown command");
    }
});

function scanHyperlinks() {
    //// console.log("scanHyperlinks");
    ////alert(document.URL);
  
    let documentUrl = document.URL;
    let excludeUrlStartsWithList = initData.excludeUrlStartsWithList.split(" "); // empty string results in [""] which must be handeled separately
    
    for (var i = 0; i < excludeUrlStartsWithList.length; i += 1) {
      let item = excludeUrlStartsWithList[i];
      if (item.length > 0 && strStartsWith(documentUrl, item)) {
	////console.log("----------------return...");
	return; // exit this method if one of the exclude URLs matches
      }
    }
    
    let data = $("a");
    var hrefs = [];

    for (var i = 0; i < data.length; i += 1) {

        // todo?: get href caption (for what?)

        let hrefAttr = data[i].href;
        if (hrefAttr != undefined) {
            hrefs.push(data[i]); 
        }
    }

    //// console.log(hrefs.length);
    // console.log(hrefs);

    for (var i in hrefs) {
        // tell the main.js that we encountered a href and also pass the
        // href string
        hrefMap[i] = hrefs[i];
        var obj = { href: hrefs[i].href, i: i };
        self.port.emit("href_found", obj);
    }
}

function scanTextNodes() {
    //// console.log("TODO (make optional; TODO: only scan visible area");
}

//@param i index of the map
//function __modifyHyperlink_old(i) {
//console.log(i);
//var domHref = hrefMap[i];
//var origHref = domHref.href;
//domHref.addEventListener("click", hrefClickCallback);
//domHref.href = "#" + origHref;
//domHref.origHref = origHref; // set new attribute for later
//}

function modifyHyperlinkFromIndex(i) {
    //// console.log(i);
    modifyHyperlink(hrefMap[i]);
}

function modifyHyperlink(domHref) {
    var origHref = domHref.href;

    var potentialAlienLink = $(domHref).next();
    var alienHrefElement = null;

    // if the next element has not a special attribute that "alien" links have
    // then create the link (which is always the case on first page load)
    if (potentialAlienLink.attr("alien_OrigHref") == null) {
        $(domHref).after("<a class='alien-lfl-href-buttonLink'></a>");
        alienHrefElement = $(domHref).next(); // get the just inserted element
    }
    else {
        // the potential link was an actual alien link (if rescanning a page)
        alienHrefElement = potentialAlienLink;
    }

    //
    // now add or update attributes:
    //

    // do not do that:
    //// alienHrefElement.attr("href", "#" + origHref); // todo: on hover show something in status bar to avoid having the #... in the address bar
    // because:
    // 1. http://stackoverflow.com/questions/876390/reliable-cross-browser-way-of-setting-status-bar-text
    //   "For security reasons, most modern browsers disable status bar access by default."
    // 2. Fixes https://github.com/feinstaub/firefox_addon_local_filesystem_links/issues/5

    alienHrefElement.attr("title", "Open in " + initData.fileManagerDisplayName + ": " + origHref); // quicktip; TODO: change this dynamically depending on OS
    alienHrefElement.attr("alien_OrigHref", origHref); // set new attribute for later in callback
    // alienHrefElement.css('background-color', 'yellow');

    // http://stackoverflow.com/questions/2316199/jquery-get-dom-node  --> [0]
    // we use the original DOM node to add the event listener because the addon works only in FF
    // alienHrefElement[0].addEventListener("click", hrefClickCallback);

    alienHrefElement.unbind(); // remove event from first page scan
    alienHrefElement.click({ origHref: origHref }, hrefClickCallback);
}

//function hrefClickCallback(mouseEvent) {
function hrefClickCallback(e) {
    // let href = mouseEvent.currentTarget.alien_OrigHref;
    let href = e.data.origHref; // http://api.jquery.com/event.data/
    let hrefDecoded = decodeURIComponent(href); // http://www.w3schools.com/jsref/jsref_decodeuricomponent.asp
    //// console.log("Post: " + hrefDecoded);
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
