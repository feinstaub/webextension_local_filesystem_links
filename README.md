local-filesystem-links
======================

Overview
--------
This is the alien-local-filesystem-links add-on for Mozilla Firefox.

It contains:

* program (lib/main.js, data/)
* tests (test/)
* documentation (doc/)

License
-------
GPLv3 or later
www.mozilla.org/MPL/ v2 or later


Start developing [LINUX DOES NOT WORK YET, see next section about cxf]
----------------
Based on https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm

### Windows ###
If you haven't already, install appropriate Node.js version from https://nodejs.org/download/.


***Install jpm***

In Node.js command prompt:
```
npm install jpm -g
```

***Run various jpm commands.***

Execute \start_sdk.cmd for convenient fast access to the most common jpm commands allowing you
to execute unit tests, run with debug window and create a xpi file.


### Linux ###
The following instructions are for UNIXoid system which are all summarized by the term Linux.

***Install jpm***
```
sudo npm install jpm -g
```

***Run unit tests.***
```
mkdir _pt           # once
jpm test -p ./_pt   # don't forget the ./
# or see https://github.com/mozilla/jpm/issues/287
jpm -b /usr/lib64/firefox/firefox test -p ./_pt
jpm -b ~/dev/share/firefox-42.0a1/firefox test -p ./_pt
```

--> Currently fails. See my comment on https://github.com/mozilla/jpm/issues/287
Also fails on freshly created addon via `jpm init`
So there is something very wrong.

***Build xpi***
Review package.json to have the correct version number.

```
jpm xpi
```


Developing with deprecated cxf [Only Linux]
------------------------------

Download SDK:
https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation#Installation_on_OS_X_FreeBSD_Linux
and save it so it can be found by start_sdk.sh (see there).

Init SDK:
```
. start_sdk.sh
# There will be some greeting message
```

Run unit tests with currently installed Firefox:
```
cfx test -p _pt
```

Run unit tests with nightly Firefox:
Download from https://nightly.mozilla.org/ and extract
Run, e.g.:
```
cfx test -p _pt -b ~/dev/share/firefox-42.0a1/firefox
```

Run test webserver and run firefox with the addon to do integration tests.
We need node to create a webserver because we cannot test properly with local websites.
```
cd test/webserver # because the node server definition uses relative paths
node test-server.nodejs.js
# show something like:
# Server running at http://127.0.0.1:8125/

```
cfx run -p _pr
# or:
cfx run -p _pr -b ~/dev/share/firefox-42.0a1/firefox
```
# Firefox opens with the addon installed (in the addons page there will even be a Debug button)
# Navigate to the url above.


Create xpi file:
```
cfx xpi
```
