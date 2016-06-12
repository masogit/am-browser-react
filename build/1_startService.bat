@echo off
set SCRIPTPATH=%~dp0
"%SCRIPTPATH%\node\nssm-2.24\win64\nssm.exe" start am-browser-service
pause