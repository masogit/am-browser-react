@echo off
set SCRIPTPATH=%~dp0
call "%SCRIPTPATH%\..\deploy\generate-password.bat"
pause