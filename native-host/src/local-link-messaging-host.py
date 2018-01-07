#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Copyright (c) 2012 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

# A native messaging host.

import struct
import sys
import json
import urllib
import subprocess
from subprocess import PIPE
import os
import re
from pathlib2 import Path

currentOS = sys.platform

fileExplorers = {
  "win32": {
    "open": r'explorer',
    "reveal": {
      "cmd": r'explorer',
      "arg": r'/select,'
    }
  },
  "linux": [{
    # Ubunutu
    "open": r'xdg-open',
    "reveal": {
      "cmd": r'nautilus', # not perfect to use directly nautilus but xdg-open is not supporting select option
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
  }]
}

fileExplorer = fileExplorers['linux'][1] # default to linux

# On Windows, the default I/O mode is O_TEXT. Set this to O_BINARY
# to avoid unwanted modifications of the input/output streams.
if currentOS == "win32":
  # import win32api # if active state python is installed or install pywin32 package seperately
  import os, msvcrt
  import sys
  # from get_binary_type import GetBinaryType
  import pywintypes
  import win32api
  from subprocess_fix import Popen

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


# Helper function that sends a message to the webapp.
def send_message(message):
   # Write message size.
  sys.stdout.write(struct.pack('I', len(message)))
  # Write the message itself.
  sys.stdout.write(message)
  sys.stdout.flush()

def preparePath(pathStr):
  # replace backslashes to slashes
  pathStr = re.sub(r'\\', r'/', pathStr)
  # send_message('{"debug prepare": "%s"}' % pathStr.encode('utf-8'))

  if currentOS == "win32":
    # pathStr = re.sub(r'file:[\/]{2,3}', '', pathStr) # remove file:// (also any leading / needs to be removed in windows)
    pathStr = re.sub(r'[a-z]*:[\/]{2,3}', '', pathStr) # remove file:// (also any leading / needs to be removed in windows)
  else:
    pathStr = re.sub(r'[a-z]*:[\/]{2}', '', pathStr) # remove file://

  # pathStr = urllib.unquote(pathStr).decode('utf8')   # why was this here?
  if sys.platform.startswith('linux'):
    # hack to have ~ path working in Linux
    # one or two slashes before ~ // stop at first / after ~
    # unixPath = unixPath.replace(/(\/){1,2}~\//, '~/');  # code from previous addon
    pathStr = re.sub(r'[/]{1,2}~/', '~/', pathStr)
    pathStr = os.path.expanduser(pathStr) # expand ~ to home/username

  pathStr = os.path.normpath(pathStr) # normalize slashes ----- not working?
  return pathStr

# Helper for check if path or file exists
def checkPath(pathStr):
  pathStr = preparePath(pathStr)
  path_to_open = Path(pathStr)
  #send_message(u'{"debug": "%s"}' % urllib.quote(pathStr.encode('utf-8')))
  return os.path.exists(pathStr)

def getFilePath(program, exeAllowed):
  filePath = preparePath(program)

  if is_exe(filePath) is True and exeAllowed is False:
    send_message('{"error": "ERROR_EXECTUBALES_NOT_ENABLED"}')
    return None
  else:
    return filePath

def createResponse():
  send_message('{"error": %s}' % "null")

def openFile(command):
    # command = u"explorer c:\\tmp\\áéíóú.txt"
    # send_message(r'{"debug": "%s"}' % urllib.quote(command.encode('utf-8')))
    p = Popen(command, shell=True,
    stdin=PIPE, stdout=PIPE, stderr=PIPE)
    out, err = p.communicate()

# Thread that reads messages from the webapp.
def read_thread_func(queue):
  message_number = 0
  while 1:
    # Read the message length (first 4 bytes).
    text_length_bytes = sys.stdin.read(4)

    if len(text_length_bytes) == 0:
      sys.exit(0)

    # Unpack message length as 4 byte integer.
    text_length = struct.unpack("i", text_length_bytes)[0]

    # Read the text (JSON object) of the message.
    text = sys.stdin.read(text_length).decode('utf-8')

    data = json.loads(text)

    fileStr = data['url']
    reveal = data['reveal']

    exeAllowed = data['exeAllowed']
    # send_message(u"{\"debug\": \"%s\"}" % urllib.quote(fileExplorer.encode('utf-8')))
    if (checkPath(fileStr)):
      result = getFilePath(fileStr, exeAllowed)
      if (reveal):
        openFile(fileExplorer['reveal']['cmd'] + ' ' + fileExplorer['reveal']['arg'] + "\"%s\"" % result)
      else:
        if result is not None:
            openFile(u"%s \"%s\"" % (fileExplorer['open'], result))
        else:
            send_message('{"error": %s }' % "EXE_ACCESS_DENIED")  # todo pass error from getFilePath
    else:
      if (reveal):
        result = getFilePath(fileStr, exeAllowed)
        revealPath = os.path.dirname(result)
        openFile(fileExplorer['open'] + " \"%s\"" % revealPath)
      else:
        send_message('{"error": "%s", "url": "%s"}' % ("ERROR_BAD_LINK", fileStr))

    createResponse() # default response
    sys.exit(0)

def Main():
  read_thread_func(None)
  sys.exit(0)

if __name__ == '__main__':
  Main()
