#!/bin/bash
SCRIPTPATH=`dirname "$0"`
JAVA_LIB_PATH=$SCRIPTPATH/../x64
CATALINA_HOME=$SCRIPTPATH/../apache-tomcat-8.0.36
CATALINA_BASE=$SCRIPTPATH/../apache-tomcat-8.0.36
CLASS_PATH=$JAVA_HOME/lib/tools.jar:$CATALINA_HOME/bin/bootstrap.jar:$CATALINA_HOME/bin/tomcat-juli.jar
JAVA_OPTS="-Xms1536M -Xmx1536M"
"$JAVA_HOME/bin/java" -cp "$CLASS_PATH" $JAVA_OPTS -Dcatalina.home="$CATALINA_HOME" -Djava.endorsed.dirs="$CATALINA_HOME/common/endorsed" -Dcatalina.base="$CATALINA_BASE" -Djava.io.tmpdir="$CATALINA_BASE/temp" -Djava.library.path="$JAVA_LIB_PATH" org.apache.catalina.startup.Bootstrap -config "$CATALINA_BASE/conf/server.xml" start
echo ""