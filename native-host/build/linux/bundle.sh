#!/bin/sh

# package everything into a tar archive
# (required python to be installed)
# 
# Todo: check how to create an installer that is installing Python dependency.
mkdir -p bin/linux

tar -cvf bin/linux/native-app-bundle-linux.tar \
    --transform 's,^src,local_filesystem_links_host_app,' \
    src/install_host.sh \
    src/uninstall_host.sh \
    src/local-link-messaging-host.py \
    src/webextension_local_filesystem_links.json