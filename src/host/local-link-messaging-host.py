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

# Helper function that sends a message to the webapp.
def send_message(message):
   # Write message size.
  sys.stdout.write(struct.pack('I', len(message)))
  # Write the message itself.
  sys.stdout.write(message)
  sys.stdout.flush()

# print 'test message'
# Helper for check if path or file exists
def checkPath(pathStr):
  # todo refactor file:// removal --> duplicated code
  pathStr = re.sub(r'file:[\/\\]{2,3}', '', pathStr) # remove file://

  pathStr = urllib.unquote(pathStr).decode('utf8')
  # send_message('{"text": "check: %s"}' % pathStr)
  return os.path.exists(pathStr)

def getFilePath(program, exeAllowed):
  filePath = re.sub(r'file:[\/\\]{2,3}', '', program) # remove file://

  filePath = urllib.unquote(filePath) # decode special characters
  filePath = os.path.normpath(filePath) # normalize slahses
  # send_message('{"text": "check: %s"}' % urllib.quote(filePath))
  # return filePath

  if is_exe(filePath) is True and exeAllowed is False:
    # print "executable" # just msi files are still executed - com, exe, bat files are blocked
    send_message('{"error": "ERROR_EXECTUBALES_NOT_ENABLED"}')
    return None
  else:
    return filePath
    #send_message('{"debug": "is no exe file: %s -- %s"}' % (urllib.quote(executable), urllib.quote(filePath)))
    # print "document"

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
    # send_message('{"message": "exe allowed: %s"}' % exeAllowed)

    if (checkPath(fileStr)):
      # send_message('{"openingFile": "%s"}' % fileStr )
      result = getFilePath(fileStr, exeAllowed)
      if (reveal):
        revealCommand = r'explorer /select,"%s"' % result
        subprocess.call(revealCommand)
        # test = result
        send_message('{"text": "select folder & select file %s"}' % urllib.quote(revealCommand))

        # send_message('{"error": %s }' % "null")
      else:
        # send_message('{"stat": "%s"}' % fileStr)
        # result = fileStr
        # if (result is not None):
        # os.startfile(result) # todo add try catch if file can't be opened
        # exeTest = is_exe(result)
        # send_message('{"debug": "is exe file?: %s"}' % exeTest)

        #if is_exe(result) && !exeAllowed:
        #    send_message('{"error": %s }' % 'EXE_ACCESS_DENIED')
        #else:
            # no exe or allowed
        if result is not None:
            subprocess.call(r'explorer %s' % result)
            send_message('{"error": %s }' % "null")
        else:
            send_message('{"error": %s }' % "EXE_ACCESS_DENIED")  # todo pass error from getFilePath
        # send_message('{"stat": "%s"}' %  urllib.quote(result))

        #send_message('{"debug": "exe allowed: %s"}' % exeAllowed)

        # else:
        #   send_message('{"error": %s }' % "ERROR_BAD_LINK")
        # else:
        #   if exeAllowed:
        #     os.startfile(fileStr) # todo add try catch if file can't be opened
        #   else:
        #     send_message('{"error": %s }' % "ERROR_EXECTUBALES_NOT_ENABLED")
    else:
      if (reveal):
        revealPath = os.path.dirname(fileStr)
        send_message('{"text": "opening folder %s"}' % urllib.quote(revealPath))
        subprocess.call(r'explorer "%s"' % revealPath)
        send_message('{"error": %s }' % "null")
      else:
        send_message('{"error": "%s", "url": "%s"}' % ("ERROR_BAD_LINK", fileStr))
    sys.exit(0)

def Main():
  read_thread_func(None)
  sys.exit(0)

if __name__ == '__main__':
  Main()
