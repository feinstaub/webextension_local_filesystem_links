/*
 * License: www.mozilla.org/MPL/
 * 
 * Usage: used for the context menu entry to send back the selected text
 */
self.on("click", function () {
  var text = window.getSelection().toString();
  self.postMessage(text);
});
