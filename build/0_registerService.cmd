@echo off
set SCRIPTPATH=%~dp0
"%SCRIPTPATH%\nssm-2.24\win64\nssm.exe" install am-browser-service "%SCRIPTPATH%\startup.cmd"