@echo off
set SCRIPTPATH=%~dp0
"%SCRIPTPATH%\nssm-2.24\win64\nssm.exe" install am-browser-service "%SCRIPTPATH%\startup.cmd"
"%SCRIPTPATH%\nssm-2.24\win64\nssm.exe" set am-browser-service DisplayName "HPE am-browser-service"
"%SCRIPTPATH%\nssm-2.24\win64\nssm.exe" set am-browser-service Description "HPE AM Browser NodeJS Server - http://www.hpe.com/"