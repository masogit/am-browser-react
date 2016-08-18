#!/bin/bash
# ----------------------------------------------------------------------
# Script for generating the customized and application-sever-specific 
# deployable archive (war or ear), with the capability of automatically
# providing the required parameters needed for a successful WebSphere 7
# deployment and 64-bit or 32-bit deployments.
# 
# Prequisites: Java JDK 1.4.x or higher
# 
# -----------------------------------------------------------------------

# deployment constants used in this script
declare -r ANT_SCRIPT_NAME="deploy.xml"
declare -r WS7_DEPLOY_PARAMS="-Dremove.files=true -Dremove.war.files=\"WEB-INF/lib/xalan.jar,WEB-INF/lib/xercesImpl.jar\""
declare -r WS8_DEPLOY_PARAMS="-Dws8=true -Dremove.files=true -Dremove.war.files=\"WEB-INF/lib/cdi-api-1.1.jar,WEB-INF/lib/javax.inject-1.jar,WEB-INF/lib/jsf-api-2.1.20.jar,WEB-INF/lib/jsf-impl-2.1.20.jar,WEB-INF/lib/weld-api-2.0.Final.jar,WEB-INF/lib/weld-core-2.0.0.Final.jar,WEB-INF/lib/weld-servlet-core-2.0.0.Final.jar,WEB-INF/lib/weld-spi-2.0.Final.jar,WEB-INF/lib/cdi-api-1.2.jar,WEB-INF/lib/javax.inject-1.jar,WEB-INF/lib/jboss-el-api_3.0_spec-1.0.0.Final.jar,WEB-INF/lib/jboss-logging-3.2.1.Final.jar,WEB-INF/lib/weld-api-2.3.SP2.jar,WEB-INF/lib/weld-core-2.3.4.Final.jar,WEB-INF/lib/weld-core-impl-2.3.4.Final.jar,WEB-INF/lib/weld-environment-common-2.3.4.Final.jar,WEB-INF/lib/weld-probe-core-2.3.4.Final.jar,WEB-INF/lib/weld-servlet-core-2.3.4.Final.jar,WEB-INF/lib/weld-spi-2.3.SP2.jar\""
declare -r WLS12C_DEPLOY_PARAMS="-Dwls12c=true -Dremove.files=true -Dremove.war.files=\"WEB-INF/lib/cdi-api-1.1.jar,WEB-INF/lib/javax.inject-1.jar,WEB-INF/lib/weld-api-2.0.Final.jar,WEB-INF/lib/weld-core-2.0.0.Final.jar,WEB-INF/lib/weld-servlet-core-2.0.0.Final.jar,WEB-INF/lib/weld-spi-2.0.Final.jar,WEB-INF/lib/cdi-api-1.2.jar,WEB-INF/lib/javax.inject-1.jar,WEB-INF/lib/jboss-el-api_3.0_spec-1.0.0.Final.jar,WEB-INF/lib/jboss-logging-3.2.1.Final.jar,WEB-INF/lib/weld-api-2.3.SP2.jar,WEB-INF/lib/weld-core-2.3.4.Final.jar,WEB-INF/lib/weld-core-impl-2.3.4.Final.jar,WEB-INF/lib/weld-environment-common-2.3.4.Final.jar,WEB-INF/lib/weld-probe-core-2.3.4.Final.jar,WEB-INF/lib/weld-servlet-core-2.3.4.Final.jar,WEB-INF/lib/weld-spi-2.3.SP2.jar\""
declare -r DEPLOY_PARAMS_64BIT="-Darch=x64"
declare -r DEPLOY_PARAMS_TOMCAT6="-Dtomcat6=true"
declare -r LIB_PREFIX="lib"
declare -r LIB_EXT="so"

# exit status codes
declare -r CANCELLED_EXIT_STATUS=1
declare -r ANT_NOT_FOUND_EXIT_STATUS=1
declare -r JAVA_NOT_FOUND_EXIT_STATUS=1
declare -r FILE_OR_DIR_NOT_VALID_EXIT_STATUS=1
declare -r UNSUPPORTED_FLAG_EXIT_STATUS=1
declare -r UNSUPPORTED_PARAM_EXIT_STATUS=1

# dynamically determined script environment constants
declare -r ORIG_PARAMS=("$@")
declare -r SCRIPT_NAME=`basename "$0"`
declare -r SCRIPT_DIR=`dirname "$0"`
if [ "$SCRIPT_DIR" = "." ]; then
  declare -r AM_DIR=".."
else
  AM_DIR=`dirname "$SCRIPT_DIR"`
fi
declare -r AM_INSTALL_PATH="`cd $AM_DIR; pwd`"
declare -r AM_ANT_LIB_PATH="`cd $SCRIPT_DIR; pwd`/lib"

# decision variables
declare -i WARN_ON_FOREIGN_DIR=1         # by default we warn on unsupported usage
declare -i DO_WS7=0                      # by default this is not a WebSphere 7 deployment
declare -i DO_WS8=0                      # by default this is not a WebSphere 8 deployment
declare -i DO_WLS12C=0                      # by default this is not a Weblogic 12c deployment
declare -i DO_TC6=0                      # by default this is not a Tomcat 6 deployment
declare -i DO_X64=0                      # by default this is not a 64bit deployment
declare -i DEBUG=0

# collect flags and command-line parameters
parseCommandLine() {
  for opt  
  do
    if [ "$opt" = "-help" ] || [ "$opt" = "-h" ]; then
      displayHelp
      exit 0
    elif [ "$opt" = "-u" ]; then
      displayInvocationFlags
      exit 0
    elif [ "$opt" = "-ux" ]; then
      displayInvocationFlags
      displayAdvancedInvocationFlags
      exit 0
    elif [ "$opt" = "-ws7" ]; then
      # doing websphere 7 deployment
      DO_WS7=1
    elif [ "$opt" = "-ws8" ]; then
      # doing websphere 8 deployment
      DO_WS8=1
    elif [ "$opt" = "-wls12c" ]; then
      # doing weblogic 12c deployment
      DO_WLS12C=1
    elif [ "$opt" = "-tc6" ]; then
      # doing tomcat 6 deployment
      DO_TC6=1
    elif [ "$opt" = "-x64" ] || [ "$opt" = "-64" ]; then
      # doing websphere 7 deployment
      DO_X64=1
      ARCH_SPEC=$ARCH_SPEC+1
    elif [ "$opt" = "-x86" ] || [ "$opt" = "-32" ]; then
      # doing websphere 7 deployment
      DO_X64=0
      ARCH_SPEC=$ARCH_SPEC+1
    elif [ "$opt" = "-nowarn" ]; then
      # don't warn if we're not in the Asset Manager installation directory
      WARN_ON_FOREIGN_DIR=0
    elif [ "$opt" = "-debug" ]; then
      DEBUG=1
    elif [ "$opt" = "--" ]; then
      # done
      shift
      break
    elif [ "`expr match $opt '^\(-D\)..*=..*'`" = "-D" ]; then
      reportMisplacedParam "$opt"
      exit $UNSUPPORTED_FLAG_EXIT_STATUS
    elif [ "`expr match $opt '^\(-\).*'`" = "-" ]; then
      reportUnsupportedFlag "$opt"
      exit $UNSUPPORTED_FLAG_EXIT_STATUS
    else
      # done
      break
    fi
    shift #must be performed (even though we are using the opt variable) so that we can analyze the remainder of the line later
  done
  if (( ARCH_SPEC > 1 )); then
    reportDoubledFlags
    exit $UNSUPPORTED_FLAG_EXIT_STATUS
  fi
  # there needs to be a file specified at this point
  if [ -z "$1" ]; then
    displayHelp
    exit $FILE_NOT_FOUND_EXIT_STATUS
  fi
  DEPLOY_FILE_DIR=`dirname "$1"`
  if [ -d "$DEPLOY_FILE_DIR" ]; then
    DEPLOY_FILE_DIR=`cd "$DEPLOY_FILE_DIR"; pwd`
  fi
  DEPLOY_FILE="$DEPLOY_FILE_DIR/`basename \"$1\"`"

  if [ ! -f "$DEPLOY_FILE" ] || [ ! -r "$DEPLOY_FILE" ]; then
    reportFileNotValid "$1"
    exit $FILE_OR_DIR_NOT_VALID_EXIT_STATUS
  fi

  shift
  USER_SPECIFIED_PARAMS=
  for opt
  do
    # ensure this is a properly formed parameter specification (-Dname=value)
    if [ ! "`expr match \"$opt\" '^\(-D\)..*=..*'`" = "-D" ]; then
      # check to see if this is perhaps a misplaced invocation flag (-[dhnuwx63-].*)
      if [ "`expr match \"$opt\" '^\(-\)[dhnuwx63-].*'`" = "-" ]; then
        reportMisplacedFlag "$opt"
      else
        reportUnsupportedParam "$opt"
      fi
      exit $UNSUPPORTED_PARAM_EXIT_STATUS
    elif [ "`expr match $opt '^\(-Dear\.\).*'`" = "-Dear." ]; then
      reportUnsupportedEarParam "$opt"
      exit $UNSUPPORTED_PARAM_EXIT_STATUS
    else
      # replace any -Dant.tasks.dir with -DPRI.ant.tasks.dir for proper functioning
      THIS_PARAM=${opt/-Dant.tasks.dir=/-DPRI.ant.tasks.dir=}
      # replace all spaces with backslash-space (\ )
      THIS_PARAM=${THIS_PARAM// /\\ }
      USER_SPECIFIED_PARAMS="$USER_SPECIFIED_PARAMS $THIS_PARAM"
    fi
    shift # just in case we add further checks below
  done
}

displayHelp() {
  echo ""
  echo "Usage:"
  echo "  ./$SCRIPT_NAME {flags} {property file} {properties}"
  echo ""
  echo "where:"
  echo "  {flags}         optional flags that modify script behaviour. Common"
  echo "                  options are -x86, -x64 and -ws7. More information "
  echo "                  on the available flags is available by typing:"
  echo ""
  echo "                     ./$SCRIPT_NAME -u"
  echo ""
  echo "  {property file} is a mandatory parameter specifying the customized"
  echo "                  properties file containing the values to be set in"
  echo "                  the web.xml file of the war(s)/ear being generated"
  echo "  {properties}    is an optional list of additional properties that"
  echo "                  you wish to specify on the command line instead of"
  echo "                  in the properties file. Properties specified this"
  echo "                  way override the value of any property of the same"
  echo "                  name in the properties file. Each property in this"
  echo "                  list is specified as -D{name}={value}"
  echo "For example:"
  echo "  ./$SCRIPT_NAME -x64 ../webtier/package.properties"
  echo ""
}

displayInvocationFlags() {
  echo ""
  echo "   -ws7            Perform a WebSphere 7 deployment"
  echo ""
  echo "   -x64  -64       Perform deployment for 64-bit architectures"
  echo ""
  echo "   -x86  -32       Perform deployment for 32-bit architectures"
  echo "                   (default if neither 32-bit nor 64-bit is specified)"
  echo ""
  echo "   --              Indicates the end of flags, useful if the properties"
  echo "                   file name or path begins with a -"
  echo ""
  echo "   -h  --help      Display help on the script command-line"
  echo ""
  echo "   -u              Display this invocation flags message"
  echo ""
  echo "   -ux             Also display advanced invocation flags"
  echo ""
}

displayAdvancedInvocationFlags() {
  echo "   -debug          Display additional information for script debugging"
  echo ""
  echo "   -nowarn         Do not warn if running from outside the Asset Manager"
  echo "                   installation directory. NB: Running this script in"
  echo "                   this manner is NOT supported!"
  echo ""
}

reportUnsupportedFlag() {
  echo ""
  echo "The flag \"$1\" is not supported. A list of supported invocation"
  echo "flags is available by typing:"
  echo ""
  echo "   $SCRIPT_NAME -u"
  echo ""
  echo "Help on the script command-line parameters is available by typing:"
  echo ""
  echo "   $SCRIPT_NAME -h"
  echo ""
}

reportMisplacedParam() {
  echo ""
  echo "The parameter \"$1\" is misplaced. All parameters must be specified"
  echo "after the properties file."
  echo ""
  echo "Help on the script command-line parameters is available by typing:"
  echo ""
  echo "   $SCRIPT_NAME -h"
  echo ""
}

reportMisplacedFlag() {
  echo ""
  echo "The invocation flag \"$1\" is misplaced. All invocation flags must"
  echo "appear before the properties file and before the invocation flag \"--\"."
  echo ""
  echo "Help on the script command-line parameters is available by typing:"
  echo ""
  echo "   $SCRIPT_NAME -h"
  echo ""
}

reportDoubledFlags() {
  echo ""
  echo "The flag specifying the architecture to deploy may only be specified once."
  echo ""
}

reportUnsupportedParam() {
  echo ""
  echo "The parameter \"$1\" is not valid."
  echo "Only parameters having the form -D{name}={value} are supported."
  echo ""
  echo "Please correct the command line and try again."
  echo ""
}

reportUnsupportedEarParam() {
  echo ""
  echo "The parameter \"$1\" is implies the creation of an ear."
  echo "All ear-related parameters must be specified in the properties"
  echo "files, including the war=xxx properties. Only -Dear=yyyyyy may"
  echo "be specified on the command line to indicate the ear to create."
  echo ""
  echo "Please correct the command line and try again."
  echo ""
}

reportJavaNotFound() {
  echo ""
  echo "Java could not be located. A JRE or JDK of version 1.4 or greater needs"
  echo "to be installed and the environment variable JAVA_HOME should be set"
  echo "before running this script."
  echo ""
}

reportAntNotFound() {
  echo ""
  echo "The location of ant could not be determined."
  echo ""
  echo "Version 1.7 or greater of ant must be installed to run this"
  echo "script outside of the installed Asset Manager deploy directory."
  echo "NB: Running this script in this manner is not supported!"
  echo ""
  echo "Please define the ANT_HOME environment variable and set it to"
  echo "the directory in which ant is located (e.g. /opt/ant) or run"
  echo "this script from the Asset Manger deploy directory."
  echo ""
}

reportFileNotValid() {
  echo ""
  echo "The file you specified could not be located or is not a valid accessible file"
  echo "($1)"
  echo ""
}

checkForAMInstallation() {
  # The libaamapi*.so exists in the bin subdirectory of an installation, so we check that
  # to verify that we are indeed working from the installed copy. Otherwise we warn of
  # possible changes that may be required for the script to operate properly
  if [ ! -f "$AM_INSTALL_PATH"/x64/libaamapi*.so ] && (( $WARN_ON_FOREIGN_DIR )); then
    echo ""
    echo "WARNING! The script you are using is not located in the Asset Manager"
    echo "installation directory. This usage is NOT supported and will likely fail!"
    echo ""
    echo "Before continuing you should ensure that proper values are set in the"
    echo "properties file you specified. In particular you need to validate"
    echo "the values of the following properties:"
    echo ""
    echo "  ant.tasks.dir      (the dir containing the required ant tasks)"
    echo "  addl.files.root    (typically the Asset Manager installation dir)"
    echo "  DB.library.path    (used only for a web service deployment)"
    echo "                     (cannot be determined automatically)"
    echo ""
    echo "Ensure also that the deploy.xml file is in the same directory as this"
    echo "script and that you have ant version 1.7 or higher properly installed"
    echo "with the ANT_HOME environment variable set."
    echo ""
    echo "To avoid this message in the future, use the -nowarn flag before any"
    echo "other command line option."
    echo ""
    read -rs -n 1 -p "Press C to continue with this script "
    echo ""
    if [ ! "$REPLY" = "C" ] && [ ! "$REPLY" = "c" ]; then
      echo ""
      exit $CANCELLED_EXIT_STATUS
    fi
    SCRIPT_ADDED_PARAMS="-DAssetManager.InstallPath=${AM_INSTALL_PATH// /\\ }"
    ANT_SCRIPT_FILE="$ANT_SCRIPT_NAME"
  else
    SCRIPT_ADDED_PARAMS="-DPRI.ant.tasks.dir=${AM_ANT_LIB_PATH// /\\ } -Daddl.files.root=${AM_INSTALL_PATH// /\\ } -DAssetManager.InstallPath=${AM_INSTALL_PATH// /\\ }"
    ANT_SCRIPT_FILE="$SCRIPT_DIR/$ANT_SCRIPT_NAME"
  fi
}

checkTmpDir() {
  # a temporary directory is used to unwip the war, so we need to make sure one is specified and
  # that it is writeable from within the script
  if [ "$TMPDIR" = "" ]; then
    TMPDIR="/tmp"
  fi
  if [ ! -d "$TMPDIR" ] || [ ! -w "$TMPDIR" ]; then
    echo ""
    echo "WARNING! The temporary directory either does not exist or is not writable."
    echo "Please ensure that the environment variable TMPDIR is set to an existing"
    echo "writeable directory."
    echo ""
    exit $FILE_OR_DIR_NOT_VALID_EXIT_STATUS
  fi
}

checkJavaAndAnt() {
  # if an external ant installation is used, it should be 1.7+. The version 1.6.5
  # provided with the AM installation contains a required regex jar for proper
  # functioning.
  if [ -n "$ANT_HOME" ]; then
    ANT_VER="`$ANT_HOME/bin/ant -version`"
    declare -i ANT_17_SPECIFIED="`expr match \"$ANT_VER\" 'version 1\.[7-9]'`"
  else
    ANT_VER="`ant -version 2>&1`"
    declare -i ANT_17_INSTALLED="`expr match \"$ANT_VER\" 'version 1\.[7-9]'`"
    declare -i ANT_17_SPECIFIED=1
  fi

  # the java version used must be at least version v1.4 to provide the required regular expression capabilities
  if [ -n "$JAVA_HOME" ]; then
    JAVA_VER="`$JAVA_HOME/bin/java -version 2>&1`"
  else
    JAVA_VER="`java -version 2>&1`"
  fi
  declare -i JAVA_INSTALLED="`expr match \"$JAVA_VER\" '1\.[4-7]'`"
}

deploy() {
  if (( DO_WS7 )); then
    SCRIPT_ADDED_PARAMS="$SCRIPT_ADDED_PARAMS $WS7_DEPLOY_PARAMS"
    echo "WebSphere 7 deployment specified (only relevant for ear deployments)"
  fi
  if (( DO_WS8 )); then
    SCRIPT_ADDED_PARAMS="$SCRIPT_ADDED_PARAMS $WS8_DEPLOY_PARAMS"
    echo "WebSphere 8 deployment specified"
  fi
  if (( DO_WLS12C )); then
    SCRIPT_ADDED_PARAMS="$SCRIPT_ADDED_PARAMS $WLS12C_DEPLOY_PARAMS"
    echo "Weblogic 12c deployment specified"
  fi
  if (( DO_TC6 )); then
    SCRIPT_ADDED_PARAMS="$SCRIPT_ADDED_PARAMS $DEPLOY_PARAMS_TOMCAT6"
  fi
  if (( DO_X64 )); then
    SCRIPT_ADDED_PARAMS="$SCRIPT_ADDED_PARAMS $DEPLOY_PARAMS_64BIT"
    echo "64-bit deployment requested"
  fi
  SCRIPT_ADDED_PARAMS="-Dtmp=$TMPDIR -DLibrary.Extension=$LIB_EXT -DLibrary.Prefix=$LIB_PREFIX $SCRIPT_ADDED_PARAMS"
  if (( DEBUG )); then
    ANT_PARAMS="-debug"
  else
    ANT_PARAMS="-quiet"
  fi
  CMD_LINE="$1 -emacs --noconfig $ANT_PARAMS -f \"$ANT_SCRIPT_FILE\" -Denv.properties.file=\"$DEPLOY_FILE\" $SCRIPT_ADDED_PARAMS $USER_SPECIFIED_PARAMS transform.deployment"
  if (( DEBUG )); then
    echo "Executing the following command:"
    echo "$CMD_LINE"
    echo "with CLASSPATH=$CLASSPATH"
  fi
  if (( DO_WS7 )) || (( DO_WS8 )) || (( DO_WLS12C )) || (( DO_X64 )) || (( DEBUG )); then
    echo ""
  fi
  $CMD_LINE
}

parseCommandLine "$@"
checkForAMInstallation
checkTmpDir
checkJavaAndAnt

echo ""
if (( JAVA_INSTALLED != 0 )); then
  reportJavaNotFound
  exit $JAVA_NOT_FOUND_EXIT_STATUS
elif [ -f "$SCRIPT_DIR/ant/bin/ant" ]; then
  # RH does not properly see the included regex jar, so we set the classpath explicitly
  export CLASSPATH=$CLASSPATH:$SCRIPT_DIR/ant/lib/jakarta-oro-2.0.8.jar
  deploy "$SCRIPT_DIR/ant/bin/ant" "$ANT_PROPERTIES"
elif (( ANT_17_SPECIFIED == 0 )); then
  deploy "$ANT_HOME/bin/ant" "$ANT_PROPERTIES"
elif (( ANT_17_INSTALLED == 0 )); then
  deploy "ant" "$ANT_PROPERTIES"
else
  reportAntNotFound
  exit $ANT_NOT_FOUND_EXIT_STATUS
fi  
echo ""
