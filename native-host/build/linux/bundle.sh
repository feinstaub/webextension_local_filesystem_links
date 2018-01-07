#!/bin/sh

# package everything into a tar archive
# (required python to be installed)
# 
# Todo: check how to create an installer that is installing Python dependency.
#mkdir -p bin/linux

(cd src; tar -cvf ../bin/linux/native-app-bundle-linux.tar \
    --transform 's,^src,local_filesystem_links_host_app,' \
    webextension_local_filesystem_links.json)

(cd build/linux; tar -rf ../../bin/linux/native-app-bundle-linux.tar \
    --transform 's,^src,local_filesystem_links_host_app,' \
    uninstall_host_compiled.sh \
    install_host_compiled.sh)

(cd bin/linux; tar -rf ../../bin/linux/native-app-bundle-linux.tar local-link-messaging-host/. --transform 's,^src,local_filesystem_links_host_app,')