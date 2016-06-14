@echo off
set SCRIPTPATH=%~dp0
if not exist "%SCRIPTPATH%\..\websvc\package.properties" goto noCustomProp
call "%SCRIPTPATH%\..\deploy\deploy.bat" /x64 ..\websvc\package.properties
goto end
:noCustomProp
echo ####### ERROR: CUSTOM CONFIG #########
echo Please check your self-defined package.properties exist!
echo ##########################################################
echo.
:end
pause