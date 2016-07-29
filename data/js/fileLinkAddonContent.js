'use strict';

(function fileLinkAddon($, self) {

    $.noConflict();

    var fileLinkSelectors = [
            'a[href^="file:"]'
            /*'a[href^="smb://"]',
            'a[href^="afp://"]'*/
        ],
        appTextMessages = {
            // every constant text we're showing the user
            // e.g. tooltip text constants
        },
        $container = $('<span/>'), //$('<span class="aliensun-link-icon"/>'),
        $icon = {}, // loading, see init
        options = {
            //enableLinkIcons: self.options.enableLinkIcons
        },
        currentIconClass; // folder or arrow?

    function updateLinkTooltip() {
        var tooltipText;

        if (options.revealOpenOption === 'D') {
            tooltipText = appTextMessages.tooltips.openInBrowser;
        }
        else {
            tooltipText = options.revealOpenOption === 'O' ?
                appTextMessages.tooltips.linkText:
                appTextMessages.tooltips.openFolder;
        }
        
        $('a').filter(fileLinkSelectors.join(', '))
            .attr('title', tooltipText);
    }

    /*
    * Activates the plugin - add icon after link and starts observer if enabled
    */
    function activate() {
        // console.log(options);
        if (options.enableLinkIcons) {
            currentIconClass = 'aliensun-link-icon' +
            (options.revealOpenOption == 'R' ? '-arrow' : '');

            createObserver();
            $container.addClass(currentIconClass);

            updateLink($(fileLinkSelectors.join(', ')));
        }

        // we could add a if case here to add tooltip disable pref.
        updateLinkTooltip();
    }

    // Get settings from addon
    self.port.on('init', function(addonOptions, constants) {
        // console.log('init', addonOptions, constants);
        appTextMessages = constants.MESSAGES.USERMESSAGES;

        // load plugin options
        options = addonOptions;

        // console.log('test', appTextMessages);
        $icon = $container.append($('<i/>').addClass('material-icons'));

        // now everything is ready to load
        activate();
    });

    // Update settings on change of pref.
    function updateIcons(data) {
        options = $.extend({}, options, data);

        // console.log('pref changed', data, options);
        removeLinkIcons();
        updateLinkTooltip();

        if (options.enableLinkIcons) {
            updateLink($(fileLinkSelectors.join(', ')));
        }
    }

    self.port.on('prefChange:enableLinkIcons', updateIcons);
    self.port.on('prefChange:revealOpenOption', updateIcons);

    // Use delegate so the click event is also avaliable at newly added links
    $(document).on('click', fileLinkSelectors.join(', '), function(e) {
        e.preventDefault(); // prevent default to avoid browser to launch smb://
        //console.log( "clicked file link: " + this.href, options.revealOpenOption);
        self.postMessage( {
            action: 'open',
            url: decodeURIComponent( this.href )
        } );
    } );

    /*
    Event for icon to reveal the folder directly
    */
    function openFolderHandler(e) {
        var link = $(e.currentTarget).data('link');

        e.preventDefault();
        // console.log('clicked icon', link, options.revealOpenOption);

        self.postMessage( {
            action: 'reveal',
            // url: decodeURIComponent( $(e.currentTarget).data('link'))
            url: decodeURIComponent(link),
            backslashReplaceRequired: true // @todo check Linux too
        } );
    }

    // icon click handler
    $(document).on('click',
    '[class^=\'aliensun-link-icon\']',// folder or arrow
    openFolderHandler);

    // -------------------------------------------------------------------------
    // add link icons (if enabled)
    //
    // Check at every click if there are new a-tags
    // almost works, there is an issue if the content is loaded
    // with ajax it will fail because at the moment after click
    // there is no new link icon
    //
    // Ideas to add the icons (only needed if we need to add icons to DOM):
    // - add one timeout after click
    //   --> probably the easiest way but it could fails
    //   if the request is taking longer
    // - check if we can detect that all ajax requests are resolved and then
    //   check for updated dom
    // - use mutationObserver will work but could be a lot to execute if there
    //   is many content added to the DOM
    // - use an interval (every second) that's checking if there is a new link
    //
    // A timeout was OK at the beginning because the icons will be checked after
    // any click
    //
    // -->better check if there are new links with an interval if the icons
    //    are enabled.
    //    if they're disabled we don't need an interval
    //    (works also for ajax added content)
    //
    // --> final solution: use jquery-observe that's simplyfing mutationObserver

    function updateLink($element) {
        // console.log('updating', $element);
        var iconTooltip;

        if (options.revealOpenOption === 'D') {
            iconTooltip = appTextMessages.tooltips.openFolder;
        } else {
            iconTooltip = options.revealOpenOption == "O" ? 
                appTextMessages.tooltips.openFolder :
                appTextMessages.tooltips.linkText;
        }

        // update class (folder or arrow)
        currentIconClass = 'aliensun-link-icon' +
        (options.revealOpenOption == 'R' ? '-arrow' : '');

        $container.removeClass();
        $container.addClass(currentIconClass);

        $element.each(function(index, el) {
            // console.log('el href = ', $(el).attr('href'));
            $icon.
                attr('title', iconTooltip).
                clone().data('link', $(el).attr('href')). // added to container
                insertAfter($(el));
        });
    }

    /*
    * Remove all link icons
    * (needed for updating at icon pref. change)
    */
    function removeLinkIcons() {
        var $icons = $('.aliensun-link-icon, .aliensun-link-icon-arrow');
        // console.log('test',$icons);

        $icons.remove();
    }

    /*
    * Create observers for file links
    * Two observers - one for href attributes and
    * another one for newly added file links
    */
    function createObserver() {
        // observe changes of file links
        // create an observer if someone is changing an a-tag directly
        $(fileLinkSelectors.join(', ')).
            observe({attributes: true, attributeFilter: ['href']},
                function(/* record */) {
                    // observe href change
                    //console.log('changed href', $(this), $icon.attr('class'));

                    // remove previous icon
                    $(this).next('.' + $icon.attr('class')).remove();
                    // add new icons so we have the correct data at the icon
                    updateLink($(this));
                });

        // observe newly added file links
        $(document).
            observe('added', fileLinkSelectors.join(', '),
            function(/* record */) {
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
                //
                // Update: 09.03.2016
                // We're getting only one observer callback for each added element.
                // So we don't need to store the previous added node.

                //console.log('link added');
                // console.log($(this).eq(0).html(), record); // this = addedNodes

                // get elements that are with-out icon - avoid multiple icons
                var $elements = $(this).filter(function(/* index, item */) {
                    return !$(this).
                        next().
                        is('.aliensun-link-icon,.aliensun-link-icon-arrow');
                });

                updateLink($elements);
            });
    }
}(jQuery, window.self));
