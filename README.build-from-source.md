Build from source: webextension_local_filesystem_links
======================================================

1. Extract source code archive

2. Install dependencies:

    $ npm install
    ...
    added 1208 packages in 25.165s

3. Generate the production version of the extension in dist folder.
    Creates extension from src folder, converts host script to executable and create installer with InnoSetup
    (working under windows)

    $ npm run build
    ...
    DONE  Compiled successfully in 4841ms

4. Generate the bundle in web-ext-artifacts folder / create the final package

    $ npm run bundle
    ...
    Your web extension is ready: /home/gregor/dev/src/firefox_addon/sourcecode-archive/web-ext-artifacts/local_filesystem_links-0.99.60.zip

5. Manually upload of the zip file here: https://addons.mozilla.org/en-US/developers/addon/local-filesystem-links/versions
    - Upload Version -> Select a file...
    - Troubleshooting:
        - red message: "Version 0.99.58 was uploaded before and deleted". No hint what to do next.
        - solution: upload new version 0.99.59 (npm run build, npm run bundle, upload the file)
    - Follow the instructions and provide source code
        - $ ./make-sourcecode-archive.sh

Older stuff
-----------
* One-time: Install [web-ext](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext) with `npm install web-ext`.
* Find API key hiere: See Tools > Manage API Keys (https://addons.mozilla.org/en-US/developers/addon/api/key/)

    $ ./node_modules/web-ext/bin/web-ext sign --api-key=userkey --api-secret=... -s dist
