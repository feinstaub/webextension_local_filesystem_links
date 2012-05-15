/*
 * License: www.mozilla.org/MPL/
 */
"use strict"

self.on('message', function onMessage(commandString) {
  if (commandString == "scan") {
    //// console.debug("scan content text (disabled)");
    // scanAndCreateHyperlinks();
  } else {
    //// console.warn("unknown command");
  }
});

// This method would be able to find local file links but it
// slows down page loading a lot.
// Can we do the scanning in background?
//
function scanAndCreateHyperlinks() {
  //// console.log("scanAndCreateHyperlinks");
  //// console.log(document.location);
  // console.log($("*").length);
  let data = $("*");

//  let a = $("*").contents().filter(function() {
//    return $(this).nodeType == Node.TEXT_NODE;
//    }
//  );
    
  // console.log(a);
  
//  console.log(getAllProperties(b));
  
//  for (i in a) {
//    console.log(i);
//  }

  let localFileTextNodes = [];

  data.each(function(i) {
      let th = $(this);
      if (th.nodeType == Node.TEXT_NODE) {
        let t = th.text();
        if (t.length > 0 && looksLikeLocalFileLink(t)) {
          //console.log(i + " " + $(this).text());
          localFileTextNodes.push(th);
        }
      }
   });

   //// console.log(localFileTextNodes.length);
}

function looksLikeLocalFileLink(text) {
  // TODO
  return text.length >= 2 && text.length < 30;
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
