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
echo ####### ERROR: INITIALIZE DEMO #########
echo Cannot initialize demo, please copy them mannually
echo ##########################################################
echo.
goto end
:main
if not exist "%SCRIPTPATH%\am-browser-config.properties" goto customInfo
call "%SCRIPTPATH%\set_basename.bat"
cd /d %SCRIPTPATH%
"%SCRIPTPATH%\node\nodejs\node.exe" "%SCRIPTPATH%\app\server.js"
goto end
:customInfo
echo ####### ERROR: CUSTOM CONFIG #########
echo Not found custom am-browser-config.properties, please generate it from am-browser-config.properties.default
echo ##########################################################
echo.
:end
pause