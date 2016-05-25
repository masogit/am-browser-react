@echo off
set SCRIPTPATH=%~dp0
set JAVA_HOME=C:\SEL\Software\Java\jdk1.7.0_79
set JAVA_LIB_PATH=%SCRIPTPATH%\x64
set tomcat_home=%SCRIPTPATH%\apache-tomcat-8.0.18
set tomcat_ws=%SCRIPTPATH%\apache-tomcat-8.0.18
set CLASS_PATH=%JAVA_HOME%/lib/tools.jar;%tomcat_home%/bin/bootstrap.jar;%tomcat_home%/bin/tomcat-juli.jar;
call "%JAVA_HOME%\bin\java" -cp "%CLASS_PATH%" -Dcatalina.home="%tomcat_home%" -Djava.endorsed.dirs="%tomcat_home%/common/endorsed" -Dcatalina.base="%tomcat_ws%" -Djava.io.tmpdir="%tomcat_ws%/temp" -Djava.library.path="%JAVA_LIB_PATH%" -Xmx1024M org.apache.catalina.startup.Bootstrap -config "%tomcat_ws%/conf/server.xml" start
pause