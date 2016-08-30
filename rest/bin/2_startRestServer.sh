#!/bin/bash
SCRIPTPATH=`dirname "$0"`
JAVA_LIB_PATH=$SCRIPTPATH/../x64
CATALINA_HOME=$SCRIPTPATH/../apache-tomcat-8.0.36
CATALINA_BASE=$SCRIPTPATH/../apache-tomcat-8.0.36
export LD_LIBRARY_PATH=$JAVA_LIB_PATH:$LD_LIBRARY_PATH
if [[ -n "$JAVA_HOME" ]] && [[ -x "$JAVA_HOME/bin/java" ]];  then
  BIT=`"$JAVA_HOME/bin/java" -version 2>&1`
  case "$BIT" in
    *64-Bit*)
      version=$("$JAVA_HOME/bin/java" -version 2>&1 | awk -F '"' '/version/ {print $2}')
      if [[ "$version" > "1.7" ]]; then
        CLASS_PATH=$JAVA_HOME/lib/tools.jar:$CATALINA_HOME/bin/bootstrap.jar:$CATALINA_HOME/bin/tomcat-juli.jar
        JAVA_OPTS="-Xms1536M -Xmx1536M"
	    PERMGEN_OPTS="-XX:PermSize=128M"
	    if [[ "$version" > "1.8" ]]; then
	      PERMGEN_OPTS="-XX:MetaspaceSize=128M"
	    fi
        "$JAVA_HOME/bin/java" -cp "$CLASS_PATH" $JAVA_OPTS $PERMGEN_OPTS -Dcatalina.home="$CATALINA_HOME" -Djava.endorsed.dirs="$CATALINA_HOME/common/endorsed" -Dcatalina.base="$CATALINA_BASE" -Djava.io.tmpdir="$CATALINA_BASE/temp" -Djava.library.path="$JAVA_LIB_PATH" org.apache.catalina.startup.Bootstrap -config "$CATALINA_BASE/conf/server.xml" start
      else         
        echo Java version is not 7 or above
      fi
    ;;
    *)
    echo Java is not 64 bit
    ;;
  esac
else
  echo The JAVA_HOME environment variable is not defined correctly
  echo This environment variable is needed to run this program
fi
echo ""
