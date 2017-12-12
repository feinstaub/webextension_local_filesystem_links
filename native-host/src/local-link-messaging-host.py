#!/usr/bin/env python
# Copyright (c) 2012 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

# A simple native messaging host. Shows a Tkinter dialog with incoming messages
# that also allows to send message back to the webapp.

import struct
import sys
# import threading
# import Queue
import json
import urllib
import subprocess
import os
import re

currentOS = sys.platform

fileExplorers = {
  "win32": {
    "open": r'explorer',
    "reveal": {
      "cmd": r'explorer',
      "arg": r'/select,"%s"'
    }
  },
  "linux": {
    "open": r'xdg-open',
    "reveal": {
      "cmd": r'nautilus', # not perfect to use directly nautilus but xdg-open is not supporting select option
      "arg": r'--select "%s"'
    }
  }
}

fileExplorer = fileExplorers['linux'] # default to linux

# def my_handler(type, value, tb):
#     send_message("Uncaught exception: {0}".format(str(value)))

# Install exception handler
# sys.excepthook = my_handler

# On Windows, the default I/O mode is O_TEXT. Set this to O_BINARY
# to avoid unwanted modifications of the input/output streams.
if currentOS == "win32":
  # import win32api # if active state python is installed or install pywin32 package seperately
  import os, msvcrt
  import sys
  import pywintypes
  import win32api

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
      # send_message('{"debug": "is neither"}')
      return False
    else:
      return executable == fpath.lower()
else:
  # Helper for checking if file is exec. returns file if executable (for unix)
  def is_exe(fpath):
    return os.path.exists(fpath) and os.access(fpath, os.X_OK) and os.path.isfile(fpath)

  if sys.platform.startswith('linux'):
    fileExplorer = fileExplorers['linux']


# Helper function that sends a message to the webapp.
def send_message(message):
   # Write message size.
  sys.stdout.write(struct.pack('I', len(message)))
  # Write the message itself.
  sys.stdout.write(message)
  sys.stdout.flush()

def preparePath(pathStr):
  # pathStr = re.sub(r'file:[\/\\]{2,3}', '', pathStr) # remove file://  -- org
  if currentOS == "win32":
    pathStr = re.sub(r'file:[\/\\]{2,3}', '', pathStr) # remove file:// (also any leading / needs to be removed in windows)
  else:
    pathStr = re.sub(r'file:[\/\\]{2}', '', pathStr) # remove file://

  pathStr = urllib.unquote(pathStr).decode('utf8')
  if sys.platform.startswith('linux'):
    # hack to have ~ path working in Linux
    # one or two slashes before ~ // stop at first / after ~
    # unixPath = unixPath.replace(/(\/){1,2}~\//, '~/');  # code from previous addon
    pathStr = re.sub(r'[/]{1,2}~/', '~/', pathStr)
    pathStr = os.path.expanduser(pathStr) # expand ~ to home/username
    # send_message('{"text": "check: %s"}' % pathStr)

  pathStr = os.path.normpath(pathStr) # normalize slashes
  # send_message('{"debug": "%s"}' % urllib.quote(pathStr))
  return pathStr

# Helper for check if path or file exists
def checkPath(pathStr):
  pathStr = preparePath(pathStr)

  # send_message('{"debug": "%s"}' % os.path.exists(pathStr))
  return os.path.exists(pathStr)

def getFilePath(program, exeAllowed):
  filePath = preparePath(program)

  if is_exe(filePath) is True and exeAllowed is False:
    # print "executable" # just msi files are still executed - com, exe, bat files are blocked
    send_message('{"error": "ERROR_EXECTUBALES_NOT_ENABLED"}')
    return None
  else:
    return filePath
    #send_message('{"debug": "is no exe file: %s -- %s"}' % (urllib.quote(executable), urllib.quote(filePath)))
    # print "document"

def createResponse():
  # process returns None if it's still active
  # if (process.returncode is not None):
  #   send_message('{"error": "%s" }' % process.returncode)
  # else:
  send_message('{"error": %s}' % "null")

# Thread that reads messages from the webapp.
def read_thread_func(queue):
  message_number = 0
  while 1:
    # Read the message length (first 4 bytes).
    text_length_bytes = sys.stdin.read(4)

    if len(text_length_bytes) == 0:
      # if queue:
      #   queue.put(None)
      sys.exit(0)

    # Unpack message length as 4 byte integer.
    text_length = struct.unpack('i', text_length_bytes)[0]

    # Read the text (JSON object) of the message.
    text = sys.stdin.read(text_length).decode('utf-8')

    data = json.loads(text)
    # self.log('starting %s' % filename['text'])
    fileStr = data['url']
    reveal = data['reveal']
    # send_message('{"revealing?": "%s"}' % reveal)

    exeAllowed = data['exeAllowed']

    # send_message('{"debug": "%s"}' % fileExplorer['open'])

    if (checkPath(fileStr)):
      # send_message(r'{"openingFile": "%s"}' % fileStr)
      result = getFilePath(fileStr, exeAllowed)
      if (reveal):
        # process = subprocess.call(fileExplorer['reveal']['cmd'] + ' ' + fileExplorer['reveal']['arg'] % result) # working in windows
        subprocess.call([fileExplorer['reveal']['cmd'], fileExplorer['reveal']['arg'] % result])
        # send_message('{"text": "select folder & select file %s"}' % urllib.quote(revealCommand))
        # createResponse(process)
      else:
        if result is not None:
            # os.startfile(result)
            # fileToOpen = b'%s' % fileExplorer['open'] +
            # process = subprocess.call(u"{0} \"{1}\"".format(fileExplorer['open'], result)) # working in windows

            process = subprocess.call([fileExplorer['open'], result])
            
            # send_message(u"{\"debug\": \"%s\" }" % urllib.quote(u"{0} \"{1}\"".format(fileExplorer['open'], result)))
            # createResponse(process)
        else:
            send_message('{"error": %s }' % "EXE_ACCESS_DENIED")  # todo pass error from getFilePath
    else:
      if (reveal):
        revealPath = os.path.dirname(fileStr)
        # send_message('{"text": "opening folder %s"}' % urllib.quote(revealPath))
        subprocess.call([fileExplorer['open'], revealPath])
        # subprocess.call(fileExplorer['open'] % revealPath)
        # send_message('{"error": "debug %s" }' % revealPath)
        # send_message('{"error": %s }' % "null")
      else:
        # send_message('{"debug": "fileExplorer %s"}' % getFilePath(fileStr, exeAllowed))
        send_message('{"error": "%s", "url": "%s"}' % ("ERROR_BAD_LINK", fileStr))

    createResponse() # default response
    sys.exit(0)

def Main():
  read_thread_func(None)
  sys.exit(0)

if __name__ == '__main__':
  Main()
