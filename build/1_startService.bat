@echo off
set SCRIPTPATH=%~dp0
:check_Permissions
echo ####### INFO: CHECK PERMISSIONS #########
net session >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo CHECK PERMISSIONS: Administrative permissions confirmed
  echo ##########################################################
  echo.
) else (
  echo CHECK PERMISSIONS: Current permissions inadequate, please run it as administrator
  echo ##########################################################
  echo.
  goto end
)
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