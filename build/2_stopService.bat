@echo off
set SCRIPTPATH=%~dp0
"%SCRIPTPATH%\node\nssm-2.24\win64\nssm.exe" stop am-browser-service
if %ERRORLEVEL% NEQ 0 goto errorInfo
goto end
:errorInfo
echo ####### ERROR: STOP SERVICE #########
echo Cannot stop am-browser-service, please check if this service has already been stopped
echo ##########################################################
echo.
:end
pause