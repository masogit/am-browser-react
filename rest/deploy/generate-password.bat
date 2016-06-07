@echo off
rem ----------------------------------------------------------------------
rem script for generating password files used for encryption/decryption 
rem 
rem Prerequisites: Java JDK 1.6.x or higher, with the following
rem                environment variable set:
rem
rem   JAVA_HOME  Must point to your Java Development Kit installation.
rem -----------------------------------------------------------------------

setlocal

rem turn on command extensions if necessary
if not CMDEXTVERSION 2 setlocal ENABLEEXTENSIONS

rem Turn on delayed expansion features by recalling this script if necessary
set _TEST_DELAYED_EXPANSION=off
if "%_TEST_DELAYED_EXPANSION%"=="off" (
  set _TEST_DELAYED_EXPANSION=on
  if "!_TEST_DELAYED_EXPANSION!"=="on" (
    goto scriptStart
  )
)
cmd /e:on /v:on /s /c %0 %*
goto abort

:scriptStart
echo.

rem record the information we need regarding script name
set _SCRIPT_NAME=%~n0
set _SCRIPT_PATH=%~sdp0

rem %* may start with a switch so we cannot use it in the ant command line below so
rem we reconstruct the parameters passed into this script
shift
set _CMDLINE_OPTS=

rem use the short form of the directory (~s) so that values do not contain spaces
pushd %_SCRIPT_PATH%\..
set _AM_DIR=%CD%
popd
set _JAVAFORMAT_AM_DIR=%_AM_DIR:\=/%
set _JAVAFORMAT_SCRIPT_PATH=%_SCRIPT_PATH:\=/%

set _DIR_FLAG=-DAssetManager.InstallPath=%_JAVAFORMAT_AM_DIR%
set _DEPLOY_ANT_SCRIPT=%_SCRIPT_PATH%deploy.xml
rem try to locate the Asset Manager installation directory
if exist "%_AM_DIR%\x64\aamapi*.dll" (
  set _AM_ANT_DIR=!_SCRIPT_PATH!\ant
  set _DEPLOY_OPTS=-DPRI.ant.tasks.dir=!_JAVAFORMAT_SCRIPT_PATH!lib -Daddl.files.root=!_JAVAFORMAT_AM_DIR:\=/!
) else (
  set _AM_ANT_DIR=
  set _DEPLOY_OPTS=
  if not ""%_DONT_WARN%""==""true"" (
    echo.WARNING! The script you are using is not located in the Asset Manager
    echo.installation directory. This may or may not function for you.
    echo.
    echo.NB: Running this script in this manner is NOT supported!
    echo.
    echo.Before continuing you should ensure that the deploy.xml file is in
    echo.the same directory as this script  ^(%_SCRIPT_PATH%^)
    echo.and that you have ant version 1.7 or higher properly installed. 
    echo.
    echo.To avoid this message in the future, use the /nowarn switch before any
    echo.other command line option.
    echo.
    echo.To cancel execution of this script press:    [Ctrl]+[C], [Y], [Enter]
    echo.Press any other key to continue with this script...
    pause > null
    echo.
  )
)

:checkJava
if not exist "%JAVA_HOME%\bin\java.exe" goto noJavaHome

:checkAnt
if exist "%_AM_ANT_DIR%\bin\ant" (
  set ANT_HOME=!_AM_ANT_DIR!
) else (
  if not exist "%ANT_HOME%\bin\ant" goto noAntHome
)

:deployIt
set path=%JAVA_HOME%\bin;%JAVA_HOME%\jre\bin;%ANT_HOME%\bin;%PATH%
rem setting ant properties of the same name via command line set the LAST value specified!!
rem any parameters passed in to this script MUST have priority over those calculated in this
rem script, so they are the LAST item specified on the ant command line, other than the ant
rem target
if ""%_DEBUG%""==""true"" (
  SET _ANT_PARAMS=-debug
) else (
  SET _ANT_PARAMS=-quiet
)
set _CMD_LINE=ant -buildfile %_DEPLOY_ANT_SCRIPT% -emacs -noclasspath %_ANT_PARAMS% -Dtmp="%TEMP:\=/%" -DLibrary.Extension=dll %_DEPLOY_OPTS% %_DIR_FLAG% %_CMDLINE_OPTS% generate.password.files
if ""%_DEBUG%""==""true"" (
  echo.Executing the following command:
  echo.%_CMD_LINE%
)
%_CMD_LINE%

goto end



rem =========== messaging =================================================

:noJavaHome
echo.The JAVA_HOME environment variable is not defined correctly.
echo.Java JDK 1.6+ and this environment variable are needed to
echo.run this script.
goto end

:noAntHome
echo.The location of ant could not be determined.
echo.
echo.The ANT_HOME environment variable must be defined correctly to run this
echo.script outside of the installed Asset Manager deploy directory.
echo.NB: Running this script in this manner is not supported!
echo.
echo.Please define the ANT_HOME environment variable and set it to the
echo.directory where ant is located ^(e.g. SET ANT_HOME=C:\apache\ant^) or run
echo.this script from the Asset Manager deploy directory.
goto end

:end
echo.
endlocal

:abort
