@echo off
echo HELP
echo ----
echo 1) Prepare          # cd %cd%
echo 2a) Run tests       # cfx test -p ..\TESTPROFILE
echo 2b) Run (debug)     # cfx run -p ..\TESTPROFILE
echo 2c) Create xpi file # cfx xpi
echo ----
cmd /K ..\addon-sdk-1.14\bin\activate.bat
pause
