local-filesystem-links DEVELOPMENT
==================================

jsfiddle for some whitelist testing: http://jsfiddle.net/awolf2904/tefcs74q/

# Building for production
see README.build-from-source.md

# Extension testing in browser

## Install native app
Go to `native-host\src\` and run `install_host`. This will register the native app in your system.

## Starting dev script
Run `npm run dev` will start webpack to build the extension. It will also watch for changes to the source files and once `dist` folder is ready it starts Firefox with the extension. 

## Manually starting
Run `npm run build`, open Firefox and enter about:debugging in url bar and load `dist\manifest.json` Extension.

## With Web-ext CLI
Install [web-ext](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext) with `npm install --global web-ext`.

And run `web-ext run` in `dist` folder to start FF nightly with the Extension temporarily enabled.


# Usage
First run `npm install`.

## Start dev server
`npm run dev` starts the development build for FF and watches source directory for changes.

## Start firefox with webextension loaded
`npm start` to start web-ext start with dist folder. It will load the extension in Firefox.

Based on https://www.npmjs.com/package/web-ext

## Linting
`npm run lint` will lint your files with eslint. But it's recommended to use VS code prettier plugin, so your code is pretty after hitting save.

`npm run lint:webext` will lint the extension with web-ext linter.

# Testing
## Manual tests
The web server is available in `test/webserver` and it can be started with `npm start` in the mentioned directory. Then run `npm run dev` in project root and open `localhost:3000` to do manual tests.

We need node to create a webserver because we cannot test properly with local websites.

## Unit tests
-- Not available --
The old jpm unit tests are not working, so we have to convert them so we can run them with the web extension.

The following repo is going in the right direction https://github.com/Standard8/example-webextension and it's using Karma as test runner.


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
