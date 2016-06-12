@echo off
set SCRIPTPATH=%~dp0
set NSSM=%SCRIPTPATH%\node\nssm-2.24\win64\nssm.exe
%NSSM% install am-browser-service "%SCRIPTPATH%\startup.bat"
%NSSM% set am-browser-service DisplayName "HPE am-browser-service"
%NSSM% set am-browser-service Description "HPE AM Browser NodeJS Server - http://www.hpe.com/"
%NSSM% set am-browser-service AppStdout %SCRIPTPATH%\log\service_out.log
%NSSM% set am-browser-service AppStderr %SCRIPTPATH%\log\service_error.log
pause