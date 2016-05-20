@echo off
rem ----------------------------------------------------------------------
rem script for generating the customized and application-sever-specific 
rem deployable archive (war or ear), with the capability of automatically
rem providing the required parameters needed for a successful WebSphere 7
rem deployment
rem 
rem Prerequisites: Java JDK 1.4.x or higher, with the following
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

rem does the user need help?
if ("%1")==("") goto help

rem check for optional switches (/ws7, /nowarn, ,/x64, /help, etc.)
:checkFlags
set _CURRENT_PARAM=%1
rem translate to an absolute path if needed
set _POTENTIAL_FILENAME=%~sf1
set _CURRENT_PARAM=%_CURRENT_PARAM:"= %
if ("x%_CURRENT_PARAM:~0,1%x")==("x x") (
  set _CURRENT_PARAM=!_CURRENT_PARAM:~1!
)
if ("x%_CURRENT_PARAM:~-1%x")==("x x") (
  set _CURRENT_PARAM=!_CURRENT_PARAM:~0,-1!
)

if /i ("%_CURRENT_PARAM%")==("/ws7") (
  set _DEPLOY_WS7=true
  shift
  goto checkFlags
) else if /i ("%_CURRENT_PARAM%")==("/ws8") (
  set _DEPLOY_WS8=true
  shift
  goto checkFlags
) else if /i ("%_CURRENT_PARAM%")==("/wls12c") (
  set _DEPLOY_WLS12C=true
  shift
  goto checkFlags
) else if /i ("%_CURRENT_PARAM%")==("/tc6") (
  set _DEPLOY_TC6=true
  shift
  goto checkFlags
) else if /i ("%_CURRENT_PARAM%")==("/nowarn") (
  set _DONT_WARN=true
  shift
  goto checkFlags
) else if /i ("%_CURRENT_PARAM%")==("/x64") (
  set _DEPLOY_64BIT=true
  shift
  goto checkFlags
) else if /i ("%_CURRENT_PARAM%")==("/64") (
  set _DEPLOY_64BIT=true
  shift
  goto checkFlags
) else if /i ("%_CURRENT_PARAM%")==("/x86") (
  set _DEPLOY_64BIT=false
  shift
  goto checkFlags
) else if /i ("%_CURRENT_PARAM%")==("/32") (
  set _DEPLOY_64BIT=false
  shift
  goto checkFlags
) else if /i ("%_CURRENT_PARAM%")==("/debug") (
  set _DEBUG=true
  shift
  goto checkFlags
) else if /i ("%_CURRENT_PARAM%")==("/o") (
  goto switches
) else if /i ("%_CURRENT_PARAM%")==("/options") (
  goto switches
) else if /i ("%_CURRENT_PARAM%")==("/?") (
  goto help
) else if /i ("%_CURRENT_PARAM%")==("/help") (
  goto help
) else if /i ("%_CURRENT_PARAM:~0,1%")==("/") (
  goto badSwitch
)
:finishedCheckFlags

if ("%_POTENTIAL_FILENAME%")==("") goto help
set _PROP_FILE=%_POTENTIAL_FILENAME%
:checkFileExists
if not exist "%_PROP_FILE%" goto badFile


rem %* may start with a switch so we cannot use it in the ant command line below so
rem we reconstruct the parameters passed into this script
shift
set _CMDLINE_OPTS=
:gatherCmdLineOpts
if /i ("%1")==("") goto doneExaminingCmdLine
set _CURRENT_OPT=%1
rem reconstruct -Dxxx=yyy params (= is a parameter delimiter) and transform ant.tasks.dir to PRI.ant.tasks.dir
if /i ["%_CURRENT_OPT:~0,2%"]==["-D"] (
  if /i ["%_CURRENT_OPT:~0,6%"]==["-Dear."] (
    rem warn the user that ear-related parameters must be specified in the properties file
    goto badEarOpts
  ) else if ""%_CURRENT_OPT%""==""-Dant.tasks.dir"" (
    set _VALUE=%2
    set _CURRENT_OPT=-DPRI.ant.tasks.dir=!_VALUE:\=/!
  ) else (
    set _CURRENT_OPT=!_CURRENT_OPT!=%2
  )
  shift
) else (
  rem warn the user that DOS parameter parsing may have removed commas or semicolons
  goto badCmdLineOpts
)
rem there is a space after the last % !!
set _CMDLINE_OPTS=%_CMDLINE_OPTS%%_CURRENT_OPT% 
shift
goto gatherCmdLineOpts
:doneExaminingCmdLine

rem use the short form of the directory (~s) so that values do not contain spaces
pushd %_SCRIPT_PATH%\..
set _AM_DIR=%CD%
popd
set _JAVAFORMAT_AM_DIR=%_AM_DIR:\=/%
set _JAVAFORMAT_SCRIPT_PATH=%_SCRIPT_PATH:\=/%

set _DIR_FLAG=-DAssetManager.InstallPath=%_JAVAFORMAT_AM_DIR%
set _DEPLOY_ANT_SCRIPT=%_SCRIPT_PATH%deploy.xml
rem try to locate the Asset Manager installation directory
if exist "%_AM_DIR%\bin\aamapi*.dll" (
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
    echo.and that you have ant version 1.7 or higher properly installed. Then
    echo.ensure that proper values are set in the properties file you specify.
    echo.In particular you need to validate the values of the following
    echo.properties ^(if present^):
    echo.
    echo.  ant.tasks.dir      ^(the dir containing the required ant tasks^)
    echo.  addl.files.root    ^(typically the Asset Manager installation dir^)
    echo.  DB.library.path    ^(used only for a web service deployment^)
    echo.                     ^(path cannot be determined automatically^)
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

if ""%_DEPLOY_WS7%""==""true"" (
  set _DEPLOY_OPTS=!_DEPLOY_OPTS! -Dremove.files=true -Dremove.war.files="WEB-INF/lib/xalan.jar,WEB-INF/lib/xercesImpl-2.6.2.jar,WEB-INF/lib/cssparser-0.9.4.jar,WEB-INF/lib/xml-apis-1.3.04.jar,WEB-INF/lib/xmlParserAPIs-2.0.2.jar"
)

if ""%_DEPLOY_64BIT%""==""true"" (
  set _DEPLOY_OPTS=!_DEPLOY_OPTS! -Darch=x64
)

if ""%_DEPLOY_TC6%""==""true"" (
  set _DEPLOY_OPTS=!_DEPLOY_OPTS! -Dtomcat6=true
)

if ""%_DEPLOY_WS8%""==""true"" (
  set _DEPLOY_OPTS=!_DEPLOY_OPTS! -Dws8=true -Dremove.files=true -Dremove.war.files="WEB-INF/lib/cdi-api-1.1.jar,WEB-INF/lib/javax.inject-1.jar,WEB-INF/lib/jsf-api-2.1.20.jar,WEB-INF/lib/jsf-impl-2.1.20.jar,WEB-INF/lib/weld-api-2.0.Final.jar,WEB-INF/lib/weld-core-2.0.0.Final.jar,WEB-INF/lib/weld-servlet-core-2.0.0.Final.jar,WEB-INF/lib/weld-spi-2.0.Final.jar"
)

if ""%_DEPLOY_WLS12C%""==""true"" (
  set _DEPLOY_OPTS=!_DEPLOY_OPTS! -Dwls12c=true -Dremove.files=true -Dremove.war.files="WEB-INF/lib/cdi-api-1.1.jar,WEB-INF/lib/javax.inject-1.jar,WEB-INF/lib/weld-api-2.0.Final.jar,WEB-INF/lib/weld-core-2.0.0.Final.jar,WEB-INF/lib/weld-servlet-core-2.0.0.Final.jar,WEB-INF/lib/weld-spi-2.0.Final.jar"
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
if ""%_DEPLOY_WS7%""==""true"" echo.WebSphere 7 deployment specified (only relevant for ear deployments)
if ""%_DEPLOY_64BIT%""==""true"" echo.64-bit deployment requested
echo.
rem setting ant properties of the same name via command line set the LAST value specified!!
rem any parameters passed in to this script MUST have priority over those calculated in this
rem script, so they are the LAST item specified on the ant command line, other than the ant
rem target
rem The env.properties.file must be specified as a full absolute path which may not be what
rem was passed in to this script, so we use the %_PROP_FILE% parameter calculated above
if ""%_DEBUG%""==""true"" (
  SET _ANT_PARAMS=-debug
) else (
  SET _ANT_PARAMS=-quiet
)
set _CMD_LINE=ant -buildfile %_DEPLOY_ANT_SCRIPT% -emacs -noclasspath %_ANT_PARAMS% -Dtmp="%TEMP:\=/%" -DLibrary.Extension=dll %_DEPLOY_OPTS% %_DIR_FLAG% %_CMDLINE_OPTS% -Denv.properties.file=%_PROP_FILE:\=/% transform.deployment
if ""%_DEBUG%""==""true"" (
  echo.Executing the following command:
  echo.%_CMD_LINE%
)
echo.
%_CMD_LINE%

goto end



rem =========== messaging =================================================

:noJavaHome
echo.The JAVA_HOME environment variable is not defined correctly.
echo.Java JDK 1.4+ and this environment variable are needed to
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

:badCmdLineOpts
echo.A parameter specified on the command line is not a -D{name}={value} type
echo.parameter, which is not supported. Options such as /x64 or /nowarn
echo.must be specified before the properties file name
echo.
echo.This could be due to CMD parameter parsing rules, where CMD removes
echo.commas and semicolons from parameters passed on the command line.
echo.Unfortunately this script cannot reconstruct such parameters.
echo.Any values that you need to specify that contain these characters
echo.must be provided in the properties file.
echo.
echo.Please correct the command line and try again.
goto end

:badEarOpts
echo.A parameter specified on the command line begins with -Dear. which implies
echo.the creation of an ear. All ear-related properties must be set in the
echo.properties files, including the war=xxx properties. Only -Dear=yyyyyy
echo.may be specified on the command line to indicate the ear to create.
echo.
echo.Please correct the command line and try again.
goto end

:badFile
echo.Properties file not found ^("%_PROP_FILE%"^)
echo.

:help
echo.Usage:
echo.        %_SCRIPT_NAME% {options} {property file} {properties}
echo.
echo.where:
echo.   {options}       specifies options to modify script behaviour. Common
echo.                   options are /x86, /x64, /tc6 and /ws7. Specifying options
echo.                   is optional. More information on the available
echo.                   options is available by typing:
echo.
echo.                      %_SCRIPT_NAME% /o
echo.
echo.   {property file} is a mandatory parameter, specifying the customized
echo.                   properties file containing the values to be set in
echo.                   the web.xml file of the war^(s^)/ear being generated.
echo.   {properties}    is an optional list of additional properties that
echo.                   you wish to specify on the command line instead of
echo.                   in the properties file. Properties specified this way
echo.                   override the value of any property of the same name
echo.                   found in the properties file. Each property in this
echo.                   list is specified as -D{name}={value}
echo.For example:
echo.   %_SCRIPT_NAME% /x64 ..\webtier\package.properties
goto end

:badSwitch
echo.An option specified on the command line is not supported ^(%1^)
:switches
echo.The following options are available for use with this script:
echo.
echo.   /x64  /64       perform deployment for 64-bit architectures
echo.
echo.   /x86  /32       perform deployment for 32-bit architectures
echo.                   ^(default if neither 32-bit nor 64-bit is specified^)
echo.
echo.   /ws7            perform a WebSphere 7 deployment
echo.
echo.   /tc6            Designed for tomcat6
echo.
echo.   /nowarn         do not warn if running from outside the Asset Manager
echo.                   installation directory. NB: Running this script in
echo.                   this manner is NOT supported!
echo.
echo.   /o  /options    Display the available options ^(this message^)
echo.
echo.   /?  /help       Display help on the script command-line
goto end


:end
echo.
endlocal

:abort
