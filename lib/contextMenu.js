// ContextMenu.js

// Creates a context menus to do the following:
// - execute the link with reveal mode instead of opening file
// - execute selected file link
// (two cases selected text and right click on link --> two menus)

var contextMenu = require( "sdk/context-menu" ),
    _ = require("sdk/l10n").get

/**
 * Creates two context submenus for different use cases (with open and reveal):
 * 1. if user selected a link text file://...
 * 2. if the user right clicks at a file link
 *
 * @param callback(path, reveal) reveal = true --> reveals folder
 */
module.exports = function( callback ) {
    var selectContentScript = 'self.on("click", function () {' +
        "  var text = window.getSelection().toString();" +
        "  self.postMessage(text);" +
        "});"; // Could be refactored to a separate file later --> improve readability

    var menuItemSelect = contextMenu.Item( {
        label: _('LABEL_CONTEXT_MENU_OPEN_LINK'),
        contentScript: selectContentScript,

        //AccessKey: "l",
        onMessage: function( url ) {
            callback( url );
        }
    } );

    var menuItemSelectReveal = contextMenu.Item( {
        label: _('LABEL_CONTEXT_MENU_OPEN_CONTAINING'),
        contentScript: selectContentScript,

        //AccessKey: "l",
        onMessage: function( url ) {
            callback( url, true );
        }
    } );

    var itemContentScript = 'self.on("click", function (node , data) {' +
        "  self.postMessage(node.href);" +
        "});";

    var menuItemFolder = contextMenu.Item( {
        label: _('LABEL_CONTEXT_MENU_OPEN_CONTAINING'),
        contentScript: itemContentScript,

        //AccessKey: "l",
        onMessage: function( url ) {

            //Console.log(url);
            callback( url, true );
        }
    } );

    var menuItemLink = contextMenu.Item( {
        label: _('LABEL_CONTEXT_MENU_OPEN_LINK'),
        contentScript: itemContentScript,

        //AccessKey: "l",
        onMessage: function( url ) {

            //Console.log(url);
            callback( url, false );
        }
    } );

    // create a submenu for selection
    var subMenuSelection = contextMenu.Menu({
        label: _('LABEL_CONTEXT_SUB_SELECTION_TITLE'),
        context: contextMenu.SelectionContext(),
        items: [
            menuItemSelect,
            menuItemSelectReveal
        ]
    });

    // create a submenu for right click on link
    var subMenuRightClick = contextMenu.Menu({
        label: _('LABEL_CONTEXT_SUB_LINK_TITLE'),
        context: contextMenu.SelectorContext( "a[href]" ),
        items: [
            menuItemLink,
            menuItemFolder
        ]
    });
};
