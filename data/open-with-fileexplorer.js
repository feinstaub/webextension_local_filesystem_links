/*
 * License: www.mozilla.org/MPL/
 * 
 * Usage: used for the context menu entry to send back the selected text
 *
 */
self.on("click", function () {
  var text = window.getSelection().toString(); 
  // above fails if link is inside a textarea
  // detected because I'm testing the add-on at jsfiddle
  // the code below haven't fixed the issue
  // --> need to check later how to fix.
  // code below is from here http://mark.koli.ch/use-javascript-and-jquery-to-get-user-selected-text

  /*var text = '';
  if( window.getSelection ) {
    text = window.getSelection().toString();
  } else if( document.getSelection ) {
    text = document.getSelection().toString();
  } else if( document.selection ) {
    text = document.selection.createRange().text;
  }
  
  console.log(text);*/
  self.postMessage(text);
});
