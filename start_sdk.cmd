@echo off
echo HELP
echo ----
echo 1) Prepare          # cd %cd%
echo 2a) Run tests       # cfx test -p $p1
echo 2b) Run (debug)     # cfx run -p $p1
echo 2c) Create xpi file # cfx xpi
echo ----
cmd /K ..\addon-sdk-1.12\bin\activate.bat
pause
