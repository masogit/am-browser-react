@echo off
set SCRIPTPATH=%~dp0
"%SCRIPTPATH%\node\nssm-2.24\win64\nssm.exe" start am-browser-service
if %ERRORLEVEL% NEQ 0 goto errorInfo
goto end
:errorInfo
echo ####### ERROR: START SERVICE #########
echo Cannot start am-browser-service, please check if this service has already been started
echo ##########################################################
echo.
:end
pause