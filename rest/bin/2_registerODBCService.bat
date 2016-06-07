@echo off
:registerODBCService
set ODBCCONF=C:/Windows/System32/odbcconf.exe
if "x%1x" == "xx" goto displayUsage
ODBCCONF /A {CONFIGSYSDSN "SQL Server" "DSN=%1|Description=%2|SERVER=%3|Trusted_Connection=no|Database=%4"}
echo register %1 ODBC Service succeed
goto end
:displayUsage
echo.
echo Usage: registerODBCService.bat [DSN] [Description] [SERVER] [Database]
echo Example: 2_registerODBCService.bat AMBrowser AMBrowser (local) AMDemo96en
goto end
:end
pause