# Local links opener Addon
Adds the behaviour to firefox to open local links file:/// style in windows explorer.

# About this plugin
It's similar to this [plugin](https://github.com/feinstaub/firefox_addon_local_filesystem_links). I've created it because the mentioned repo is difficult to read and I'd like to learn how to write firefox addons.

The addon is working (locally tested with Windows 8.1 (64 bit) and Ubuntu 14.04 LTS (32 bit)). SMB protocol not working yet. Check feature branch smb links to see the current work (not working yet).

# Features

- Adds a click event to every link that is including `file://` or `smb://` in `href` tag.
- Shows a link icon close to the link. Requires an interval that checks every second if there is a new link. Can be disable in preferences. (Issue - pref. not stored yet)
- Dynamic loaded content supported because link events are delegated with `$(document).on(...)`
- Supports links with double and tripple slashes (e.g. file:// or file:///)
- Right click context menu that opens a text selection that contains a file link + option to reveal the directory of a directly linked file.
- Whitelist option to enable local links only at a specific url e.g. `*.trello.com`

# Installation

Clone the repositority and start firefox with `jpm run` in the root directory for testing the plugin in the browser.

(If you don't have jpm installed use `npm install jpm -g`.)

To run the tests you can use `jpm test` (on windows). If you're testing on linux you can run `npm run jpmLinux`.

# License
GPL v2

Some parts of this repository are from Feinstaub's repository (see link above):
- utitlty function (link-utils.js, os-utils.js, strin-utils.js)
- test/webserver

# Screenshots
![Addon at local test server](http://img.ctrlv.in/img/15/11/29/565a4e897bd41.png)
![Context menu](http://img.ctrlv.in/img/15/11/29/565a4f43370b1.png)

# Todo
- <del>Add tooltip to link</del>
- Add a prefix option e.g. add `my_prefix` to a local path: c:\my_prefix\test\test.txt
- Can windows path variables be used in the links? e.g. %java_jdk%/bin
- <del>Check why the preferences of the addon are not saved</del>
- <del>Test whitelist setting (once the preferences are saved)</del>
- Add unit tests
- <del>test code with validation tool from mozilla</del>
- <del>check if I push this to the mozilla addon gallery. I'll merge this repo into
  feinstaub's repository.</del>
