NEXT
----
See https://github.com/feinstaub/firefox_addon_local_filesystem_links/issues?q=is%3Aopen+is%3Aissue+milestone%3Anext


WEB SERVER
----------
Used to verify some features, nodejs is required. See readme in \test\README.md for more information.

Webserver can be started by executing: \test\webserver\start_test_server.cmd

- Q: Why don't we use local html files?
- A: Because they are treated differently (compared to remotely served files) by Firefox


CODING STYLE
------------
We follow w3schools.com's style guide and coding conventions, see http://www.w3schools.com/js/js_conventions.asp.

Additionally all pages are coded in order to conform with strict mode, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode.


DESIGN DECISIONS
----------------

* Options Dialog
** Grid:
    - We do not use DataTables because the inline editing capablilities are limited
      - Positive: can load JSON / JavaScript arrays
      
    - We use http://www.webismymind.be/editablegrid/ instead.
      - Drawback: can only load XML (no JavaScript arrays)
      
      
DOCUMENTATION
-------------
We use JSDoc for documentation, see http://code.google.com/p/jsdoc-toolkit/wiki/DocExamples


IDE Hints
---------
IntelliJ IDEA Community Edition 11
http://stackoverflow.com/questions/1147336/how-to-get-intellij-idea-to-display-directories

1) Start IntelliJ IDEA Community Edition 11.0
2) File --> Open Project... --> Select folder firefox_addon_local_filesystem_links
   (where this README.dev.txt resides)
opt: 3) Project settings --> Spelling --> Custom dict --> ...
