// ContextMenu.js

// Creates a menu item to do the following:
// - execute the link with reveal mode instead of opening file
// - execute selected file link

var contextMenu = require( "sdk/context-menu" );

/**
 * Creates two context menu items for different use cases:
 * 1. if user selected a link text file://... the menuItemSelect will be in the context menu
 * 2. if the user right clicks at a file link he can reveal the directory of a file link.
 *
 * @param callback(path, reaveal) reveal = true --> reveals folder
 */
module.exports = function( callback ) {
    var selectContentScript = 'self.on("click", function () {' +
        "  var text = window.getSelection().toString();" +
        "  self.postMessage(text);" +
        "});"; // Could be refactored to a separate file later --> improve readability

    var menuItemSelect = contextMenu.Item( {
        label: "Link addon - execute selected link",
        context: contextMenu.SelectionContext(),
        contentScript: selectContentScript,

        //AccessKey: "l",
        onMessage: function( url ) {
            callback( url );
        }
    } );

    var menuItemSelectReveal = contextMenu.Item( {
        label: "Link addon - execute selected link (reveal)",
        context: contextMenu.SelectionContext(),
        contentScript: selectContentScript,

        //AccessKey: "l",
        onMessage: function( url ) {
            callback( url, true );
        }
    } );

    var menuItemOptions = contextMenu.Item( {
        label: "Link addon - reveal selected link",
        context: contextMenu.SelectorContext( "a[href]" ),
        contentScript: 'self.on("click", function (node , data) {' +
            "  self.postMessage(node.href);" +
            "});",

        //AccessKey: "l",
        onMessage: function( url ) {

            //Console.log(url);
            callback( url, true );
        }
    } );
};
