# Native app for Local-Filesystem links extension

The app is needed so Firefox can use native messaging to open a local filesystem link.

This readme is for development of the native app.

# Dev setup

Run `pip install virtualenv` if you haven't installed it yet.
Next run `virtualenv env` in `native-host` directory. This will create an `env` directory (untracked in repo).

Now you can run `source env/bin/activate` on MAC/Linux and `env\Scripts\activate.bat` on Windows. Your terminal should now have a (env) before each terminal line.

In `native-host` root folder run the following command to install the dependencies `pip install -r requirements.txt`. (Optional) To update every dependency run `pip install -r requirements-doc.txt && pip freeze > requirements.txt`

# Manual testing

Start the native app with `src\local-link-messaging-host.bat` or `python src\local-link-messaging-host.py`. Next past the following JSON into the waiting app `{"url": "file:///C:/tmp/existing_file%20-%20Kopie.txt", "reveal": false, "exeAllowed": false}` (maybe you need to modify the path to an existing file.)

If everything is working as expected this will open the file.

# Using the Python file during development from the extension

Change the path in `webextension_local_filesystem_links.json` to the python file. On windows change in the file with `_win`:

```json
{
    //...,
    "path": "local-link-messaging-host.exe"
    //...
}
```

To

```json
{
    //...,
    "path": "local-link-messaging-host.bat"
    //...
}
```

Uninstall any installed native-host app from your system, so it's not using the wrong version. Next run `native-host\src\install_host.bat` on Windows or `./native-host/src/install_host.sh` on MAC/Linux.

This will register the Python script in your system. You can use `uninstall.bat` or `uninstall.sh` to unregister it later.

Now run the extension with `npm run dev` and `npm start` in `test/webserver`. In the browser that will be opened go to `localhost:3000` and test a local link.

# Bundling of the Python script

## Windows

-   InnoSetup needs to be installed
-   Run `npm run build:win32` inside of the virtual env where you installed all python dependencies.
