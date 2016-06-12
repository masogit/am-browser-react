@echo off
set SCRIPTPATH=%~dp0
"%SCRIPTPATH%\node\nssm-2.24\win64\nssm.exe" stop am-browser-service
pause