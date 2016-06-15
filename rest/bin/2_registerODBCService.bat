@echo off
set ODBCCONF=C:/Windows/System32/odbcconf.exe
set ODBCCAD=C:/Windows/System32/odbcad32.exe
if "x%1x" == "xx" goto displayUsage
if "x%3x" == "xx" goto registerDefaultODBCService
set DSN=%1
%ODBCCONF% /A {CONFIGSYSDSN "SQL Server" "DSN=%DSN%|Description=%2|SERVER=%3|Trusted_Connection=no|Database=%4"}
if %ERRORLEVEL% NEQ 0 goto errorInfo
:registerDefaultODBCService
set DSN=AMBrowser
%ODBCCONF% /A {CONFIGSYSDSN "SQL Server" "DSN=%DSN%|Description=AMBrowser|SERVER=%1|Trusted_Connection=no|Database=%2"}
if %ERRORLEVEL% NEQ 0 goto errorInfo
echo ####### INFO: REGISTER ODBC SERVICE #########
echo register %DSN% ODBC Service succeed
echo ##########################################################
echo.
goto end
:errorInfo
echo ####### ERROR: INSTALL ODBC SERVICE #########
echo Cannot install ODBC Service automatically, please install it by yourself
echo ##########################################################
echo.
%ODBCCAD%
goto end
:displayUsage
echo ####### INFO: DISPLAY USAGE #########
echo Usage: 2_registerODBCService.bat [SERVER] [Database]
echo For Example: 2_registerODBCService.bat (local) AMDemo96en
echo Usage: 2_registerODBCService.bat [DSN] [Description] [SERVER] [Database]
echo For Example: 2_registerODBCService.bat AMBrowser AMBrowser (local) AMDemo96en
echo ##########################################################
echo.
goto end
:end
pause