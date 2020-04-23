@echo off
:: Copyright (c) 2013 The Chromium Authors. All rights reserved.
:: Use of this source code is governed by a BSD-style license that can be
:: found in the LICENSE file.

IF EXIST "..\env\Scripts" (
    :: Use env
    ..\env\Scripts\activate.bat
    ..\env\Scripts\python "%~dp0/local-link-messaging-host.py" %*
    ..\env\Scripts\deactivate.bat
) ELSE (
    python "%~dp0/local-link-messaging-host.py" %*
)
