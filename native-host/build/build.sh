#!/bin/bash
# Detects which OS and if it is Linux then it will detect which Linux
# Distribution.

OS=`uname -s`

# VERSION_INFO probably different for Linux
VERSION_INFO="# UTF-8
#
# For more details about fixed file info 'ffi' see:
# http://msdn.microsoft.com/en-us/library/ms646997.aspx
VSVersionInfo(
  ffi=FixedFileInfo("

if [[ "$OS" =~ ^MSYS.* ]]; then
    BIN_DIR="bin/win32";
elif [[ "$OS" =~ ^Linux.* ]]; then
    BIN_DIR="./bin/linux";
elif [[ "$OS" =~ ^Darwin.* ]]; then
    BIN_DIR="./bin/mac"
else
    BIN_DIR="./bin/$OS"
fi

# rmdir -rf BIN_DIR # already removed by npm
echo $BIN_DIR # debugging output

# Version key/value should be on his own line
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

echo $PACKAGE_VERSION # return 0.1.0 - debugging output

# create version file
# filevers=(2, 0, 4, 0),
# prodvers=(2, 0, 4, 0),
#IN="bla@some.com;john@home.com" # e.g. 3.2.1 --> [0] = 3, [1] = 2, [2] = 1
versionArr=${PACKAGE_VERSION//./ } #

{
  printf "$VERSION_INFO\n"
  printf "  filevers=(%s, %s, %s, 0),\n" "${versionArr[0]}" "${versionArr[1]}" "${versionArr[2]}"
  printf "  prodvers=(%s, %s, %s, 0),\n" "${versionArr[0]}" "${versionArr[1]}" "${versionArr[2]}"
  echo "))"
} >version.rc

# create folder (-p if it doesn't exist)
mkdir -p $BIN_DIR

# onefile not working (not correctly bundled)
# --> onedir better (faster start - no extracting to temp. location of python required)
pyinstaller ./src/local-link-messaging-host.py \
    --onedir \
    --distpath=$BIN_DIR \
    --icon ./src/addon_icon_48.ico \
    --workpath=dist \
    --version-file=version.rc
    # --log-level=DEBUG

# remove temporary directory
rm -rf dist
