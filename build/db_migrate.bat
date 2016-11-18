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
"%SCRIPTPATH%\node\nodejs\node.exe" app/db migrate
if %ERRORLEVEL% NEQ 0 goto errorInfo
goto end
:errorInfo
echo ####### ERROR: MIGRATE FILE DB TO MONGODB #########
echo Migrate file db to mongodb failed!!!
echo ##########################################################
echo.
:end
pause