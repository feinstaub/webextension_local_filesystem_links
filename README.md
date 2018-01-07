local-filesystem-links
======================

Overview
--------
This is the alien-local-filesystem-links extension for Mozilla Firefox.

It contains:

* extension source code (src/)
* native app source code (native-host/)
* tests (test/)
* documentation (doc/)


Features
--------
- Adds a click event to every link that is including `file://` or `smb://` in `href` tag. (smb not working yet)
- Shows a link icon close to the link. Icon can be disabled in preferences.
- Dynamic loaded content supported because link events are delegated with `$(document).on(...)`
- Supports links with double and tripple slashes (e.g. file:// or file:///)
- (Not available: Right click context menu that opens a text selection that contains a file link + option to reveal the directory of a directly linked file.)
- Whitelist option to enable local links only at a specific url e.g. `*.trello.com`
- Statusbar icon for displaying if links are active for current tab & for easier access to addon settings
- Option to change the default text link behaviour (open or reveal)
- Localization (current languages German, English, Russian)


Screenshots
--------
![Addon at local test server](/doc/screenshots/addon_in_action.png)
![Context menu](/doc/screenshots/addon_context_menu.png)


License
-------
* GPLv3 or later
* www.mozilla.org/MPL/ v2 or later


Start developing
----------------
See README.dev.md


Donations
---------
If you like the extension and you want to support the development. Donations are appreciated.

- [https://www.paypal.me/awlf81](Paypal.me to AWolf81 (coding))
- Feinstaub (creator & management) (no direct donations possible yet - reason see below)

What are we doing with the donations?
- Buy a code signing certificate (needed for Windows) cost around 100 USD
- Incentive / motivation - this helps to stay motivated.
- Donations to support other open source projects e.g. Mozilla