#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Copyright (c) 2012 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

# A native messaging host.

import json
import os
import re
import struct
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from subprocess import PIPE
from urllib.parse import unquote

from future import standard_library

standard_library.install_aliases()

currentOS = sys.platform

PY3K = sys.version_info >= (3, 0)

if PY3K:
    source = sys.stdin.buffer
    output = sys.stdout.buffer
    from pathlib import Path
else:
    from pathlib2 import Path
    # Python 2 on Windows opens sys.stdin in text mode, and
    # binary data that read from it becomes corrupted on \r\n
    # --> mode already set below
    #
    # if sys.platform == "win32":
    #     # set sys.stdin to binary mode
    #     import os, msvcrt
    #     msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
    source = sys.stdin
    output = sys.stdout

fileExplorers = {
    "win32": {
        "open": r'cmd /c',
        "reveal": {
            "cmd": r'cmd /c explorer',
            "arg": r'/select,'
        }
    },
    "linux": [{
        # Ubunutu
        "open": r'xdg-open',
        "reveal": {
            # not perfect to use directly nautilus but xdg-open is not supporting select option
            "cmd": r'nautilus',
            "arg": r'--select '
        }
    },
        {
        # Open SUSE
        "open": r'xdg-open',
        "reveal": {
            "cmd": r'dolphin',
            "arg": r'--select '
        }
    }],
    "mac": {
        "open": r'open',
        "reveal": {
            "cmd": r'open',
            "arg": r'--reveal '
        }
    }
}

fileExplorer = fileExplorers['linux'][1]  # default to linux

# On Windows, the default I/O mode is O_TEXT. Set this to O_BINARY
# to avoid unwanted modifications of the input/output streams.
if currentOS == "win32":
    # import win32api # if active state python is installed or install pywin32 package seperately
    import os
    import msvcrt
    import sys
    # from get_binary_type import GetBinaryType
    import pywintypes
    import win32api
    # from subprocess_fix import Popen # was needed in Py2 to support unicode
    from subprocess import Popen

    msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
    msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)

    fileExplorer = fileExplorers['win32']

    def is_exe(fpath):
        # just msi files are still executed - com, exe, bat files are blocked
        # send_message('{"debug": "hello"}')
        # helpful resource http://timgolden.me.uk/python/win32_how_do_i/tell-if-a-file-is-executable.html
        try:
            # print "Looking at", filePath
            r, executable = win32api.FindExecutable(fpath)
            executable = win32api.GetLongPathName(executable).lower()
        except pywintypes.error:
            #   print "Neither executable nor document" # e.g. just a path
            return False
        else:
            return executable == fpath.lower()
else:
    from subprocess import Popen

    # helper to check if cmd exists (e.g. Nautilus or Dolphin)
    def cmd_exists(cmd):
        return subprocess.call("type " + cmd, shell=True,
                               stdout=subprocess.PIPE, stderr=subprocess.PIPE) == 0

    # Helper for checking if file is exec. returns file if executable (for unix)
    def is_exe(fpath):
        return os.path.exists(fpath) and os.access(fpath, os.X_OK) and os.path.isfile(fpath)

    if sys.platform.startswith('linux'):
        fileExplorer = fileExplorers['linux']

        if cmd_exists(fileExplorer[0]['reveal']['cmd']):
            fileExplorer = fileExplorer[0]
        elif cmd_exists(fileExplorer[1]['reveal']['cmd']):
            fileExplorer = fileExplorer[1]
        else:
            # no match fallback to default -- just reveal not working
            fileExplorer = fileExplorer[0]
    elif sys.platform == 'darwin':
        fileExplorer = fileExplorers['mac']
        # send_message(u'{"debug os": "%s"}' % sys.platform) #urllib.quote(pathStr.encode('utf-8')))


# Helper function that sends a message to the webapp.
def send_message(jsonObj):
    message = json.dumps(jsonObj)
   # Write message size.
    output.write(struct.pack('I', len(message)))
    # Write the message itself.
    output.write(message.encode('utf-8'))
    output.flush()

# Read a message from stdin and decode it.


def get_message():
    raw_length = source.read(4)
    if not raw_length:
        sys.exit(0)
    message_length = struct.unpack('=I', raw_length)[0]
    message = source.read(message_length)
    return json.loads(message)


def preparePath(pathStr):
    # replace backslashes to slashes
    pathStr = re.sub(r'\\', r'/', pathStr)
    # send_message('{"debug prepare": "%s"}' % pathStr.encode('utf-8'))

    if currentOS == "win32":
        # add feature to allow 4 slashes too for UNC network addresses
        regex = r'\bfile:(\/\/){2}\b'

        # 4 slashes? add another one to have 5 slashes
        if re.match(regex, pathStr):
            pathStr = re.sub("({})".format(regex), r'\1/', pathStr)

        # pathStr = re.sub(r'file:[\/]{2,3}', '', pathStr) # remove file:// (also any leading / needs to be removed in windows)
        # remove file:// (also any leading / needs to be removed in windows)
        pathStr = re.sub(r'[a-z]*:[\/]{2,3}', '', pathStr)
    else:
        pathStr = re.sub(r'[a-z]*:[\/]{2}', '', pathStr)  # remove file://

    # pathStr = urllib.unquote(pathStr).decode('utf8')   # why was this here?
    if sys.platform.startswith('linux') or sys.platform == 'darwin':
        # hack to have ~ path working in Linux & mac os
        # one or two slashes before ~ // stop at first / after ~
        # unixPath = unixPath.replace(/(\/){1,2}~\//, '~/');  # code from previous addon
        pathStr = re.sub(r'[/]{1,2}~/', '~/', pathStr)
        pathStr = os.path.expanduser(pathStr)  # expand ~ to home/username

    pathStr = os.path.normpath(pathStr)  # normalize slashes ----- not working?
    return pathStr

# Helper for check if path or file exists


def checkPath(pathStr):
    pathStr = preparePath(pathStr)
    if currentOS == 'win32' and os.path.exists(pathStr) is False:
        # and url.startswith('//') would be good to test but it wasn't working --> re-check later
        # windows and two slashes --> UNC link detected (special check required because os.path.exists fails on //servername/)
        p = Popen(["net", "view", pathStr], shell=True,
                  stdin=PIPE, stdout=PIPE, stderr=PIPE)
        out, err = p.communicate()

        validUNC = False if err else True
    else:
        validUNC = False

    return os.path.exists(pathStr) or validUNC


def getFilePath(program, exeAllowed):
    filePath = preparePath(program)

    if is_exe(filePath) is True and exeAllowed is False:
        send_message('{"error": "ERROR_EXECTUBALES_NOT_ENABLED"}')
        return None
    else:
        return filePath


def createResponse():
    send_message({"error": None})


def openFile(command):
    # command = u"explorer c:\\tmp\\áéíóú.txt"
    # send_message(r'{"debug openfile": "%s"}' % urllib.quote(command.encode('utf-8')))
    p = Popen(command, shell=True,
              stdin=PIPE, stdout=PIPE, stderr=PIPE)
    # Todo: Improve error handling!
    out, err = p.communicate()

# Thread that reads messages from the webapp.


def read_thread_func(queue):
    while 1:
        # if os.getenv('VIRTUAL_ENV'):
        #     send_message({"debug": "in_virtual_env"})
        # else:
        #     send_message({"debug": "not_in_virtual_env"})

        # send_message({"debug": "test"})
        # sys.exit()

        try:
            # shouldn't happen in app but we're catching invalid json and exit
            data = get_message()
        except ValueError:
            sys.exit()  # invalid json

        fileStr = unquote(data['url'])
        reveal = data['reveal']
        exeAllowed = data['exeAllowed']

        if (checkPath(fileStr)):
            result = getFilePath(fileStr, exeAllowed)
            if (reveal):
                openFile(fileExplorer['reveal']['cmd'] + ' ' +
                         fileExplorer['reveal']['arg'] + '"{}"'.format(result))
            else:
                if result is not None:
                    openFile(u'{} "{}"'.format(fileExplorer['open'], result))
                else:
                    # todo pass error from getFilePath
                    send_message({"error": "EXE_ACCESS_DENIED"})
        else:
            # send_message(u"{\"debug not found\": \"%s\"}" %
            #  urllib.quote(fileStr.encode('utf-8')))
            if (reveal):
                result = getFilePath(fileStr, exeAllowed)
                revealPath = os.path.dirname(result)
                openFile(fileExplorer['reveal']['cmd'] + ' ' +
                         fileExplorer['reveal']['arg'] + '"{}"'.format(revealPath))
            else:
                send_message({"error": "ERROR_BAD_LINK",
                              "url": '{}'.format(fileStr)})

        createResponse()  # default response
        sys.exit(0)


def Main():
    read_thread_func(None)
    sys.exit(0)


if __name__ == '__main__':
    Main()
