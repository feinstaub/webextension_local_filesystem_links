"use strict";

( function fileLinkAddon( $, self ) {

    $.noConflict();

    var fileLinkSelectors = [
            'a[href^="file:"]',
            /*'a[href^="smb://"]',
            'a[href^="afp://"]'*/
        ],
        appTextMessages = {
            // every constant text we're showing the user
            // e.g. tooltip text constants
        },
        $container = $('<span class="aliensun-link-icon"/>'),
        $icon = {}, // loading, see init
        options = {
            //enableLinkIcons: self.options.enableLinkIcons
        },
        tooltipFilemanagerText, // not used yet?
        appName,            // where is it used?
        latestNodesAdded;
    /**
     * Activates the plugin - add icon after link and starts observer if enabled
     */
    function activate() {
        // console.log(options);
        if ( options.enableLinkIcons ) {
            createObserver();
            updateLink($(fileLinkSelectors.join(', ')));
        }

        // we could add a if case here to add tooltip disable pref.
        $('a').filter(fileLinkSelectors.join(', '))
            .attr('title', appTextMessages.tooltips.linkText);
    }

    // Get settings from addon
    self.port.on( "init", function( addonOptions, constants) {
        // console.log('init', addonOptions, constants);
        // load plugin options
        options = addonOptions;

        // load constant texts from addon
        tooltipFilemanagerText = constants.MESSAGES.FILEMANAGER;
        appName = constants.APP.name;
        appTextMessages = constants.MESSAGES.USERMESSAGES;
        // console.log('test', appTextMessages);
        $icon = $container.append($( "<i/>" )
                            .attr("title",
                                appTextMessages.tooltips.openFolder)
                            .addClass( "material-icons" )
                    );

        // now everything is ready to load
        activate();
    } );

    // Update settings on change of pref.
    self.port.on( "prefLinkIconChange", function( data ) {
        // options.enableLinkIcons = data.enableLinkIcons;
        options = $.extend({}, options, data);

        // console.log('pref changed', data, options);
        if ( !options.enableLinkIcons ) {
            removeLinkIcons();
        } else {
            updateLink($(fileLinkSelectors.join(', ')));
        }
    } );

    // Use delegate so the click event is also avaliable at newly added links
    $( document ).on( "click", fileLinkSelectors.join( ", " ), function( e ) {
        e.preventDefault(); // prevent default to avoid browser to launch smb://
        // console.log( "clicked file link: " + this.href );
        self.postMessage( {
            action: "open",
            url: decodeURIComponent( this.href )
        } );
    } );

    /*
      Event for icon to reveal the folder directly
    */
    function openFolderHandler(e) {
        var link = $(e.currentTarget).data('link');
        e.preventDefault();

        // we need to check if file has 2 slashes because ff won't fix it here
        link = link.replace(/file:[\/]{2,3}/i, 'file:\/\/\/');
        // console.log('clicked icon', link);
        // alert('clicked icon');
        self.postMessage( {
            action: "reveal",
            // url: decodeURIComponent( $(e.currentTarget).data('link'))
            url: decodeURIComponent(link)
        } );
    }

    // icon click handler
    $( document ).on( "click", ".aliensun-link-icon", openFolderHandler);

    // -------------------------------------------------------------------------
    // add link icons (if enabled)
    //
    // Check at every click if there are new a-tags
    // almost works, there is an issue if the content is loaded with ajax it will fail
    // because at the moment after click there is no new link icon
    //
    // Ideas to add the icons (only needed if we need to add icons to DOM):
    // - add one timeout after click --> probably the easiest way but it could fails
    //   if the request is taking longer
    // - check if we can detect that all ajax requests are resolved and then check for updated dom
    // - use mutationObserver will work but could be a lot to execute if there is many
    //   content added to the DOM
    // - use an interval (every second) that's checking if there is a new link
    //
    // A timeout was OK at the beginning because the icons will be checked after any click
    //
    // -->better check if there are new links with an interval if the icons are enabled.
    //    if they're disabled we don't need an interval (works also for ajax added content)
    //
    // --> final solution: use jquery-observe that's simplyfing mutationObserver

    function updateLink($element) {
        // console.log('updating', $element);
        $element.each(function(index, el) {
            // console.log('el href = ', $(el).attr('href'));
            $icon
                .clone()
                .data('link', $(el).attr('href')) // added to container
                // .click(openFolderHandler)
                .insertAfter($(el));
        });
        // $icon
        //     .clone()
        //     .data('link', $element.attr('href')) // added to container
        //     .insertAfter($element);
    }

    /**
      * Remove all link icons
      * (needed for updating at icon pref. change)
      */
    function removeLinkIcons() {
        var $icons = $('.aliensun-link-icon');
        // console.log('test',$icons);

        $icons.remove();
    }

    function createObserver() {
        // observe changes of file links
        // @todo: will fail if the link was added with ajax
        // --> check if observing on document is possible
        $(fileLinkSelectors.join(', '))
            .observe({ attributes: true, attributeFilter: ['href'] },
                function(record) {
                // observe href change
                // check if icon is still there
                // console.log('changed href', record, $icon.attr('class'));
                if ( !$(record.target)
                	.find('i').hasClass($icon.attr('class')) ) {
                    //console.log('changed link and removed icon');
                    updateLink(record.target);
                }
        });

        // observe newly added file links
        $(document)
            .observe('added', fileLinkSelectors.join(', '),
                function(record) {
            // Observe if elements matching 'a[href^="file://"]' have been added
            //
            // there can be multiple observer callbacks attached now!!
            // --> if you add three links you'll get three callback events
            //     with the same elements
            //     --> store elements in first observer,
            //         so next observer callback detect that there is
            //         nothing new
            //
            // Info:
            // That's working but it would be better to not trigger
            // these callbacks but I'm not sure how to fix.
            // --> asked if it could be fixed,
            //     see here https://github.com/kapetan/jquery-observe/issues/5
            //console.log(record);
            if (latestNodesAdded !== record.addedNodes) {
            	// new nodes
                // console.log('addedNodes', record.addedNodes);
                var $elements = $(record.addedNodes)
                    .find(fileLinkSelectors.join(', ')),
                    $element = $elements.length ? $elements: record.addedNodes;

                // elements check needed if links are wrapped in an element
                // other case is for directly added link
            	updateLink($element);
            	latestNodesAdded = record.addedNodes;
            }
      })
    }


}( jQuery, window.self ) );
