@echo off
echo HELP
echo ----
echo 1) Prepare          # cd %cd%
echo 2a) Create xpi file # cfx xpi
echo 2b) Run (debug)     # cfx run -p $p1
echo ----
cmd /K ..\addon-sdk-1.5\bin\activate.bat
pause
