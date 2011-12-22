DESIGN DECISIONS
----------------

* Options Dialog
** Grid:
    - We do not use DataTables because the inline editing capablilities are limited
      - Positive: can load JSON / JavaScript arrays
      
    - We use http://www.webismymind.be/editablegrid/ instead.
      - Drawback: can only load XML (no JavaScript arrays)
      
