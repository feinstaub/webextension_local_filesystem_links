#!/bin/sh

# package everything into a tar archive
# (Python included with PyInstaller 
#
# MacOS info: 
# $ brew install gnu-tar
# --> needed for tar with-out changing transform

if [ "$(uname -s)" = "Darwin" ]; then
    BIN_DIR='bin/mac'
    BUNDLE_NAME='mac'
    TAR='gtar' 
else
    BIN_DIR='bin/linux'
    BUNDLE_NAME='linux'
    TAR='tar'
fi

echo $BIN_DIR
(cd src; $TAR -cvf "../$BIN_DIR/native-app-bundle-$BUNDLE_NAME.tar" \
    --transform 's,^src,local_filesystem_links_host_app,' \
    webextension_local_filesystem_links.json)

(cd build/unix; $TAR -rf "../../$BIN_DIR/native-app-bundle-$BUNDLE_NAME.tar" \
    --transform 's,^src,local_filesystem_links_host_app,' \
    uninstall_host_compiled.sh \
    install_host_compiled.sh)

(cd $BIN_DIR; $TAR -rf "../../$BIN_DIR/native-app-bundle-$BUNDLE_NAME.tar" local-link-messaging-host/. --transform 's,^src,local_filesystem_links_host_app,')