#Local links opener Addon
Adds the behaviour to firefox to open local links file:/// style in windows explorer.

#About this plugin
It's similar to this [plugin](https://github.com/feinstaub/firefox_addon_local_filesystem_links). I've created it because the mentioned repo is difficult to read and I'd like to learn how to write firefox addons.

The addon is working (locally tested in windows). Linux not tested yet. Also SMB protocol not tested yet.

# Features

- Adds a click event to every link that is including `file://` or `smb://` in `href` tag.
- Shows a link icon close to the link. Requires an interval that checks every second if there is a new link. Can be disable in preferences. (Issue - pref. not stored yet)
- Dynamic loaded content supported because link events are delegated with `$(document).on(...)`
- Supports links with double and tripple slashes (e.g. file:// or file:///)
- Right click context menu that opens a text selection that contains a file link + option to reveal the directory of a directly linked file.
- Whitelist option to enable local links only at a specific url e.g. `*.trello` (not tested yet)

#Installation

Clone the repositority and start firefox with `jpm run` in the root directory for testing the plugin in the browser.

(If you don't have jpm installed use `npm install jpm -g`.)

To run the tests you can use `jpm test`.

#License
GPL v2

Some parts of this repository are from Feinstaub's repository (see link above):
- utitlty function (link-utils.js, os-utils.js, strin-utils.js)
- test/webserver

# Screenshots
![Addon at local test server](http://img.ctrlv.in/img/15/11/29/565a4e897bd41.png)
![Context menu](http://img.ctrlv.in/img/15/11/29/565a4f43370b1.png)

#Todo
- Add tooltip to link
- Check why the preferences of the addon are not saved
- Test whitelist setting (once the preferences are saved)
- Add unit tests
- test code with validation tool from mozilla
- check if I push this to the mozilla addon gallery