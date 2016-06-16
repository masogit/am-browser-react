@echo off
set SCRIPTPATH=%~dp0
set NSSM=%SCRIPTPATH%\node\nssm-2.24\win64\nssm.exe
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
%NSSM% install am-browser-service "%SCRIPTPATH%\startup.bat"
if %ERRORLEVEL% NEQ 0 goto errorInfo
"%NSSM%" set am-browser-service DisplayName "HPE am-browser-service"
"%NSSM%" set am-browser-service Description "HPE AM Browser NodeJS Server - http://www.hpe.com/"
if not exist "%SCRIPTPATH%\log" (
  mkdir %SCRIPTPATH%\log
)
"%NSSM%" set am-browser-service AppStdout %SCRIPTPATH%\log\service_out.log
"%NSSM%" set am-browser-service AppStderr %SCRIPTPATH%\log\service_error.log
goto end
:errorInfo
echo ####### ERROR: REGISTER SERVICE #########
echo Cannot install am-browser-service, please check if this service has already been installed
echo ##########################################################
echo.
:end
pause