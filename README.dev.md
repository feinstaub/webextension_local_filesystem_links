local-filesystem-links DEVELOPMENT
==================================

jsfiddle for some whitelist testing: http://jsfiddle.net/awolf2904/tefcs74q/

Todos for README:

- [ ] Remove everything jpm related
- [ ] Cleanup
- [ ] Changed linting from gulp to eslint directly

# Building for production

1. Install dependencies:

    $ npm install

2. Generate the production version of the extension in dist folder.
Creates extension from src folder, converts host script to executable and create installer with InnoSetup
   (working under windows)

    $ npm run build

3. Sign

* One-time: Install [web-ext](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext) with `npm install web-ext`.
* Find API key hiere: See Tools > Manage API Keys (https://addons.mozilla.org/en-US/developers/addon/api/key/)

    $ ./node_modules/web-ext/bin/web-ext sign --api-key=userkey --api-secret=... -s dist

NOTE for 0.99.57:
    - the sign command automatically triggers the review process. No need to upload it manually
    - 0.99.58: "Your add-on has been submitted for review. It passed validation but could not be automatically signed because this is a listed add-on.
    FAIL"

Not needed? (generates web-ext-artifacts/local_filesystem_links-0.99.58.zip for example):

4. Generate the bundle in web-ext-artifacts folder / create the final package

    $ npm run bundle

Now manual upload of the zip file here: https://addons.mozilla.org/en-US/developers/addon/local-filesystem-links/versions
    - red message: "Version 0.99.58 was uploaded before and deleted". No hint what to do next.
    - solution: upload new version 0.99.59 (npm run build, npm run bundle, upload the file)

# Extension testing in browser (still valid?)

## Install native app
Go to `src\host\` and run `install_host`. This will register the native app in your system-

## Manually starting
Run `npm run dev`, open Firefox and enter about:debugging in url bar and load `dist\manifest.json` Extension.

## With Web-ext CLI
Install [web-ext](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext) with `npm install --global web-ext`.

And run `web-ext run` in `dist` folder to start FF nightly with the Extension temporarily enabled.


# Usage
First run `npm install`.

## Start dev server
`npm run dev` starts the development build for FF and watches source directory for changes.

## Start firefox with webextension loaded
`npm start` to start web-ext start with dist folder. It will load the extension in Firefox.

Based on https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm

### Linux ###
The following instructions are for UNIXoid system which are all summarized by the term Linux.

***Install jpm***
```
npm install jpm
```
This will install jpm locally to node_modules/jpm/bin

Add jpm to PATH:
```
export PATH=`pwd`/node_modules/jpm/bin:$PATH
```

***Run unit tests.***
```
mkdir _pt           # once
jpm test -p ./_pt   # don't forget the ./
# or see https://github.com/mozilla/jpm/issues/287
jpm -b $(which firefox) test -p ./_pt
jpm -b ~/dev/share/firefox-42.0a1/firefox test -p ./_pt
```

--> Currently fails. See my comment on https://github.com/mozilla/jpm/issues/287
Also fails on freshly created addon via `jpm init`
So there is something very wrong.

***Build xpi***
Review package.json to have the correct version number.
And make sure it is a NEWER version:
see https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIVersionComparator
(otherwise on AMO the new version is not accepted)

NEW, see https://blog.mozilla.org/addons/2015/12/18/signing-firefox-add-ons-with-jpm-sign/:
```
jpm sign --api-key ${AMO_API_KEY} --api-secret ${AMO_API_SECRET}
```

OLD:
```
jpm xpi
```

Run:

```
jpm run -b $(which firefox)
```

see also start.sdk.sh

### Windows (discouraged) ###
If you haven't already, install appropriate Node.js version from https://nodejs.org/download/.

***Install jpm***

In Node.js command prompt:
```
npm install jpm -g
```

***Install npm dependencies***
`npm install`

If gulp is required globally use `npm install gulp -g`.

***Linting your code***
Running `gulp` will watch all js files and repeats linting on change.
With `gulp lint` you can do a one time lint.

***Run various jpm commands.***

Execute \start_sdk.cmd for convenient fast access to the most common jpm commands allowing you
to execute unit tests, run with debug window and create a xpi file.


Misc notes
----------
Run unit tests with nightly Firefox:
Download from https://nightly.mozilla.org/ and extract
Run jpm with -b option (see above)

Run test webserver and run firefox with the addon to do integration tests.
We need node to create a webserver because we cannot test properly with local websites.
```
cd test/webserver # because the node server definition uses relative paths
node test-server.nodejs.js
# show something like:
# Server running at http://127.0.0.1:8125/




CODING STYLE
------------
We follow w3schools.com's style guide and coding conventions, see http://www.w3schools.com/js/js_conventions.asp.

Additionally all pages are coded in order to conform with strict mode, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode.


DOCUMENTATION
-------------
We use JSDoc for documentation, see http://code.google.com/p/jsdoc-toolkit/wiki/DocExamples


WEB SERVER
----------
Used to verify some features, nodejs is required. See readme in \test\README.md for more information.

Webserver can be started by executing: \test\webserver\start_test_server.cmd

- Q: Why don't we use local html files?
- A: Because they are treated differently (compared to remotely served files) by Firefox


IDE HINTS
---------
IntelliJ IDEA Community Edition 11
http://stackoverflow.com/questions/1147336/how-to-get-intellij-idea-to-display-directories

1) Start IntelliJ IDEA Community Edition 11.0
2) File --> Open Project... --> Select folder firefox_addon_local_filesystem_links
   (where this README.dev.txt resides)
opt: 3) Project settings --> Spelling --> Custom dict --> ...
