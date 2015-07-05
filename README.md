local-filesystem-links
======================

Overview
--------
This is the alien-local-filesystem-links add-on for Mozilla Firefox.

It contains:

* program (lib/main.js, data/)
* tests (test/)
* documentation (doc/)

License: www.mozilla.org/MPL/, GPLv3


Start developing
----------------

Download SDK:
https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation#Installation_on_OS_X_FreeBSD_Linux
and save it so it can be found by start_sdk.sh (see there).

Init SDK:
```
. start_sdk.sh
# There will be some greeting message
```

Run unit tests:
```
cfx test -p _p_test
```

Run test webserver and run firefox with the addon to do integration tests.
We need node to create a webserver because we cannot test properly with local websites.
```
cd test/webserver # because the node server definition uses relative paths
node /test-server.nodejs.js
# show something like:
# Server running at http://127.0.0.1:8125/

cfx run -p _p1
# Firefox opens with the addon installed (in the addons page there will even be a Debug button)
# Navigate to the url above.
```
