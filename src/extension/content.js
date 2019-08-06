'use strict';

(function fileLinkAddon($) {
    // console.log('content script started...');
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
        $icon = undefined, // loading, see init
        options = {
            //enableLinkIcons: self.options.enableLinkIcons
        },
        currentIconClass; // folder or arrow?

    function updateLinkTooltip() {
        var tooltipText =
            options.revealOpenOption == 'O'
                ? appTextMessages.tooltips.linkText
                : appTextMessages.tooltips.openFolder;

        $('a')
            .filter(fileLinkSelectors.join(', '))
            .attr('title', tooltipText);
    }

    /*
     * Activates the plugin - add icon after link and starts observer if enabled
     */
    function activate() {
        // console.log('activate', options);
        if (options.enableLinkIcons) {
            currentIconClass =
                'aliensun-link-icon' +
                (options.revealOpenOption == 'R' ? '-arrow' : '');

            // createObserver(); // fix later, long running script issue - see issue #109
            $container.addClass(currentIconClass);
            // console.log('added class', $container);

            updateLink($(fileLinkSelectors.join(', ')));
        } else {
            removeLinkIcons();
        }

        // we could add a if case here to add tooltip disable pref.
        updateLinkTooltip();

        registerEvents();
    }

    // Get settings from addon

    browser.runtime.onMessage.addListener(function(
        request,
        sender,
        sendResponse
    ) {
        // console.log(sender.tab ?
        //             "from a content script:" + sender.tab.url :
        //             "from the extension");
        // console.log('init', sender.tab, request.data, request); // sender.tab);
        switch (request.action) {
            case 'destroy':
                // console.log('remove icons & click handlers');
                removeLinkIcons();
                // remove tooltips
                $('a')
                    .filter(fileLinkSelectors.join(', '))
                    .attr('title', '');
                // disconnect jquery-observe
                $(fileLinkSelectors.join(', ')).disconnect();
                $(document).disconnect();
                // remove click handler
                unregisterEvents();
                break;
            case 'init':
                // console.log('init content script', request);
                appTextMessages = request.data.constants.MESSAGES.USERMESSAGES;
                options = request.data.options; // load options

                if (!$icon) {
                    $icon = $container.append(
                        $('<i/>').addClass('material-icons')
                    );
                }

                // port = browser.runtime.connect();
                // console.log('port open', port);
                // now everything is ready to load
                activate();
                sendResponse({ feedback: 'initDone' });
                break;
            default:
        }
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

    // self.port.on('prefChange:enableLinkIcons', updateIcons);
    // self.port.on('prefChange:revealOpenOption', updateIcons);

    // Use delegate so the click event is also avaliable at newly added links
    function registerEvents() {
        $(document).on('click', fileLinkSelectors.join(', '), openFileHandler);

        // icon click handler
        $(document).on(
            'click',
            "[class^='aliensun-link-icon']", // folder or arrow
            openFolderHandler
        );
    }

    function unregisterEvents() {
        $(document).off('click', fileLinkSelectors.join(', '), openFileHandler);
        $(document).off(
            'click',
            "[class^='aliensun-link-icon']",
            openFolderHandler
        );
    }

    function openFileHandler(e) {
        e.preventDefault(); // prevent default to avoid browser to launch smb://
        // console.log('clicked file link: ' +
        //   this.href, options.revealOpenOption);
        browser.runtime
            .sendMessage({
                // port.sendMessage({
                action: 'open',
                // removed decodeURIComponent because env. var. failed
                // --> decoding needed for accents
                message: 'hello',
                url: decodeURIComponent(this.href), // this.href
                reveal: options.revealOpenOption == 'O' ? false : true,
                directOpen: options.revealOpenOption == 'D'
            })
            .then(function(response) {
                // console.log(response);
            })
            .catch(function(error) {
                // console.log('error', error);
            });
    }

    /*
    Event for icon to reveal the folder directly
    */
    function openFolderHandler(e) {
        var link = $(e.currentTarget).data('link');

        e.preventDefault();

        // console.log('clicked icon', link, options.revealOpenOption);

        // self.postMessage({
        //     action: 'open',
        //     // removed decodeURIComponent because env. var. failed
        //     url: link, //decodeURIComponent(link),
        //     reveal: options.revealOpenOption == 'O' ? true : false,
        //     backslashReplaceRequired: true
        // });
        browser.runtime
            .sendMessage({
                // port.sendMessage({
                action: 'open',
                // removed decodeURIComponent because env. var. failed
                // --> decoding needed for accents (check env. var later)
                message: 'hello',
                url: decodeURIComponent(link),
                reveal: options.revealOpenOption == 'O' ? true : false
            })
            .then(function(response) {
                // console.log('response');
            })
            .catch(function(err) {
                // console.log('error', err);
            });
    }

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
        var iconTooltip =
            options.revealOpenOption == 'O'
                ? appTextMessages.tooltips.openFolder
                : appTextMessages.tooltips.linkText;

        // update class (folder or arrow)
        currentIconClass =
            'aliensun-link-icon' +
            (options.revealOpenOption == 'R' ? '-arrow' : '');

        $container.removeClass();
        $container.addClass(currentIconClass);

        $element.each(function(index, el) {
            // console.log('el href = ', $(el).attr('href'));
            // console.log('icon already added?', $(el).next().
            // is('.aliensun-link-icon,.aliensun-link-icon-arrow'));
            if (
                !$(el)
                    .next()
                    .is('.aliensun-link-icon,.aliensun-link-icon-arrow')
            ) {
                // icon not added
                $icon
                    .attr('title', iconTooltip)
                    .clone()
                    .data('link', $(el).attr('href')) // added to container
                    .insertAfter($(el));
            }
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
        if ($(fileLinkSelectors.join(', ')).length > 0) {
            $(fileLinkSelectors.join(', ')).observe(
                { attributes: true, attributeFilter: ['href'] },
                function(/* record */) {
                    // observe href change
                    //console.log('changed href', $(this), $icon.attr('class'));

                    // remove previous icon
                    $(this)
                        .next('.' + $icon.attr('class'))
                        .remove();
                    // add new icons so we have the correct data at the icon
                    updateLink($(this));
                }
            );
        }

        // observe newly added file links
        $(document).observe('added', fileLinkSelectors.join(', '), function() {
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

            console.log('link added', this);
            // console.log($(this).eq(0).html(), record); // this = addedNodes

            // get elements that are with-out icon - avoid multiple icons
            var $elements = $(this).filter(function() {
                // console.log('filter next element', $(this).
                //     next().
                //     is('.aliensun-link-icon,.aliensun-link-icon-arrow'));
                return !$(this)
                    .next()
                    .is('.aliensun-link-icon,.aliensun-link-icon-arrow');
            });

            if ($elements.length > 0) {
                updateLink($elements);
            }
        });
        // suspend not supported in FF
        // function handleSuspend() {
        //     console.log('Suspending event page');
        //     // handle cleanup
        //     $.observe.disconnect();
        // }
        // browser.runtime.onSuspend.addListener(handleSuspend);
    }
})(jQuery);
