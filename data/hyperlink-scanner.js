/*
 * License: www.mozilla.org/MPL/
 */
"use strict";

//maps an integer id (loop counter) to the found href
var ajaxDetector;
var buttonLinkClass = "alien-lfl-href-buttonLink";
var hrefMap = [];
var initData;

self.on('message', function onMessage(message) {
    if (message.event === "init") {
        initData = message.data; // see main.js (INIT_DATA_DEFINITION)
        //// console.log("init: " + initData.styleFileUrl);

        let link = jQuery('<link rel="stylesheet" type="text/css" />');
        link.attr('href', initData.styleFileUrl);
        link.appendTo("head"); // alternative: jQuery('head').append(link);
        initiateDynamicHyperlinkScan();
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

var startObservingDom = function() {
    let ajaxDetectorConfig = {
        childList: true,
        attributes: false,
        characterData: false,
        subtree: true,
        attributeOldValue: false,
        characterDataOldValue: false
    };

    ajaxDetector.observe(document.querySelector("body"), ajaxDetectorConfig);
};

var stopObservingDom = function() {
    ajaxDetector.disconnect();
};

/**
 * Initiates dynamic hyperlink scan
 */
var initiateDynamicHyperlinkScan = function() {
    //If current page is excluded, do not create and start mutation observer
    if (currentPageIsExcluded()) {
        return;
    }

    ajaxDetector = new MutationObserver(function (mutationRecord) {
        dynamicHyperlinkScan(mutationRecord);
    });

    startObservingDom();
};

/**
 * Gets triggered every time a batch of mutations occurs to body
 */
var dynamicHyperlinkScan = function(mutationRecords) {
    //Go through the batch
    for (let i = 0; i < mutationRecords.length; i++) {
        //Pick out childLists
        if (mutationRecords[i].type === "childList") {
            var addedNodes = mutationRecords[i].addedNodes;

            //Go through addedNodes only
            for (let j = 0; j < addedNodes.length; j++) {
                //See if we have a regular hyperlink (HTML A-tag or X(HT)ML a-tag)
                if (addedNodes[j].tagName === "A" || addedNodes[j].tagName === "a") {
                    //Only consider links which aren't empty and isn't our button class
                    if (addedNodes[j].className !== "alien-lfl-href-buttonLink" &&
                        addedNodes[j].href !== "") {
                        //Disconnect detector while modifying hyperlink in order to avoid endless modification of DOM
                        stopObservingDom();
                        //TODO this push will cause an enormous array list on very
                        // large pages or pages with lots of DOM changes.
                        // We might want try to trim the array in some way
                        let pos = hrefMap.push(addedNodes[j]) - 1;
                        var obj = { href: addedNodes[j].href, i: pos };
                        self.port.emit("href_found", obj);
                        //Reconnect detector since we have finished modifying the hyperlink
                        startObservingDom();
                    }
                }
                    //Otherwise, check if we have any text in innerHTML
                    // A. Wolf note - innerHTML change from an iframe won't be detected
                    // that's why a change in jsfiddle output isn't updating the link

                else if (addedNodes[j].innerHTML !== undefined &&
                        addedNodes[j].innerHTML !== "") {
                    var innerLink = "";
                    var hrefPos = -1;
                    var endLinkPos = -1;

                    //Try to find links while we haven't reached end of String
                    // and we haven't found a badly formatted URL
                    do {
                        hrefPos = addedNodes[j].innerHTML.indexOf("href=\"", hrefPos) + 6;
                        innerLink = addedNodes[j].innerHTML.substring(hrefPos, addedNodes[j].innerHTML.indexOf("\"", hrefPos));
                        endLinkPos = addedNodes[j].innerHTML.indexOf("</a>", hrefPos) + 4;
                        if (innerLink !== "" && (innerLink.indexOf("file:///") > -1 ||
                                innerLink.indexOf("smb://") > -1)) {
                            //Disconnect detector while modifying hyperlink in order to avoid endless modification of DOM
                            stopObservingDom();
                            // console.log('modify required');
                            //hrefPos +=
                            modifyInnerHyperlink(mutationRecords[i]
                                    .addedNodes[j], innerLink, endLinkPos);
                            //Reconnect detector since we have finished modifying the hyperlink
                            startObservingDom();
                        }
                    } while (innerLink !== "" && (innerLink.indexOf("file:///") > -1 ||
                            innerLink.indexOf("smb://") > -1));
                }
            }
        }
    }
};

var scanHyperlinks = function() {
    //// console.log("scanHyperlinks");

    //If current page is excluded, do not scan hyperlinks
    if (currentPageIsExcluded()) {
        return;
    }

    let data = $("a");

    for (var j = 0; j < data.length; j++) {

        // todo?: get href caption (for what?)

        let hrefAttr = data[j].href;
        if (hrefAttr !== undefined) {
            // tell the main.js that we encountered a href and also pass the
            // href string and its index in hrefMap
            hrefMap[j] = data[j];
            var obj = { href: data[j].href, i: j };
            self.port.emit("href_found", obj);
        }
    }
};

/**
 * Check if current page is in exclude list
 *
 * @returns true if it is, false otherwise
 */
var currentPageIsExcluded = function() {
    let documentUrl = document.URL;
    let excludeUrlStartsWithList = initData.excludeUrlStartsWithList.split(" "); // empty string results in [""] which must be treated separately (length > 0 condition)

    for (let i = 0; i < excludeUrlStartsWithList.length; i += 1) {
        let excludeItem = excludeUrlStartsWithList[i];
        if (excludeItem.length > 0 && strStartsWith(documentUrl, excludeItem)) {
            ////console.log("----------------return...");
            self.port.emit("documenturl_ignored", excludeItem);
            return true; // return true if one of the exclude URLs matches
        }
    }

    return false; //Page wasn't in exclude list, return false
};

var scanTextNodes = function() {
    //// console.log("TODO (make optional; TODO: only scan visible area");
};

//@param i index of the map
//function __modifyHyperlink_old(i) {
//console.log(i);
//var domHref = hrefMap[i];
//var origHref = domHref.href;
//domHref.addEventListener("click", hrefClickCallback);
//domHref.href = "#" + origHref;
//domHref.origHref = origHref; // set new attribute for later
//}

var modifyHyperlinkFromIndex = function(i) {
    //// console.log(i);
    modifyHyperlink(hrefMap[i]);
};

var modifyHyperlink = function(domHref) {
    //Make sure we don't modify our alien links
    if (domHref.className === "alien-lfl-href-buttonLink" ||
            (domHref.nextSibling !== null && domHref.nextSibling.className === "alien-lfl-href-buttonLink")) {
        return;
    }

    var origHref = domHref.href;

    var alienHrefElement = createAlienHrefElement(domHref);

    //
    // now add or update attributes:
    //
    alienHrefElement.attr("title", createTooltip(origHref)); // quicktip; TODO: change this dynamically depending on OS
    if (origHref) {
        alienHrefElement.attr("alien_origHref", origHref); // set new attribute for later in callback
    }

    // alienHrefElement.css('background-color', 'yellow');

    // http://stackoverflow.com/questions/2316199/jquery-get-dom-node  --> [0]
    // we use the original DOM node to add the event listener because the addon works only in FF
    // alienHrefElement[0].addEventListener("click", hrefClickCallback);

    alienHrefElement.unbind(); // remove event from first page scan
    alienHrefElement.click({ origHref: origHref }, hrefClickCallback);
};

/**
 * Modifies hyperlinks which are added by innerHTML
 */
var modifyInnerHyperlink = function(outerElement, origHref, endLinkPos) {

    /*var alienHrefText = "<a class=\"" + buttonLinkClass + "\"" +
            " title=\"" + createTooltip(origHref) + "\"" +
            " onclick=\"window.hrefClickCallback('','" + origHref + "')\"></a>";

    // the following code is not allowed but adding to DOM is required for dynamically added links
    outerElement.innerHTML = outerElement.innerHTML.insert(endLinkPos,
            alienHrefText);*/


    //var json = [ elementype, {attributes}, 'text' ];

    var json = [
        'html:a',
            {
                class: buttonLinkClass,
                title: createTooltip(origHref),
                onclick: "window.hrefClickCallback('','" + origHref +"')"
            }, ''],
            newElement = jsonToDOM(json, document, {});


    // console.log('dynamic content', outerElement.innerHTML.insert(endLinkPos,
    //         newElement.outerHTML));

    outerElement.innerHTML = outerElement.innerHTML.insert(endLinkPos,
           newElement.outerHTML);

    //return alienHrefText.length; // not needed a-tag always length 0
};

/**
 * Creates appropriate alienHrefElement
 */
var createAlienHrefElement = function(domHref) {
    let potentialAlienLink = $(domHref).next();

    // if the next element has not a special attribute that "alien" links have
    // then create the link (which is always the case on first page load)
    if (potentialAlienLink.attr("alien_orighref") == null) {
        $(domHref).after("<a class='" + buttonLinkClass + "'></a>");
        return $(domHref).next(); // get the just inserted element
    }
    else {
        // the potential link was an actual alien link (if rescanning a page)
        return potentialAlienLink;
    }
};

/**
 * Creates tooltip text
 */
var createTooltip = function(origHref) {
    // do not do that:
    //// alienHrefElement.attr("href", "#" + origHref); // todo: on hover show something in status bar to avoid having the #... in the address bar
    // because:
    // 1. http://stackoverflow.com/questions/876390/reliable-cross-browser-way-of-setting-status-bar-text
    //   "For security reasons, most modern browsers disable status bar access by default."
    // 2. Fixes https://github.com/feinstaub/firefox_addon_local_filesystem_links/issues/5
    if (origHref) {
        var tooltip;
        //Check if path is a file and change tooltip accordingly
        if (isFile(origHref)) {
            tooltip = "your default programme";
        }
        else {
            tooltip = initData.fileManagerDisplayName;
        }
        return "Open '" + origHref + "' with " + tooltip + " (Provided by Local Filesystem Links addon)";
    }

    return "";
};

/**
 * Crude check if a path is a file. If a path ends with .FILENAME then it it's considered a file
 *
 * @param pathName to check
 * @returns {Boolean} true if it is, otherwise false
 */
var isFile = function (pathName) {
    return pathName.split('/').pop().split('.').length > 1;
};

/**
 * Inserts string at the given position
 */
String.prototype.insert = function(index, string) {
  if (index > 0)
    return this.substring(0, index) + string + this.substring(index, this.length);
  else
    return string + this;
};

//function hrefClickCallback(mouseEvent) {
var hrefClickCallback = function(e, href) {
    // let href = mouseEvent.currentTarget.alien_OrigHref;
    //Get href from element if href is undefined or empty
    if (href === undefined || href === "") {
        href = e.data.origHref; // http://api.jquery.com/event.data/
    }
    let hrefDecoded = decodeURIComponent(href); // http://www.w3schools.com/jsref/jsref_decodeuricomponent.asp
    //// console.log("Post: " + hrefDecoded);
    self.port.emit('href', hrefDecoded);
};

//Make hrefClickCallback accessible from page code, see https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/Content_Scripts/Interacting_with_page_scripts
exportFunction(hrefClickCallback, unsafeWindow, {defineAs: "hrefClickCallback"});

var strStartsWith = function(str, prefix) {
    return str.substring(0, prefix.length) === prefix;
};

var getAllProperties = function(obj) {
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
