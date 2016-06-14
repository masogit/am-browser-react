@echo off
set SCRIPTPATH=%~dp0
:db
if exist "%SCRIPTPATH%\db" goto ssl
mkdir db
copy "%SCRIPTPATH%\demo\db\*" "%SCRIPTPATH%\db"
if %ERRORLEVEL% NEQ 0 goto errorInfo
:ssl
if exist "%SCRIPTPATH%\ssl" goto main
mkdir ssl
copy "%SCRIPTPATH%\demo\ssl\*" "%SCRIPTPATH%\ssl"
if %ERRORLEVEL% NEQ 0 goto errorInfo
goto main
:errorInfo
echo Cannot initialize demo db, please copy them mannually
goto end
:main
"%SCRIPTPATH%\node\nodejs\node.exe" "%SCRIPTPATH%\app\server.js"
goto end
:end
pause