@echo off
set SCRIPTPATH=%~dp0
call "%SCRIPTPATH%\..\deploy\deploy.bat" /x64 ..\websvc\package.properties
pause