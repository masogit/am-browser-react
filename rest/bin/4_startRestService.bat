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
sc start am-browser-rest-service
if %ERRORLEVEL% EQU 0 (
  echo ####### INFO: START REST SERVICE #########
  echo The service 'am-browser-rest-service' has been started
  echo ##########################################################
  echo.
) else (
  echo ####### INFO: START REST SERVICE #########
  echo Failed starting 'am-browser-rest-service' service
  echo ##########################################################
  echo.
)
:end
pause