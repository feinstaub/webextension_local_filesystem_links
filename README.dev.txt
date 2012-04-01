\test\webserver\start_test_server.cmd
-------------------------------------
Starts a webserver where you can verify some features.
- Q: Why don't we use local html files?
- A: Because they are treated differently (compared to remotely served files) by Firefox


DESIGN DECISIONS
----------------

* Options Dialog
** Grid:
    - We do not use DataTables because the inline editing capablilities are limited
      - Positive: can load JSON / JavaScript arrays
      
    - We use http://www.webismymind.be/editablegrid/ instead.
      - Drawback: can only load XML (no JavaScript arrays)
      
      
JSDoc
-----
http://code.google.com/p/jsdoc-toolkit/wiki/DocExamples


IDE Hints
---------
IntelliJ IDEA Community Edition 11
http://stackoverflow.com/questions/1147336/how-to-get-intellij-idea-to-display-directories

1) Start IntelliJ IDEA Community Edition 11.0
2) File --> Open Project... --> Select folder firefox_addon_local_filesystem_links
   (where this README.dev.txt resides)
opt: 3) Project settings --> Spelling --> Custom dict --> ...
