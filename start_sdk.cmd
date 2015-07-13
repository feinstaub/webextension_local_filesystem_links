@echo off
setlocal EnableExtensions

title alien-local-filesystem-links

:: Menu Options
set "Alt[1]=One"
set "Alt[2]=Two"
set "Alt[3]=Three"
set "Alt[4]=Four"

:: Display the Menu
set "Message="
:Menu
cls
echo.%Message%
echo.
echo.  	Choose a jpm command
echo.
echo.	1. Execute tests
echo.	2. Execute run with debug window
echo.	3. Create XPI file
echo.	4. Exit
set "x=0"
:MenuLoop
set /a "x+=1"
if defined App[%x%] (
    call echo   %x%. %%App[%x%]%%
    goto MenuLoop
)
echo.

:: Prompt User for Choice
:Prompt
set "Input="
set /p "Input=Select an alternative:"

:: Validate Input [Remove Special Characters]
if not defined Input goto Prompt
set "Input=%Input:"=%"
set "Input=%Input:^=%"
set "Input=%Input:<=%"
set "Input=%Input:>=%"
set "Input=%Input:&=%"
set "Input=%Input:|=%"
set "Input=%Input:(=%"
set "Input=%Input:)=%"
:: Equals are not allowed in variable names
set "Input=%Input:^==%"
call :Validate %Input%

:: Process Input
call :Process %Input%
goto End


:Validate
set "Next=%2"
if not defined Alt[%1] (
    set "Message=Invalid Input: %1"
    goto Menu
)
if defined Next shift & goto Validate
goto :eof


:Process
set "Next=%2"
call set "Alt=%%Alt[%1]%%"

:: Run Installations
:: Specify all of the installations for each Alt.
:: Step 2. Match on the Altlication names and perform the installation for each
if "%Alt%" EQU "One" ( 
	echo Executing test
	start cmd /K jpm -p ./_pt test
)
if "%Alt%" EQU "Two" ( 
	echo Executing run with debug console
	start cmd /K jpm -p ./_pt run --debug
)
if "%Alt%" EQU "Three" (
	echo Creating XPI
	start cmd /K jpm -p ./_pt xpi
)
if "%Alt%" NEQ "Four" (
	goto Prompt
)
if "%Alt%" EQU "Four" (
	echo Exiting
	goto End
)
::if "%Alt%" EQU "All Alts" (
::    echo Run Install for All Alts here
::)

:: Prevent the command from being processed twice if listed twice.
set "Alt[%1]="
if defined Next shift & goto Process
goto :eof


:End
endlocal
