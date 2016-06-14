@echo off
set SCRIPTPATH=%~dp0
"%SCRIPTPATH%\node\nssm-2.24\win64\nssm.exe" remove am-browser-service
if %ERRORLEVEL% NEQ 0 goto errorInfo
goto end
:errorInfo
echo ####### ERROR: UNREGISTER SERVICE #########
echo Cannot unrigister am-browser-service, please check if this service has already been unrigistered
echo ##########################################################
echo.
:end
pause