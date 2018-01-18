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
If you like the extension and you want to support the development - please consider to donate. Any donations are greatly appreciated.

* AWolf81 - current main developer:
    * [Paypal.me to AWolf81](https://www.paypal.me/awlf81) (coding contributions)
    * What are we doing with the donations?
        * Buy a code signing certificate (needed for Windows) cost around 100 USD
        * Incentive / motivation - this helps to stay motivated.

* Feinstaub - original author and addon management:
    * No direct donations possible yet (waiting for something private and decentrally organized like [GNU Taler](https://taler.net/en))
        * [Some people do not use Paypal](https://github.com/feinstaub/webextension_local_filesystem_links/issues/98#issuecomment-357984115), maybe because of https://de.wikipedia.org/wiki/PayPal#Kritik
    * Any donation that supports a Free Software community helps to maintain a technical and social environment where the development of software like this addon are possible.  If you have no idea which community you would like to support, I recommend these organisations:
        * **KDE**: https://www.kde.org/community/donations/others.php
            * ["A world in which everyone has control over their digital life and enjoys freedom and privacy."](https://dot.kde.org/2016/04/05/kde-presents-its-vision-future)
            * also supports Bitpay: https://bitpay.com/990273/donate)
        * **Free Software Foundation**: https://www.fsf.org/about/ways-to-donate/
        * **Software Freedom Conservancy**: https://sfconservancy.org/donate/
            * ["helps promote, improve, develop, and defend Free, Libre, and Open Source Software (FLOSS) projects"](https://sfconservancy.org/about/)
        * **Mozilla**: https://donate.mozilla.org/de/
    * For Germany, there are related organisations which help Free Software indirectly by supporting the underlying values:
        * **DigitalCourage**: https://digitalcourage.de/ueber-uns
            * "Digitalcourage arbeitet für eine lebenswerte Welt im digitalen Zeitalter."
            * "setzt sich seit 1987 für Grundrechte und Datenschutz ein"
        * **Forum InformatikerInnen für Frieden und gesellschaftliche Verantwortung e.V.**: https://www.fiff.de
            * "FIfF wurde 1984 [...] aus einer historischen Situation heraus gegründet, als es galt, das Schweigen einer Zunft zu brechen, die so maßgeblich an der Entwicklung automatisierter und informatisierter Kriegsführung beteiligt war."
